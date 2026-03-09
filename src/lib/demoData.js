// Demo data generator for 社内図書ライブラリ
// 250+ items covering all kana rows with diverse categories

const CATEGORIES = ['技術', '経営', 'デザイン', '法務', 'マーケティング', '人事', '財務', '営業', '教養', '語学']

const AUTHORS_DATA = [
    // あ行
    { author: '青木 太郎', kana: 'あおき' },
    { author: '石田 花子', kana: 'いしだ' },
    { author: '上田 健一', kana: 'うえだ' },
    { author: '遠藤 美咲', kana: 'えんどう' },
    { author: '大野 誠', kana: 'おおの' },
    { author: '秋葉 ちひろ', kana: 'あきば' },
    { author: '安藤 裕子', kana: 'あんどう' },
    { author: '池田 直樹', kana: 'いけだ' },
    { author: '岩崎 真理', kana: 'いわさき' },
    { author: '内田 翔太', kana: 'うちだ' },
    // か行
    { author: '加藤 修', kana: 'かとう' },
    { author: '木村 裕介', kana: 'きむら' },
    { author: '工藤 さやか', kana: 'くどう' },
    { author: '小林 大輔', kana: 'こばやし' },
    { author: '近藤 恵', kana: 'こんどう' },
    { author: '金子 亮太', kana: 'かねこ' },
    { author: '菊池 由香', kana: 'きくち' },
    { author: '黒田 隆', kana: 'くろだ' },
    // さ行
    { author: '佐藤 明', kana: 'さとう' },
    { author: '島田 由紀', kana: 'しまだ' },
    { author: '鈴木 一郎', kana: 'すずき' },
    { author: '瀬戸 真由美', kana: 'せと' },
    { author: '曽根 健太', kana: 'そね' },
    { author: '斎藤 愛', kana: 'さいとう' },
    { author: '杉本 浩二', kana: 'すぎもと' },
    // た行
    { author: '田中 智子', kana: 'たなか' },
    { author: '千葉 良太', kana: 'ちば' },
    { author: '辻 美穂', kana: 'つじ' },
    { author: '寺田 洋一', kana: 'てらだ' },
    { author: '富田 恭子', kana: 'とみた' },
    { author: '高橋 信二', kana: 'たかはし' },
    { author: '土屋 麻衣', kana: 'つちや' },
    // な行
    { author: '中村 隆志', kana: 'なかむら' },
    { author: '西田 恵美', kana: 'にしだ' },
    { author: '沼田 大介', kana: 'ぬまた' },
    { author: '根本 和也', kana: 'ねもと' },
    { author: '野口 久美子', kana: 'のぐち' },
    { author: '中島 哲也', kana: 'なかじま' },
    // は行
    { author: '橋本 真一', kana: 'はしもと' },
    { author: '平田 里奈', kana: 'ひらた' },
    { author: '福田 正人', kana: 'ふくだ' },
    { author: '堀 千尋', kana: 'ほり' },
    { author: '浜田 雅彦', kana: 'はまだ' },
    { author: '藤井 直美', kana: 'ふじい' },
    // ま行
    { author: '松本 啓一', kana: 'まつもと' },
    { author: '三浦 涼子', kana: 'みうら' },
    { author: '村上 拓也', kana: 'むらかみ' },
    { author: '森 由美', kana: 'もり' },
    { author: '丸山 健司', kana: 'まるやま' },
    { author: '水野 あかね', kana: 'みずの' },
    // や行
    { author: '山田 太一', kana: 'やまだ' },
    { author: '横田 静香', kana: 'よこた' },
    { author: '吉田 英明', kana: 'よしだ' },
    { author: '山本 百合', kana: 'やまもと' },
    // ら行
    { author: '理研 太郎', kana: 'りけん' },
    { author: '林田 恵子', kana: 'りんだ' },
    // わ行
    { author: '渡辺 剛', kana: 'わたなべ' },
    { author: '渡部 幸子', kana: 'わたべ' },
]

