// PDFの置き場所と、一括ダウンロードの表示を、この1ファイルで決める（2026-09-08・9/29 追記）
//
// ■ 既定（VITE_PDF_BASE が未設定＝空文字）
//   PDFはサイトと同じ場所にある前提で、vite.config.js の base の下から引く。
//     base = '/hotsuu_archive/'  →  /hotsuu_archive/pdfs/○○.pdf
//     base = '/'                 →  /pdfs/○○.pdf
//
// ■ 本番移管のとき（どちらの場合もスプレッドシートは書き換えなくてよい）
//   (1) サイトだけ移す（PDFは今までどおりサイトと同梱）
//       → vite.config.js の base を '/' にするだけ。このファイルは触らない。
//   (2) PDFを別の場所へ格納し直す（個人のGitHub → 連盟側の保管先・オブジェクトストレージ等）
//       → 環境変数 VITE_PDF_BASE にそのベースURL（末尾スラッシュ付き）を入れるだけ。
//           例: VITE_PDF_BASE=https://pdf.example.or.jp/hotsuu/
//         Cloudflare Pages なら「環境変数」に登録して再ビルドすれば全件が切り替わる。
//         ローカルで試すときはプロジェクト直下に .env を置いて同じ行を書く。
//       ※ 移す先には CORS の許可（Access-Control-Allow-Origin）が要る。
//          ダウンロードボタンが fetch でPDFを取りにいくため。
//
// ■ スプレッドシートに残っている github.io の絶対URLも、9/29 からは「ファイル名」に直してから
//   ここの置き場所で組み立て直す（src/lib/pdfPath.js）。＝移管のときに76行を書き換えなくてよい。
//   園サーバ（号まるごと）など、自前でないURLはそのまま通す。
//
// ■ 一括ダウンロード（号ごとのZIP・選んだ記事のZIP）を隠すとき
//   → 環境変数 VITE_BULK_DOWNLOAD=off（.github/workflows/deploy.yml の Build の1行）。
//     ボタンが消え、ZIPも作られなくなる。
import { pdfKeyFromUrl, buildPdfUrl } from './pdfPath'

export const PDF_BASE = import.meta.env?.VITE_PDF_BASE ?? ''

export const BULK_DOWNLOAD = (import.meta.env?.VITE_BULK_DOWNLOAD ?? 'on') !== 'off'

// サイトの base（末尾スラッシュ付き）
export function siteBase() {
    const b = import.meta.env?.BASE_URL || '/'
    return b.endsWith('/') ? b : b + '/'
}

// サイトと同梱のファイル（data/catalog.json・zips/…）のURL
export function assetUrl(relPath) {
    return siteBase() + relPath.replace(/^\/+/, '')
}

// CSV の pdf_url を、実際に開けるURLへ組み立てる。
//   files … data/catalog.json の files（ファイル名（合成形）→ 実在するファイル名）。
//           渡されれば、濁点の文字コードが違う行も実在する名前に引き直す。
export function resolvePdfUrl(raw, files) {
    if (!raw) return ''
    const value = String(raw).trim()
    if (!value) return ''
    const key = pdfKeyFromUrl(value)
    if (!key) return value // 自前でない（園サーバの号まるごと等）はそのまま
    const actual = files?.[key]?.file ?? key
    return buildPdfUrl(PDF_BASE || siteBase(), actual)
}
