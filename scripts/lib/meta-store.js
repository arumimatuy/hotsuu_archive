// 号・頁のデータ（data/pdf-meta.json）を読み書きする（2026-09-29）
//
// ■ data/pdf-meta.json が正本（リポジトリに入れる）。キーは PDF のファイル名（合成形）。
//     { issueNo, issueYm, date, pageStart, pageEnd, pagesInferred?, source, memo? }
//   source … "footer"＝誌面のフッターから自動／"filename"＝号だけファイル名から／"manual"＝人が入れた
//   ⚠️ source が "manual" の行は自動で上書きしない。
// ■ external … 園サーバに置いている号まるごとのPDF（URLがキー）
// ■ スプレッドシート（題・著者・かな）は別。こちらは PDF から機械的に取れる値だけを持つ。

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { fileKey } from '../../src/lib/pdfPath.js'
import { extractPdfMeta, hasPdftotext } from './pdf-meta.js'
import { parsePdfFilename } from './filename.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.join(__dirname, '..', '..')
export const PDF_DIR = path.join(ROOT, 'public', 'pdfs')
export const META_FILE = path.join(ROOT, 'data', 'pdf-meta.json')

export function loadMeta() {
    if (!fs.existsSync(META_FILE)) return { files: {}, external: {} }
    const json = JSON.parse(fs.readFileSync(META_FILE, 'utf8'))
    return { ...json, files: json.files || {}, external: json.external || {} }
}

export function saveMeta(meta) {
    const sortedFiles = Object.fromEntries(
        Object.entries(meta.files).sort(([a], [b]) => a.localeCompare(b, 'ja')),
    )
    const out = {
        _説明:
            '誌面PDFの号・頁（フッターから自動で読んだ値）。正本はこのファイル。source=manual の行は自動で上書きしない。題・著者・かなはスプレッドシート側。',
        files: sortedFiles,
        external: meta.external,
    }
    fs.mkdirSync(path.dirname(META_FILE), { recursive: true })
    fs.writeFileSync(META_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8')
}

export function listPdfs() {
    if (!fs.existsSync(PDF_DIR)) return []
    return fs.readdirSync(PDF_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'))
}

// public/pdfs のうち、まだ号・頁の無いPDF（all=true なら manual 以外すべて）を読み直す
export function refreshMeta({ all = false, only = null } = {}) {
    const meta = loadMeta()
    const report = { read: [], failed: [], skipped: 0, noTool: !hasPdftotext() }
    const files = listPdfs()
    const want = only ? new Set(only.map(fileKey)) : null

    for (const f of files) {
        const key = fileKey(f)
        if (want && !want.has(key)) continue
        const cur = meta.files[key]
        if (cur?.source === 'manual') {
            report.skipped++
            continue
        }
        if (cur && !all && !want) {
            report.skipped++
            continue
        }
        const m = report.noTool ? {} : extractPdfMeta(path.join(PDF_DIR, f))
        const fromName = parsePdfFilename(f)
        const entry = {
            issueNo: m.issueNo ?? null,
            issueYm: m.date ? m.date.slice(0, 7) : fromName.issueYm,
            date: m.date ?? null,
            pageStart: m.pageStart ?? null,
            pageEnd: m.pageEnd ?? null,
            source: m.issueNo ? 'footer' : fromName.issueYm ? 'filename' : 'none',
        }
        if (m.pagesInferred) entry.pagesInferred = true
        meta.files[key] = entry
        if (entry.issueNo) report.read.push(key)
        else report.failed.push(key)
    }

    // フッターの無い回（生成AIヒナリー等）は、同じ年月の他の記事から号数と発行日を引く
    const byYm = new Map()
    for (const v of Object.values(meta.files)) {
        if (v.issueYm && v.issueNo && v.date) byYm.set(v.issueYm, { issueNo: v.issueNo, date: v.date })
    }
    for (const v of Object.values(meta.files)) {
        if (v.source === 'manual') continue
        if (v.issueYm && !v.issueNo && byYm.has(v.issueYm)) {
            v.issueNo = byYm.get(v.issueYm).issueNo
            v.date = byYm.get(v.issueYm).date
        }
    }
    saveMeta(meta)
    return report
}
