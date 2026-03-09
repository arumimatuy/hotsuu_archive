import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { DEMO_DATA } from '../lib/demoData'

// Google Sheets CSV URL Configuration
// スプレッドシートの「ファイル」→「ウェブに公開」→「CSV」のURLをここに設定
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSsvnJe7gSPOFne7gPM0z0ZgmwDUqcIalAelzCH20SWAMQsByiP0sblxzGdValDrybH-abNz2TH-9A7/pub?output=csv'

export function useBookData() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Validate Google Sheets URL
                if (!GOOGLE_SHEET_CSV_URL || !GOOGLE_SHEET_CSV_URL.includes('docs.google.com')) {
                    console.warn("Valid Google Sheet URL not found, using demo data.")
                    setBooks(DEMO_DATA)
                    setLoading(false)
                    return
                }

                const response = await fetch(GOOGLE_SHEET_CSV_URL)
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSV: ${response.statusText}`)
                }

                const csvText = await response.text()

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const csvBooks = results.data.map((item, index) => ({
                            id: item.id || `csv-${index}`,
                            title: item.title,
                            author: item.author,
                            author_kana: item.author_kana,
                            description: item.description,
                            category: item.category,
                            pdfUrl: item.pdf_url,
                            publishDate: item.publish_date
                        })).filter(book => book.title)

                        // Merge CSV data with demo data for sufficient testing volume
                        const mergedBooks = [...csvBooks, ...DEMO_DATA]
                        setBooks(mergedBooks)
                        setLoading(false)
                    },
                    error: (err) => {
                        console.error("CSV Parse Error:", err)
                        setBooks(DEMO_DATA)
                        setError(err)
                        setLoading(false)
                    }
                })

            } catch (err) {
                console.error("Fetch Error:", err)
                setBooks(DEMO_DATA)
                setError(err)
                setLoading(false)
            }
        }

        fetchBooks()
    }, [])

    return { books, loading, error }
}
