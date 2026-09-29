// 点検（公開の前に1回）  npm run check （2026-09-29）
//
// 公開スプレッドシートと public/pdfs・data/pdf-meta.json を突き合わせて、
//   ① リンク切れになる行（シートの行が指すPDFがサイトに無い）
//   ② シートに行の無いPDF（載せたのに一覧に出ない）
//   ③ 号・頁の読めていないPDF
//   ④ id の重複・かなの空欄
// を並べる。直すのは人（スプレッドシート）・スクリプトは列挙まで。

import { execFileSync } from 'child_process'
import Papa from 'papaparse'
import { fileKey, pdfKeyFromUrl } from '../src/lib/pdfPath.js'
import { SHEET_CSV_URL } from '../src/lib/sheet.js'
import { ROOT, loadMeta, listPdfs } from './lib/meta-store.js'

// git に登録済み（コミット済み＋git add 済み）のPDF＝公開（push）したときにサイトに載るもの
function gitPdfs(args) {
    const out = execFileSync('git', ['ls-files', '-z', ...args, '--', 'public/pdfs'], { cwd: ROOT }) // Mac では濁点の形を git がそろえて読む（既定の設定のまま）
    return out
        .toString('utf8')
        .split('\0')
        .filter((p) => p.toLowerCase().endsWith('.pdf'))
        .map((p) => fileKey(p.split('/').pop()))
}

async function main() {
    const res = await fetch(SHEET_CSV_URL)
    if (!res.ok) throw new Error(`スプレッドシートを読めませんでした（${res.status}）`)
    const rows = Papa.parse(await res.text(), { header: true, skipEmptyLines: true }).data.filter((r) => r.title)
    const files = new Set(listPdfs().map(fileKey))
    const tracked = new Set(gitPdfs([]))
    const untracked = gitPdfs(['--others', '--exclude-standard'])
    const meta = loadMeta()

    const broken = rows.filter((r) => {
        const k = pdfKeyFromUrl(r.pdf_url)
        return k && !tracked.has(k)
    })
    const inSheet = new Set(rows.map((r) => pdfKeyFromUrl(r.pdf_url)).filter(Boolean))
    const noRow = [...files].filter((k) => !inSheet.has(k))
    const noIssue = [...files].filter((k) => !meta.files[k]?.issueNo)
    const noPage = [...files].filter((k) => meta.files[k]?.issueNo && !meta.files[k]?.pageStart)
    const ids = new Map()
    for (const r of rows) ids.set(r.id, (ids.get(r.id) || 0) + 1)
    const dupIds = [...ids.entries()].filter(([, n]) => n > 1).map(([id]) => id)
    const noKana = rows.filter((r) => r.author && !r.author_kana)

    const line = (label, list, fmt = (x) => x) => {
        console.log(`${list.length === 0 ? '✅' : '⚠️'} ${label}: ${list.length}`)
        for (const x of list) console.log(`    - ${fmt(x)}`)
    }
    console.log(`シート ${rows.length}行／PDF ${files.size}本`)
    line('① リンク切れになる行（git に無いPDFを指している）', broken, (r) => `id ${r.id} ${r.title}${files.has(pdfKeyFromUrl(r.pdf_url)) ? '（手元にはある＝git add を忘れている）' : ''}`)
    line('① git に入っていないPDF（公開しても載らない）', untracked)
    line('② シートに行の無いPDF', noRow)
    line('③ 号が読めていないPDF', noIssue)
    console.log(`ℹ️ 号はあるが頁の無いPDF（誌面に頁番号が無い回）: ${noPage.length}`)
    line('④ id の重複', dupIds, (id) => `id ${id}`)
    line('④ かなが空の行', noKana, (r) => `id ${r.id} ${r.title}｜${r.author}`)
}

main().catch((e) => {
    console.error('エラーが発生しました:', e.message)
    process.exit(1)
})
