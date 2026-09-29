// 毎月の取り込み（2026-09-29 に作り直し）
//
//   使い方:  draft_pdfs/ に記事PDFを入れて  node scripts/generate-csv.js
//
// やること
//   1. draft_pdfs/ のPDFを public/pdfs/ へ移す（ファイル名は濁点の文字コードを合成形にそろえる）＋ git add
//   2. 誌面のフッターから号・頁を読んで data/pdf-meta.json に足す＋ git add
//   3. 公開スプレッドシートを読みに行き、まだ行の無いPDFについて「貼るだけの行」を作る
//        → output/追加行_YYYYMMDD.tsv（見出しなし・タブ区切り＝スプレッドシートの空き行の A 列に貼る）
//      著者・かな・カテゴリは、同じ連載の直近の行・同じ著者の行から引き継ぐ（推測では埋めない）。
//      引き継げなかった欄は空にして、画面に ⚠️ を出す。
//
// ⛔ 以前の版はスプレッドシート全体（全行）を書き出していた。全行を貼り直すと、
//    整えた題・著者・かなが「不明」「あ」に戻るので、新しい行だけを出す形に変えた。
//
// 公開（GitHub へ送る）はこのスクリプトではしない。

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import Papa from 'papaparse'
import { fileKey, pdfKeyFromUrl } from '../src/lib/pdfPath.js'
import { parsePdfFilename } from './lib/filename.js'
import { ROOT, PDF_DIR, META_FILE, loadMeta, refreshMeta, listPdfs } from './lib/meta-store.js'
import { SHEET_CSV_URL } from '../src/lib/sheet.js'

const INBOX_DIR = path.join(ROOT, 'draft_pdfs')
const OUTPUT_DIR = path.join(ROOT, 'output')
const PDF_REL_DIR = 'pdfs/' // サイトからの相対パスで書く（移管してもシートを書き換えなくてよい・9/8）

function gitAdd(p) {
    try {
        execFileSync('git', ['add', '--', p], { cwd: ROOT, stdio: 'ignore' })
        return true
    } catch {
        return false
    }
}

function moveDrafts() {
    fs.mkdirSync(INBOX_DIR, { recursive: true })
    fs.mkdirSync(PDF_DIR, { recursive: true })
    const drafts = fs.readdirSync(INBOX_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'))
    const existing = new Set(listPdfs().map(fileKey))
    const moved = []
    for (const f of drafts) {
        const name = fileKey(f)
        if (existing.has(name)) {
            console.log(`  - ⏭ すでにあるので移さない: ${name}`)
            continue
        }
        const to = path.join(PDF_DIR, name)
        fs.renameSync(path.join(INBOX_DIR, f), to)
        const ok = gitAdd(path.join('public', 'pdfs', name))
        console.log(`  - ${ok ? '🚀 移動＆Git登録' : '⚠️ 移動（Git登録に失敗）'}: ${name}`)
        moved.push(name)
    }
    return moved
}

async function fetchSheetRows() {
    const res = await fetch(SHEET_CSV_URL)
    if (!res.ok) throw new Error(`スプレッドシートを読めませんでした（${res.status}）`)
    const text = await res.text()
    return Papa.parse(text, { header: true, skipEmptyLines: true }).data
}

// 同じ連載の直近の行・同じ著者の行から、著者名・かな・カテゴリを引き継ぐ
function buildResolver(rows) {
    const bySeries = new Map() // 連載名 → { id, pdf, rows }＝直近の回の行（複数著者なら複数行）
    const byAuthor = new Map() // 著者名 → かな
    for (const r of rows) {
        if (r.author) byAuthor.set(r.author.trim(), (r.author_kana || '').trim())
        const key = pdfKeyFromUrl(r.pdf_url)
        if (!key) continue
        const series = parsePdfFilename(key).series
        const id = parseInt(r.id, 10) || 0
        const cur = bySeries.get(series)
        if (cur && cur.pdf === key) {
            cur.rows.push(r)
            cur.id = Math.max(cur.id, id)
        } else if (!cur || id > cur.id) {
            bySeries.set(series, { id, pdf: key, rows: [r] })
        }
    }
    const authorNames = [...byAuthor.keys()]

    function resolveAuthor(short, seriesRows) {
        const s = short.trim()
        // 1) 同じ名前がそのままある
        if (byAuthor.has(s)) return { author: s, kana: byAuthor.get(s), from: 'author' }
        // 2) 姓だけ（「普光院」）→ 姓の一致する著者が1人だけなら
        const fam = authorNames.filter((a) => a.split(/\s+/)[0] === s)
        if (fam.length === 1) return { author: fam[0], kana: byAuthor.get(fam[0]), from: 'family' }
        // 3) 部署名（「調査部」）→ 全私保連◯◯部
        const org = authorNames.filter((a) => a.startsWith('全私保連') && a.endsWith(s))
        if (org.length === 1) return { author: org[0], kana: byAuthor.get(org[0]), from: 'org' }
        // 4) 同じ連載の前回の著者に姓が一致する人
        const prev = (seriesRows || []).map((r) => r.author).filter((a) => a && a.startsWith(s))
        if (prev.length === 1) return { author: prev[0], kana: byAuthor.get(prev[0]) || '', from: 'series' }
        return { author: s, kana: '', from: null }
    }

    return { bySeries, resolveAuthor }
}

function formatSheetDate(iso) {
    if (!iso) return ''
    const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10))
    return `${y}/${m}/${d}`
}

