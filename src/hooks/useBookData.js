import { useState, useEffect } from 'react'
import Papa from 'papaparse'

// ▼▼▼ ここにスプレッドシートの「Webに公開」→「CSV」のURLを貼り付けてください ▼▼▼
// まだ設定されていない場合は、自動的にデモデータが表示されます。
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSsvnJe7gSPOFne7gPM0z0ZgmwDUqcIalAelzCH20SWAMQsByiP0sblxzGdValDrybH-abNz2TH-9A7/pub?output=csv'
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// デモデータ (スプレッドシートが読み込めない場合に表示)
const DEMO_DATA = [
    {
        id: "1",
        title: "Clean Code",
        author: "Robert C. Martin",
        author_kana: "は行",
        category: "Technology",
        coverUrl: "https://placehold.co/400x600/e2e8f0/1e293b?text=Clean+Code",
        pdfUrl: "#",
        description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
        publishDate: "2008-08-01"
    },
    {
        id: "2",
        title: "The Good Parts",
        author: "Douglas Crockford",
        author_kana: "た行",
        category: "Programming",
        coverUrl: "https://placehold.co/400x600/fef3c7/92400e?text=JS+Good+Parts",
        pdfUrl: "#",
        description: "Most programming languages contain good and bad parts, but JavaScript has more than its share of the bad.",
        publishDate: "2008-05-01"
    },
    {
        id: "3",
        title: "デザイン詳細",
        author: "秋葉 ちひろ",
        author_kana: "あ行",
        category: "Design",
        coverUrl: "https://placehold.co/400x600/fce7f3/9d174d?text=Design",
        pdfUrl: "#",
        description: "日本語の本のテスト。",
        publishDate: "2023-01-01"
    },
    {
        id: "4",
        title: "Refactoring UI",
        author: "Adam Wathan",
        author_kana: "あ行",
        category: "Design",
        coverUrl: "https://placehold.co/400x600/e0f2fe/0369a1?text=Refactoring+UI",
        pdfUrl: "#",
        description: "Learn how to design beautiful user interfaces by yourself.",
        publishDate: "2018-12-11"
    }
]

export function useBookData() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // URLが設定されていない、またはプレースホルダーの場合はデモデータを使用
                if (!GOOGLE_SHEET_CSV_URL || GOOGLE_SHEET_CSV_URL.includes('docs.google.com') === false) {
                    console.log("Valid Google Sheet URL not found, using demo data.");
                    setBooks(DEMO_DATA);
                    setLoading(false);
                    return;
                }

                const response = await fetch(GOOGLE_SHEET_CSV_URL)
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSV: ${response.statusText}`)
                }

                const csvText = await response.text()
                console.log("CSV Fetched (first 100 chars):", csvText.substring(0, 100))

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        console.log("CSV Parsed:", results)
                        if (results.data.length > 0) {
                            console.log("First row keys:", Object.keys(results.data[0]))
                        }

                        // CSVのカラム名をアプリのプロパティにマッピング
                        const formattedBooks = results.data.map((item, index) => ({
                            id: item.id || `row-${index}`,
                            title: item.title,
                            author: item.author,
                            author_kana: item.author_kana,
                            description: item.description,
                            category: item.category,
                            coverUrl: item.cover_url,
                            pdfUrl: item.pdf_url,
                            publishDate: item.publish_date
                        })).filter(book => book.title);

                        console.log("Formatted Books:", formattedBooks)
                        setBooks(formattedBooks)
                        setLoading(false)
                    },
                    error: (err) => {
                        console.error("CSV Parse Error:", err)
                        setBooks(DEMO_DATA)
                        setError(err) // Enable error state
                        setLoading(false)
                    }
                })

            } catch (err) {
                console.error("Fetch Error:", err)
                setBooks(DEMO_DATA)
                setError(err) // Enable error state
                setLoading(false)
            }
        }

        fetchBooks()
    }, [])

    return { books, loading, error }
}
