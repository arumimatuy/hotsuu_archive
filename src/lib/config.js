// PDFの置き場所を、この1ファイルだけで決める（2026-09-08）
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
// ■ スプレッドシートに残っている絶対URL（http... で始まる行）はそのまま生きる。
//   新しく足す行だけ相対パスになり、古い行を一括で直す必要はない。
export const PDF_BASE = import.meta.env?.VITE_PDF_BASE ?? ''

// CSV の pdf_url を、実際に開けるURLへ組み立てる。
//  - http(s) で始まる行は「絶対URL」とみなしてそのまま通す
//    ＝スプレッドシートに残っている既存の行を壊さないため（一括で直さなくてよい）
//  - それ以外は「サイトからの相対パス」とみなし、上の PDF_BASE
//    （未設定ならサイトの base）の下から引く
export function resolvePdfUrl(raw) {
    if (!raw) return ''
    const value = String(raw).trim()
    if (!value) return ''
    if (/^https?:\/\//i.test(value)) return value

    const root = PDF_BASE || import.meta.env?.BASE_URL || '/'
    const base = root.endsWith('/') ? root : root + '/'
    return base + value.replace(/^\/+/, '')
}