const BOOK_TEMPLATES = [
    // 技術
    { titleBase: 'はじめてのプログラミング', category: '技術' },
    { titleBase: 'React実践入門', category: '技術' },
    { titleBase: 'AIと機械学習の基礎', category: '技術' },
    { titleBase: 'データベース設計の教科書', category: '技術' },
    { titleBase: 'クラウドアーキテクチャ入門', category: '技術' },
    { titleBase: 'セキュリティ対策ガイド', category: '技術' },
    { titleBase: 'DevOps実践ハンドブック', category: '技術' },
    { titleBase: 'Docker完全ガイド', category: '技術' },
    { titleBase: 'TypeScript設計パターン', category: '技術' },
    { titleBase: 'マイクロサービス構築術', category: '技術' },
    { titleBase: 'ネットワーク構築の基本', category: '技術' },
    { titleBase: 'テスト駆動開発入門', category: '技術' },
    { titleBase: 'Pythonによるデータ分析', category: '技術' },
    { titleBase: 'AWS運用設計', category: '技術' },
    { titleBase: 'Git & GitHub実践入門', category: '技術' },
    // 経営
    { titleBase: '経営戦略の実践', category: '経営' },
    { titleBase: 'イノベーションの起こし方', category: '経営' },
    { titleBase: 'リーダーシップの本質', category: '経営' },
    { titleBase: '事業計画の作り方', category: '経営' },
    { titleBase: 'スタートアップ経営学', category: '経営' },
    { titleBase: '組織マネジメント論', category: '経営' },
    { titleBase: 'DX推進の実務', category: '経営' },
    { titleBase: '経営者の意思決定', category: '経営' },
    // デザイン
    { titleBase: 'UIデザインの原則', category: 'デザイン' },
    { titleBase: 'UXリサーチ入門', category: 'デザイン' },
    { titleBase: 'ブランディング戦略', category: 'デザイン' },
    { titleBase: 'プロダクトデザイン実践', category: 'デザイン' },
    { titleBase: 'カラーデザインの教科書', category: 'デザイン' },
    { titleBase: 'タイポグラフィの基本', category: 'デザイン' },
    { titleBase: 'アクセシブルデザイン', category: 'デザイン' },
    // 法務
    { titleBase: '会社法の基礎知識', category: '法務' },
    { titleBase: '契約書作成マニュアル', category: '法務' },
    { titleBase: '知的財産権の実務', category: '法務' },
    { titleBase: 'コンプライアンス入門', category: '法務' },
    { titleBase: '個人情報保護法ガイド', category: '法務' },
    { titleBase: '労働法の基礎', category: '法務' },
    // マーケティング
    { titleBase: 'デジタルマーケティング入門', category: 'マーケティング' },
    { titleBase: 'コンテンツ戦略論', category: 'マーケティング' },
    { titleBase: 'SNSマーケティング実践', category: 'マーケティング' },
    { titleBase: '顧客獲得の科学', category: 'マーケティング' },
    { titleBase: 'ブランド構築論', category: 'マーケティング' },
    { titleBase: 'マーケティングリサーチ', category: 'マーケティング' },
    // 人事
    { titleBase: '人材育成の方法論', category: '人事' },
    { titleBase: '採用戦略の新常識', category: '人事' },
    { titleBase: '評価制度設計', category: '人事' },
    { titleBase: 'チームビルディング', category: '人事' },
    { titleBase: 'リモートワーク管理術', category: '人事' },
    // 財務
    { titleBase: '財務諸表の読み方', category: '財務' },
    { titleBase: '管理会計入門', category: '財務' },
    { titleBase: '資金調達の実務', category: '財務' },
    { titleBase: '予算管理の技術', category: '財務' },
    { titleBase: 'M&Aの基礎知識', category: '財務' },
    // 営業
    { titleBase: '営業力強化法', category: '営業' },
    { titleBase: '提案書の書き方', category: '営業' },
    { titleBase: '交渉術入門', category: '営業' },
    { titleBase: '顧客関係管理', category: '営業' },
    { titleBase: 'プレゼンテーション技術', category: '営業' },
    // 教養
    { titleBase: 'ロジカルシンキング入門', category: '教養' },
    { titleBase: '問題解決の技法', category: '教養' },
    { titleBase: 'ビジネス文書の書き方', category: '教養' },
    { titleBase: 'タイムマネジメント術', category: '教養' },
    { titleBase: 'ファシリテーション入門', category: '教養' },
    { titleBase: 'クリティカルシンキング', category: '教養' },
    // 語学
    { titleBase: 'ビジネス英語入門', category: '語学' },
    { titleBase: 'TOEIC対策完全版', category: '語学' },
    { titleBase: '英文メールの書き方', category: '語学' },
    { titleBase: 'プレゼン英語術', category: '語学' },
    { titleBase: '技術英語リーディング', category: '語学' },
]

const DESCRIPTIONS = [
    '実践的な事例をもとに基礎から応用まで体系的に学べる一冊。現場で即活用できる知識が満載。',
    'ベストプラクティスと失敗事例の両方を取り上げ、実務に直結する内容をわかりやすく解説。',
    '初学者から中級者まで幅広く対応。豊富な図解と演習問題で理解を深められる構成。',
    '最新のトレンドと技術動向を踏まえた実践ガイド。具体的な手順とチェックリスト付き。',
    '現場経験豊富な著者が、成功と失敗の体験を交えながら核心に迫る実務書。',
    '基本概念の理解から実装まで、ステップバイステップで学べる入門書。',
    '理論と実践のバランスが取れた内容で、実務に必要な知識を効率よく習得できる。',
    '多くの企業での導入事例をもとに、効果的な方法論を解説した実践マニュアル。',
    'チームで活用できるフレームワークとツールを紹介。明日からすぐに使える内容。',
    '業界の第一人者が監修。最新の研究成果と実務経験に基づいた信頼性の高い一冊。',
]

function generateDemoData() {
    const books = []
    let id = 1

    // Generate books by combining authors and templates
    for (let round = 0; round < 5; round++) {
        for (let ai = 0; ai < AUTHORS_DATA.length; ai++) {
            const author = AUTHORS_DATA[ai]
            const templateIndex = (ai * 3 + round * 7) % BOOK_TEMPLATES.length
            const template = BOOK_TEMPLATES[templateIndex]

            const year = 2018 + (id % 8)
            const month = String(1 + (id % 12)).padStart(2, '0')
            const day = String(1 + (id % 28)).padStart(2, '0')

            const suffix = round > 0 ? ` 第${round + 1}版` : ''

            books.push({
                id: String(id),
                title: template.titleBase + suffix,
                author: author.author,
                author_kana: author.kana,
                category: template.category,
                pdfUrl: '#',
                description: DESCRIPTIONS[(id - 1) % DESCRIPTIONS.length],
                publishDate: `${year}-${month}-${day}`
            })
            id++

            if (books.length >= 300) break
        }
        if (books.length >= 300) break
    }

    return books
}

export const DEMO_DATA = generateDemoData()