async function main() {
    console.log('📥 draft_pdfs/ から public/pdfs/ へ移します')
    const moved = moveDrafts()
    if (moved.length === 0) console.log('  （新しいPDFはありません）')

    console.log('\n🔎 誌面のフッターから号・頁を読みます')
    const report = refreshMeta({ only: moved.length ? moved : null })
    if (report.noTool) console.log('  ⚠️ pdftotext が無いので号・頁は空のまま（brew install poppler で入る）')
    for (const k of report.failed) console.log(`  - ⚠️ 号・頁が読めない: ${k}`)
    gitAdd(path.relative(ROOT, META_FILE))
    const meta = loadMeta()

    console.log('\n📄 公開スプレッドシートと突き合わせます')
    let rows
    try {
        rows = await fetchSheetRows()
    } catch (e) {
        console.error(`  ⚠️ ${e.message} → 貼る行は作れませんでした（PDFの移動と号・頁は済んでいます）`)
        return
    }
    const inSheet = new Set(rows.map((r) => pdfKeyFromUrl(r.pdf_url)).filter(Boolean))
    const missing = listPdfs()
        .map(fileKey)
        .filter((k) => !inSheet.has(k))
        .sort((a, b) => {
            const ma = meta.files[a] || {}
            const mb = meta.files[b] || {}
            return (ma.issueYm || '').localeCompare(mb.issueYm || '') || (ma.pageStart ?? 999) - (mb.pageStart ?? 999)
        })
    if (missing.length === 0) {
        console.log('  ✅ すべてのPDFにスプレッドシートの行があります（貼る行はありません）')
        return
    }

    const { bySeries, resolveAuthor } = buildResolver(rows)
    let nextId = Math.max(0, ...rows.map((r) => parseInt(r.id, 10) || 0)) + 1
    const out = []
    const notes = []

    for (const key of missing) {
        const info = parsePdfFilename(key)
        const m = meta.files[key] || {}
        const prev = bySeries.get(info.series)
        const category = prev?.rows[0]?.category || 'その他'
        const authors = info.authors.length ? info.authors : ['']
        for (const short of authors) {
            const a = short ? resolveAuthor(short, prev?.rows) : { author: '', kana: '', from: null }
            const row = {
                id: String(nextId++),
                title: info.title,
                author: a.author,
                author_kana: a.kana,
                category,
                cover_url: '',
                pdf_url: PDF_REL_DIR + key,
                description: `${key.replace(/\.pdf$/i, '')}のPDFドキュメントです。`,
                publish_date: formatSheetDate(m.date) || (m.issueYm ? formatSheetDate(`${m.issueYm}-01`) : ''),
            }
            out.push(row)
            const flags = []
            if (!a.author) flags.push('著者なし')
            else if (!a.kana) flags.push('かなが空（新しい著者）')
            if (!prev) flags.push('新しい連載・単発＝カテゴリは「その他」で仮置き')
            if (!m.issueNo) flags.push('号が読めない')
            notes.push({ row, flags })
        }
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const tsvPath = path.join(OUTPUT_DIR, `追加行_${stamp}.tsv`)
    const cols = ['id', 'title', 'author', 'author_kana', 'category', 'cover_url', 'pdf_url', 'description', 'publish_date']
    const tsv = out.map((r) => cols.map((c) => String(r[c] ?? '').replace(/[\t\n]/g, ' ')).join('\t')).join('\n') + '\n'
    fs.writeFileSync(tsvPath, tsv, 'utf8')

    console.log(`  ➕ スプレッドシートに無いPDF ${missing.length}本 → 貼る行 ${out.length}行`)
    for (const { row, flags } of notes) {
        console.log(
            `    ${row.id}  ${row.title}｜${row.author || '—'}｜${row.author_kana || '（空）'}｜${row.category}` +
                (flags.length ? `  ⚠️ ${flags.join('・')}` : ''),
        )
    }
    console.log('--------------------------------------------------')
    console.log(`■ 貼り方: ${path.relative(ROOT, tsvPath)} をテキストエディタで開いて全部コピー`)
    console.log('  → スプレッドシートの最終行の下、A列のセルを選んで貼り付け（見出し行は入っていません）')
    console.log('  → ⚠️ の行だけ目で見て直す')
    console.log('--------------------------------------------------')
}

main().catch((e) => {
    console.error('エラーが発生しました:', e)
    process.exit(1)
})
