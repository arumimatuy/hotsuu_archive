// 号・頁を読み直す  npm run meta（まだ無いPDFだけ）／ npm run meta -- --all（manual 以外すべて）（2026-09-29）
import { refreshMeta } from './lib/meta-store.js'

const all = process.argv.includes('--all')
const r = refreshMeta({ all })
if (r.noTool) console.log('⚠️ pdftotext が無いので読めませんでした（brew install poppler で入る）')
console.log(`読めた ${r.read.length}本／号が読めない ${r.failed.length}本／そのまま ${r.skipped}本`)
for (const k of r.failed) console.log(`  - ${k}`)
