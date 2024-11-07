import Papa from 'papaparse'

export async function fetchStockData() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQIH14Y1_iJa5PU5tBm5OQRnbR3qdLAMv2j9DuRukbiK1ku0IqOlOMmopqTCQkj2WVMI7a_ko3-U0k8/pub?output=csv'

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvData = await response.text()
    console.log('CSV Data received:', csvData.substring(0, 200))

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('Parse errors:', results.errors)
          }

          const stocks = results.data
            .filter((row: any) => row['Ticker'])
            .map((row: any, index) => ({
              id: index + 1,
              name: row['Ticker'],
              marketCap: parseFloat(String(row['Market Capitalization (B)']).replace(/,/g, '')) || 0,
              pe: parseFloat(String(row['P/E Ratio']).replace(/,/g, '')) || 0,
              roe: parseFloat(String(row['ROE (%)']).replace(/,/g, '')) || 0,
              debtToEquity: parseFloat(String(row['Debt-to-Equity']).replace(/,/g, '')) || 0,
              divYield: parseFloat(String(row['Dividend Yield (%)']).replace(/,/g, '')) || 0,
              revenueGrowth: parseFloat(String(row['Revenue Growth (%)']).replace(/,/g, '')) || 0,
              epsGrowth: parseFloat(String(row['EPS Growth (%)']).replace(/,/g, '')) || 0,
              currentRatio: parseFloat(String(row['Current Ratio']).replace(/,/g, '')) || 0,
              grossMargin: parseFloat(String(row['Gross Margin (%)']).replace(/,/g, '')) || 0
            }))

          console.log('Processed stocks:', stocks.slice(0, 2))
          resolve(stocks)
        },
        error: (error: Error) => {
          console.error('Papa Parse error:', error)
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('Error fetching stock data:', error)
    throw error
  }
}
