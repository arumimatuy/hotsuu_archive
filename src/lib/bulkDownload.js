// 選んだ記事をまとめて1つのZIPでダウンロードする（ブラウザ側）（2026-09-29）
import { createZip } from './zip'

function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // iPhone の Safari は保存の確認が長く出る＝早く消すと保存に失敗する（FileSaver.js は40秒）
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function today() {
    const d = new Date()
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

// items: [{ name: 'ファイル名.pdf', url, title }]
// onProgress(done, total)
// 戻り値: { ok: 件数, failed: [title…] }
export async function downloadAsZip(items, onProgress) {
    const entries = []
    const failed = []
    let done = 0
    for (const item of items) {
        try {
            const res = await fetch(item.url)
            if (!res.ok) throw new Error(String(res.status))
            entries.push({ name: item.name, data: new Uint8Array(await res.arrayBuffer()) })
        } catch {
            failed.push(item.title || item.name)
        }
        done++
        onProgress?.(done, items.length)
    }
    if (entries.length > 0) {
        const parts = createZip(entries)
        saveBlob(new Blob(parts, { type: 'application/zip' }), `保育通信_選択${entries.length}件_${today()}.zip`)
    }
    return { ok: entries.length, failed }
}

export function downloadUrl(url, filename) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}
