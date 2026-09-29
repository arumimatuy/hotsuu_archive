// 無圧縮（STORE）の ZIP を組み立てる小さな実装（2026-09-29）
//
// ■ なぜ自前か
//   PDF はもともと中で圧縮されているので、ZIP で縮めてもほとんど小さくならない。
//   「束ねるだけ」なら仕様が小さく、外部の部品を足さずに済む（ブラウザとビルド用スクリプトの両方で同じものを使う）。
// ■ 日本語のファイル名
//   ファイル名は UTF-8 で書き、「UTF-8 です」の印（汎用フラグ 11 ビット目）を立てる。
//   Windows 10/11 の標準機能・macOS・7-Zip はこの印を読んで正しく復元する。
// ■ 上限
//   1ファイル・全体とも 4GB 未満（ZIP64 は使わない）。号ごと・選択分なら十分に内側。

const CRC_TABLE = (() => {
    const table = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
        let c = n
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
        table[n] = c >>> 0
    }
    return table
})()

export function crc32(bytes) {
    let c = 0xffffffff
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
}

function dosDateTime(date) {
    const d = date instanceof Date && !isNaN(date) ? date : new Date()
    const year = Math.max(1980, d.getFullYear())
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2)
    const day = ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
    return { time, day }
}

// entries: [{ name: 'ファイル名.pdf', data: Uint8Array, date?: Date }]
// 戻り値: Uint8Array の配列（ブラウザは new Blob(parts)、Node は Buffer.concat(parts) で1本にする）
export function createZip(entries) {
    const encoder = new TextEncoder()
    const parts = []
    const central = []
    let offset = 0
    const seen = new Set()

    for (const entry of entries) {
        const name = String(entry.name).normalize('NFC')
        if (seen.has(name)) continue // 同じ名前は1本だけ（複数著者で同じPDFを指す行など）
        seen.add(name)

        const nameBytes = encoder.encode(name)
        const data = entry.data
        const crc = crc32(data)
        const { time, day } = dosDateTime(entry.date)

        const local = new Uint8Array(30 + nameBytes.length)
        const lv = new DataView(local.buffer)
        lv.setUint32(0, 0x04034b50, true) // ローカルヘッダの印
        lv.setUint16(4, 20, true) // 展開に要る版 2.0
        lv.setUint16(6, 0x0800, true) // ファイル名は UTF-8
        lv.setUint16(8, 0, true) // 無圧縮（STORE）
        lv.setUint16(10, time, true)
        lv.setUint16(12, day, true)
        lv.setUint32(14, crc, true)
        lv.setUint32(18, data.length, true)
        lv.setUint32(22, data.length, true)
        lv.setUint16(26, nameBytes.length, true)
        lv.setUint16(28, 0, true)
        local.set(nameBytes, 30)

        const cd = new Uint8Array(46 + nameBytes.length)
        const cv = new DataView(cd.buffer)
        cv.setUint32(0, 0x02014b50, true) // 中央ディレクトリの印
        cv.setUint16(4, (3 << 8) | 20, true) // 作成元 Unix・版 2.0（作成元が MS-DOS だと macOS の unzip コマンドが名前を CP437 とみなして化ける）
        cv.setUint16(6, 20, true)
        cv.setUint16(8, 0x0800, true)
        cv.setUint16(10, 0, true)
        cv.setUint16(12, time, true)
        cv.setUint16(14, day, true)
        cv.setUint32(16, crc, true)
        cv.setUint32(20, data.length, true)
        cv.setUint32(24, data.length, true)
        cv.setUint16(28, nameBytes.length, true)
        cv.setUint16(30, 0, true) // 拡張フィールドなし
        cv.setUint16(32, 0, true) // コメントなし
        cv.setUint16(34, 0, true)
        cv.setUint16(36, 0, true)
        cv.setUint32(38, (0o100644 << 16) >>> 0, true) // 通常のファイル・rw-r--r--（作成元 Unix で 0 にすると権限なしで展開される）
        cv.setUint32(42, offset, true) // ローカルヘッダの位置
        cd.set(nameBytes, 46)

        parts.push(local, data)
        central.push(cd)
        offset += local.length + data.length
    }

    const cdSize = central.reduce((sum, c) => sum + c.length, 0)
    const end = new Uint8Array(22)
    const ev = new DataView(end.buffer)
    ev.setUint32(0, 0x06054b50, true) // 終端の印
    ev.setUint16(8, central.length, true)
    ev.setUint16(10, central.length, true)
    ev.setUint32(12, cdSize, true)
    ev.setUint32(16, offset, true)

    return [...parts, ...central, end]
}
