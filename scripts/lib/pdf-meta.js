// 誌面の下の余白（フッター）から「号数・発行日・頁」を読む（2026-09-29）
//
// ■ 誌面のフッターには全ページに「保育通信■No.859 2026. 10. 1. 34」のように入っている。
//   目次は要らない（目次の頁番号は特殊なフォントで値が読めない＝9/15 に確認済み）。
// ■ 読み方
//   pdftotext -bbox（位置つきで文字を取り出す。Homebrew の poppler に入っている）で
//   各ページの下 1 割の帯だけを見て、
//     「No.」の直後の3〜4桁 → 号数／「2026. 10. 1.」→ 発行日／ページの端に寄った1〜3桁の数字 → 頁
//   を拾う。PDF のページが逆順のもの（1ページ目が記事の最後の頁）があるので、頁は最小〜最大で取る。
// ■ 読めない回（生成AIヒナリーは誌面に頁番号がない）は空のまま返す＝推測しない。

import { execFileSync } from 'child_process'

let pdftotextChecked = null
export function hasPdftotext() {
    if (pdftotextChecked !== null) return pdftotextChecked
    try {
        execFileSync('pdftotext', ['-v'], { stdio: 'ignore' })
        pdftotextChecked = true
    } catch {
        pdftotextChecked = false
    }
    return pdftotextChecked
}

function decodeEntities(s) {
    return s
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
}

// pdftotext -bbox の出力を、ページごとの単語の並び（位置つき）にする
function parseBbox(html) {
    const pages = []
    let current = null
    for (const line of html.split('\n')) {
        const p = line.match(/<page width="([\d.]+)" height="([\d.]+)"/)
        if (p) {
            current = { width: parseFloat(p[1]), height: parseFloat(p[2]), words: [] }
            pages.push(current)
            continue
        }
        const w = line.match(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*)<\/word>/)
        if (w && current) {
            current.words.push({
                xMin: parseFloat(w[1]),
                yMin: parseFloat(w[2]),
                xMax: parseFloat(w[3]),
                yMax: parseFloat(w[4]),
                // 語の中に制御文字（\u0007 など）が挟まることがある＝空白に置き換えてから読む
                // eslint-disable-next-line no-control-regex
                text: decodeEntities(w[5]).replace(/[\u0000-\u001f]/g, ' ').normalize('NFKC'),
            })
        }
    }
    return pages
}

// 1ページ分のフッターを読む → { issueNo, date, folio }（読めない項目は null）
function readFooter(page) {
    // 下 1 割の帯から「No.」を含む語を探し、その語と同じ行（高さの差 3pt 以内）だけをフッターとして読む
    //   ＝本文の最終行が帯にかかっていても混ざらない
    const lower = page.words.filter((w) => w.yMin > page.height * 0.9)
    const anchor = lower.find((w) => /No\./.test(w.text))
    if (!anchor) return null // 「No.」が無い帯は誌面のフッターではない
    const band = lower
        .filter((w) => Math.abs(w.yMin - anchor.yMin) <= 3)
        .sort((a, b) => a.xMin - b.xMin)

    let issueNo = null
    let noIndex = -1
    for (let i = 0; i < band.length; i++) {
        const t = band[i].text
        const joined = t.match(/No\.?\s*(\d{3,4})\b/)
        if (joined) {
            issueNo = parseInt(joined[1], 10)
            noIndex = i
            break
        }
        if (/No\.?$/.test(t) && band[i + 1] && /^\d{3,4}$/.test(band[i + 1].text)) {
            issueNo = parseInt(band[i + 1].text, 10)
            noIndex = i + 1
            break
        }
    }
    if (issueNo === null) return null // 「No.」が無い帯は誌面のフッターではない

    const text = band.map((w) => w.text).join(' ')
    const d = text.match(/(20\d{2})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?/)
    const date = d ? `${d[1]}-${d[2].padStart(2, '0')}-${d[3].padStart(2, '0')}` : null

    // 頁＝数字だけの語で、号数そのものではなく、ページの左右の端に寄っているもの
    const candidates = band.filter(
        (w, i) =>
            i !== noIndex &&
            /^\d{1,3}$/.test(w.text) &&
            (w.xMin < page.width * 0.2 || w.xMax > page.width * 0.8),
    )
    let folio = null
    if (candidates.length > 0) {
        const edgeDistance = (w) => Math.min(w.xMin, page.width - w.xMax)
        candidates.sort((a, b) => edgeDistance(a) - edgeDistance(b))
        folio = parseInt(candidates[0].text, 10)
    }
    return { issueNo, date, folio }
}

// 1本のPDFを読む → { issueNo, date, pageStart, pageEnd, pages, folios }
export function extractPdfMeta(pdfPath) {
    const out = { issueNo: null, date: null, pageStart: null, pageEnd: null, pages: 0, folios: [] }
    if (!hasPdftotext()) return out
    let html
    try {
        html = execFileSync('pdftotext', ['-bbox', pdfPath, '-'], {
            encoding: 'utf8',
            maxBuffer: 64 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'ignore'],
        })
    } catch {
        return out
    }
    const pages = parseBbox(html)
    out.pages = pages.length
    const issueCount = new Map()
    const dateCount = new Map()
    for (const page of pages) {
        const f = readFooter(page)
        if (!f) {
            out.folios.push(null)
            continue
        }
        issueCount.set(f.issueNo, (issueCount.get(f.issueNo) || 0) + 1)
        if (f.date) dateCount.set(f.date, (dateCount.get(f.date) || 0) + 1)
        out.folios.push(f.folio)
    }
    const mostCommon = (m) => [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    out.issueNo = mostCommon(issueCount)
    out.date = mostCommon(dateCount)

    const known = out.folios
        .map((n, i) => [i, n])
        .filter(([, n]) => Number.isInteger(n))
    if (known.length === 0) return out

    // 頁番号の無いページ（見開きの写真ページなど）は、読めたページから連番で埋める。
    //   読めた頁が2つ以上なら、その並び（昇順／逆順）がPDFのページ順と1対1で合うときだけ埋める。
    //   1つだけなら昇順とみなす（9/15 に目次の並びと突き合わせて一致した作法）。
    let dir = 1
    if (known.length >= 2) {
        const [i0, n0] = known[0]
        const [i1, n1] = known[1]
        dir = Math.sign((n1 - n0) / (i1 - i0)) || 1
    }
    const [iA, nA] = known[0]
    const linear = known.every(([i, n]) => n === nA + dir * (i - iA))
    let nums = known.map(([, n]) => n)
    if (linear && known.length < out.pages) {
        nums = out.folios.map((_, i) => nA + dir * (i - iA))
        out.pagesInferred = true
    }
    out.pageStart = Math.min(...nums)
    out.pageEnd = Math.max(...nums)
    return out
}
