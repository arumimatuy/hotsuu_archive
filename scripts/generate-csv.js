import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const INBOX_DIR = path.join(__dirname, '../draft_pdfs')
const PDF_DIR = path.join(__dirname, '../public/pdfs')
const OUTPUT_FILE = path.join(__dirname, '../output/books.csv')
const GITHUB_PAGES_BASE_URL = 'https://arumimatuy.github.io/hotsuu_archive/pdfs/'

// Category mapping based on keywords in filename
const CATEGORY_MAP = [
    { keywords: ['技術', '開発', 'システム', 'プログラミング', 'React', 'Tech'], category: '技術' },
    { keywords: ['経営', '戦略', 'ビジネス', '起業'], category: '経営' },
    { keywords: ['デザイン', 'UI', 'UX', 'Figma'], category: 'デザイン' },
    { keywords: ['法務', '契約', '法律', 'コンプライアンス'], category: '法務' },
    { keywords: ['マーケティング', '営業', 'Sales', 'Marketing'], category: 'マーケティング' },
    { keywords: ['人事', 'HR', '採用', '組織'], category: '人事' },
    { keywords: ['財務', '会計', 'Finance', '経理'], category: '財務' }
]

// Kana mapping for authors
function guessKana(authorName) {
    if (!authorName) return 'あ'
    // Default to 'あ' if we can't determine it
    return 'あ'
}

function extractInfoFromFilename(filename) {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.pdf$/i, '')

    // Default values
    let title = nameWithoutExt
    let author = '不明'
    let category = 'その他'
    let publishDate = new Date().toISOString().split('T')[0]

    // Try to parse format like: "著者名_タイトル_2024-01-01.pdf" or "タイトル_著者名.pdf"
    const parts = nameWithoutExt.split('_')

    if (parts.length >= 2) {
        title = parts[0]
        author = parts[1]

        if (parts.length >= 3 && /^\d{4}-\d{2}-\d{2}$/.test(parts[2])) {
            publishDate = parts[2]
        }
    }

    // Try to determine category from title
    for (const mapping of CATEGORY_MAP) {
        if (mapping.keywords.some(kw => title.includes(kw) || nameWithoutExt.includes(kw))) {
            category = mapping.category
            break
        }
    }

    return {
        title: title.trim(),
        author: author.trim(),
        author_kana: guessKana(author.trim()),
        category,
        description: `${title}のPDFドキュメントです。`,
        publishDate
    }
}

async function generateCsv() {
    console.log('PDFファイルからCSVメタデータを生成します...')

    try {
        // Ensure directories exist
        if (!fs.existsSync(INBOX_DIR)) {
            fs.mkdirSync(INBOX_DIR, { recursive: true })
            console.log(`✓ フォルダ作成: ${INBOX_DIR}`)
        }
        if (!fs.existsSync(PDF_DIR)) {
            fs.mkdirSync(PDF_DIR, { recursive: true })
            console.log(`✓ フォルダ作成: ${PDF_DIR}`)
        }

        const outputDir = path.dirname(OUTPUT_FILE)
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
        }

        // 新規PDFの移動処理 (draft_pdfs -> public/pdfs)
        const inboxFiles = fs.existsSync(INBOX_DIR) ? fs.readdirSync(INBOX_DIR) : []
        const draftPdfs = inboxFiles.filter(f => f.toLowerCase().endsWith('.pdf'))

        if (draftPdfs.length > 0) {
            console.log(`\n📥 ${draftPdfs.length}件の新規PDFを下書きフォルダから公開フォルダへ移動します...`)
            for (const file of draftPdfs) {
                const oldPath = path.join(INBOX_DIR, file)
                const newPath = path.join(PDF_DIR, file)
                fs.renameSync(oldPath, newPath)
                console.log(`  - 移動完了: ${file}`)
            }
        }

        // Read PDF files
        const files = fs.existsSync(PDF_DIR) ? fs.readdirSync(PDF_DIR) : []
        const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'))

        if (pdfFiles.length === 0) {
            console.warn(`\n⚠️ 警告: ${PDF_DIR} にPDFファイルがありません。`)
            console.log('テスト用にダミーデータを含むCSVを一時的に生成します。')

            // Generate dummy PDF entries if empty
            pdfFiles.push('React実践ガイド_山田太郎_2024-01-15.pdf')
            pdfFiles.push('マーケティング戦略_鈴木花子.pdf')
            pdfFiles.push('UIデザインの基礎_佐藤一郎_2023-11-20.pdf')
        }

        console.log(`\n${pdfFiles.length}件のPDFファイルが見つかりました/処理します。`)

        // Process files
        const records = pdfFiles.map((filename, index) => {
            const info = extractInfoFromFilename(filename)
            return {
                id: `pdf-${index + 1}`,
                title: info.title,
                author: info.author,
                author_kana: info.author_kana,
                category: info.category,
                cover_url: '', // 空白（使用しないため）
                pdf_url: `${GITHUB_PAGES_BASE_URL}${filename}`,
                description: info.description,
                publish_date: info.publishDate
            }
        })

        // Generate CSV and add UTF-8 BOM for Excel compatibility
        const csv = Papa.unparse(records)
        const bom = '\uFEFF'
        fs.writeFileSync(OUTPUT_FILE, bom + csv, 'utf8')

        console.log(`\n✅ 完了: ${OUTPUT_FILE} を生成しました。`)
        console.log('--------------------------------------------------')
        console.log('■ スプレッドシートへのインポート方法:')
        console.log('1. 生成された books.csv をテキストエディタ・Excelで開く')
        console.log('2. 内容をコピーする。ヘッダー（1行目）を含めるかどうかはスプレッドシートの状況に合わせてください。')
        console.log('3. 指定のスプレッドシートに貼り付ける')
        console.log('--------------------------------------------------')

    } catch (error) {
        console.error('エラーが発生しました:', error)
        process.exit(1)
    }
}

generateCsv()
