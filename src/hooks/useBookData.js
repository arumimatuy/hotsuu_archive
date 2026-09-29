import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { resolvePdfUrl, assetUrl } from '../lib/config'
import { pdfKeyFromUrl } from '../lib/pdfPath'
import { SHEET_CSV_URL } from '../lib/sheet'

// 記事の一覧＝スプレッドシート（題・著者・かな・カテゴリ）＋ data/catalog.json（号・頁・実在するファイル）
//   catalog.json はビルドのたびに scripts/build-data.js が作る。読めなくても一覧は出る（号・頁が出ないだけ）。

function toInt(v) {
    const n = parseInt(String(v ?? '').trim(), 10)
    return Number.isFinite(n) ? n : null
}

async function fetchCatalog() {
    try {
        const res = await fetch(assetUrl('data/catalog.json'), { cache: 'no-cache' })
        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}

export function useBookData() {
    const [books, setBooks] = useState([])
    const [catalog, setCatalog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const [response, cat] = await Promise.all([fetch(SHEET_CSV_URL), fetchCatalog()])
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSV: ${response.statusText}`)
                }
                const csvText = await response.text()
                const files = cat?.files || null
                const external = cat?.external || {}

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const csvBooks = results.data
                            .map((item, index) => {
                                const key = pdfKeyFromUrl(item.pdf_url)
                                const rawUrl = String(item.pdf_url || '').trim()
                                const m = key ? files?.[key] : external[rawUrl]
                                return {
                                    rowKey: `r${index}`,
                                    id: item.id || `csv-${index}`,
                                    title: item.title,
                                    author: item.author,
                                    author_kana: item.author_kana,
                                    description: item.description,
                                    category: item.category,
                                    pdfUrl: resolvePdfUrl(item.pdf_url, files),
                                    // 発行日＝誌面のフッターの値を優先（シートの publish_date は取り込み日のことがある）
                                    publishDate: m?.date || item.publish_date,
                                    // シートに列を足した場合はそちらを優先（無ければ PDF から読んだ値）
                                    issueYm: item.issue_ym || m?.issueYm || null,
                                    issueNo: toInt(item.issue_no) ?? m?.issueNo ?? null,
                                    pageStart: toInt(item.page_start) ?? m?.pageStart ?? null,
                                    pageEnd: toInt(item.page_end) ?? m?.pageEnd ?? null,
                                    // 複数著者で同じPDFを指す行は、同じ記事として束ねる鍵
                                    articleKey: key || rawUrl,
                                    fileName: key,
                                    size: key ? files?.[key]?.size ?? null : null,
                                    // 自前のPDF（ZIPに入れられる）か／サイトに実在するか
                                    external: !key && Boolean(rawUrl),
                                    available: key ? (files ? Boolean(files[key]) : true) : Boolean(rawUrl),
                                }
                            })
                            .filter((book) => book.title)

                        setCatalog(cat)
                        setBooks(csvBooks)
                        setLoading(false)
                    },
                    error: (err) => {
                        console.error('CSV Parse Error:', err)
                        setBooks([])
                        setError(err)
                        setLoading(false)
                    },
                })
            } catch (err) {
                console.error('Fetch Error:', err)
                setBooks([])
                setError(err)
                setLoading(false)
            }
        }

        fetchBooks()
    }, [])

    return { books, catalog, loading, error }
}
