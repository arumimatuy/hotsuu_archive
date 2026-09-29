// 誌面PDFのファイル名を読む（2026-09-29）
//
// 実物のファイル名の形（編集部から届く校了データ）:
//   202610経営相談室・31：松本 和也氏.02a.pdf
//   202610・カスハラ対応をめぐって：普光院 亜紀氏.03a.pdf        … 先頭の「・」は単発記事
//   202610ジタバタと○○を語ろう・４：久保 健太氏・鈴木 秀弘氏.03a.pdf … 著者が複数
//   202609旅する座談会・２：宮里・久保・島本・山本・栗原氏03a.pdf     … 版の前に「.」が無いこともある
//   202610・調査部コラム・８：調査部.03b.pdf                      … 部署名
//   202608・北九州大会開催報告.02a.pdf                            … 著者なし
//   ＝「年月6桁 ＋ 題（・回数）：著者氏（・著者氏）．版」

import { fileKey } from '../../src/lib/pdfPath.js'

export function parsePdfFilename(name) {
    let s = fileKey(name).replace(/\.pdf$/i, '')
    // 末尾の版（.02a／03a／.3a／.02a_WCC25）を外す
    s = s.replace(/\s*\.?\d{1,2}[a-z](_[A-Za-z0-9]+)?$/, '').trim()

    let issueYm = null
    const ym = s.match(/^(20\d{2})(0[1-9]|1[0-2])/)
    if (ym) {
        issueYm = `${ym[1]}-${ym[2]}`
        s = s.slice(6)
    }
    s = s.replace(/^・/, '').trim()

    const colon = s.indexOf('：')
    const title = (colon >= 0 ? s.slice(0, colon) : s).trim()
    const authorPart = colon >= 0 ? s.slice(colon + 1) : ''
    const authors = authorPart
        .split('・')
        .map((a) => a.replace(/氏\s*$/, '').trim())
        .filter(Boolean)

    let series = title
    let seriesNo = null
    const sn = title.match(/^(.*)・([0-9０-９]+)$/)
    if (sn) {
        series = sn[1]
        seriesNo = parseInt(sn[2].normalize('NFKC'), 10)
    }
    return { issueYm, title, series, seriesNo, authors }
}
