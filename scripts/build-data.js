// ビルドの直前に走る（npm run build / npm run dev の前に自動）（2026-09-29）
//
// やること
//   1. public/pdfs に実在するPDFの一覧と、data/pdf-meta.json の号・頁を束ねて
//      public/data/catalog.json を作る（画面が読む）
//      ⭐ 実在するファイル名をそのまま書く＝スプレッドシートのURLと濁点の文字コードが違っても、
//         画面側で実在する名前に引き直せる（リンク切れの根本対策）
//   2. 一括ダウンロードが有効なら、号ごとの ZIP を public/zips に作る
//      （PDFはもともと圧縮済みなので無圧縮で束ねるだけ・号あたり10MB前後）
//
// 一括ダウンロードを隠すとき … 環境変数 VITE_BULK_DOWNLOAD=off（.github/workflows/deploy.yml の1行）
// どちらも生成物なので git には入れない（.gitignore 済み）。

import fs from 'fs'
import path from 'path'
import { fileKey } from '../src/lib/pdfPath.js'
import { createZip } from '../src/lib/zip.js'
import { ROOT, PDF_DIR, loadMeta, listPdfs } from './lib/meta-store.js'

const DATA_DIR = path.join(ROOT, 'public', 'data')
const ZIP_DIR = path.join(ROOT, 'public', 'zips')
const bulk = (process.env.VITE_BULK_DOWNLOAD ?? 'on') !== 'off'

function zipNameFor(issue) {
    return `保育通信_${issue.ym}_${issue.no ?? '号不明'}号.zip`
}

function main() {
    const meta = loadMeta()
    const files = {}
    for (const f of listPdfs()) {
        const key = fileKey(f)
        const size = fs.statSync(path.join(PDF_DIR, f)).size
        const m = meta.files[key] || {}
        files[key] = {
            file: f,
            size,
            issueNo: m.issueNo ?? null,
            issueYm: m.issueYm ?? null,
            date: m.date ?? null,
            pageStart: m.pageStart ?? null,
            pageEnd: m.pageEnd ?? null,
        }
    }

    // 号ごとにまとめる（号の分からないPDFはZIPに入れない）
    const byIssue = new Map()
    for (const [key, v] of Object.entries(files)) {
        if (!v.issueYm) continue
        if (!byIssue.has(v.issueYm)) byIssue.set(v.issueYm, { ym: v.issueYm, no: v.issueNo, date: v.date, keys: [] })
        const g = byIssue.get(v.issueYm)
        g.no = g.no ?? v.issueNo
        g.date = g.date ?? v.date
        g.keys.push(key)
    }
    const issues = [...byIssue.values()].sort((a, b) => b.ym.localeCompare(a.ym))

    fs.mkdirSync(DATA_DIR, { recursive: true })
    if (bulk) fs.mkdirSync(ZIP_DIR, { recursive: true })
    const keepZips = new Set()

    for (const issue of issues) {
        issue.keys.sort((a, b) => {
            const pa = files[a].pageStart ?? 9999
            const pb = files[b].pageStart ?? 9999
            return pa - pb || a.localeCompare(b, 'ja')
        })
        issue.count = issue.keys.length
        issue.size = issue.keys.reduce((sum, k) => sum + files[k].size, 0)
        if (!bulk) continue

        const name = zipNameFor(issue)
        keepZips.add(name)
        const date = issue.date ? new Date(`${issue.date}T00:00:00`) : new Date()
        const parts = createZip(
            issue.keys.map((k) => ({
                name: k,
                data: fs.readFileSync(path.join(PDF_DIR, files[k].file)),
                date,
            })),
        )
        const buf = Buffer.concat(parts.map((p) => Buffer.from(p.buffer, p.byteOffset, p.byteLength)))
        fs.writeFileSync(path.join(ZIP_DIR, name), buf)
        issue.zip = name
        issue.zipSize = buf.length
    }

    // 古いZIP（号が消えた・名前が変わった）を掃除する
    if (fs.existsSync(ZIP_DIR)) {
        for (const f of fs.readdirSync(ZIP_DIR)) {
            if (f.endsWith('.zip') && !keepZips.has(f.normalize('NFC')) && !keepZips.has(f)) {
                fs.unlinkSync(path.join(ZIP_DIR, f))
            }
        }
    }

    const catalog = {
        generatedAt: new Date().toISOString(),
        bulkDownload: bulk,
        files,
        external: meta.external,
        issues: issues.map(({ keys, ...rest }) => ({ ...rest, keys })),
    }
    fs.writeFileSync(path.join(DATA_DIR, 'catalog.json'), JSON.stringify(catalog), 'utf8')

    const noIssue = Object.values(files).filter((v) => !v.issueYm).length
    console.log(
        `catalog.json: PDF ${Object.keys(files).length}本・号 ${issues.length}号` +
            (noIssue ? `（号の分からないPDF ${noIssue}本）` : '') +
            (bulk ? `・ZIP ${keepZips.size}本` : '・一括ダウンロードは無効（VITE_BULK_DOWNLOAD=off）'),
    )
}

main()
