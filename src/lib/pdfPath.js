// PDFのURL ⇔ ファイル名の変換（画面とスクリプトの両方から使う・import.meta を使わない）（2026-09-29）
//
// ■ なぜ要るか
//   スプレッドシートの pdf_url は書き方が混ざっている。
//     - https://arumimatuy.github.io/hotsuu_archive/pdfs/○○.pdf（従来の行）
//     - pdfs/○○.pdf（9/8 以降の行＝相対パス）
//     - %E3%81… のように文字を符号化した行
//     - 濁点・半濁点が「合成形」の行と「分解形」の行（見た目は同じでも文字コードが違う）
//   GitHub Pages はファイル名を1バイトでも違えると 404 を返す。
//   そこで「自前のPDF」はすべてファイル名（合成形＝NFC）に直してから、実在するファイル名で組み立て直す。
//
// ■ 自前のPDFでない行（園サーバの号まるごとPDFなど）は触らない＝そのまま通す。

const OWN_ABSOLUTE = /^https?:\/\/[^/]*github\.io\/hotsuu_archive\/pdfs\//i

function safeDecode(s) {
    try {
        return decodeURIComponent(s)
    } catch {
        return s
    }
}

// ファイル名を「比べるための形」にする（合成形・前後の空白なし）
export function fileKey(name) {
    return String(name ?? '').normalize('NFC').trim()
}

// pdf_url から自前のPDFのファイル名（比べるための形）を取り出す。自前でなければ null。
export function pdfKeyFromUrl(raw) {
    if (!raw) return null
    const value = String(raw).trim()
    if (!value) return null

    let rest = null
    if (/^https?:\/\//i.test(value)) {
        if (!OWN_ABSOLUTE.test(value)) return null
        rest = value.replace(OWN_ABSOLUTE, '')
    } else {
        // 相対パス: pdfs/○○.pdf ／ /hotsuu_archive/pdfs/○○.pdf ／ ○○.pdf
        rest = value.replace(/^\/+/, '').replace(/^hotsuu_archive\//, '').replace(/^pdfs\//, '')
    }
    rest = rest.split(/[?#]/)[0]
    if (!rest || rest.includes('/')) return null
    return fileKey(safeDecode(rest))
}

// 実在するファイル名から、サイト上のURLを組み立てる
//   base … 末尾スラッシュ付きのベース（例 '/hotsuu_archive/'・'https://pdf.example.or.jp/hotsuu/'）
export function buildPdfUrl(base, actualName) {
    const root = base.endsWith('/') ? base : base + '/'
    return root + 'pdfs/' + encodeURIComponent(actualName)
}
