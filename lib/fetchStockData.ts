import Papa from 'papaparse'

interface StockData {
  Ticker: string;
  'Market Capitalization (B)': string;
  'P/E Ratio': string;
  'ROE (%)': string;
  'Debt-to-Equity': string;
  'Dividend Yield (%)': string;
  'Revenue Growth (%)': string;
  'EPS Growth (%)': string;
  'Current Ratio': string;
  'Gross Margin (%)': string;
}

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

          const stocks = (results.data as StockData[])
            .filter((row) => row['Ticker'])
            .map((row, index) => ({
              id: index + 1,
              name: row['Ticker'],
              marketCap: parseFloat(row['Market Capitalization (B)'].replace(/,/g, '')),
              pe: parseFloat(row['P/E Ratio'].replace(/,/g, '')),
              roe: parseFloat(row['ROE (%)'].replace(/,/g, '')),
              debtToEquity: parseFloat(row['Debt-to-Equity'].replace(/,/g, '')),
              divYield: parseFloat(row['Dividend Yield (%)'].replace(/,/g, '')),
              revenueGrowth: parseFloat(row['Revenue Growth (%)'].replace(/,/g, '')),
              epsGrowth: parseFloat(row['EPS Growth (%)'].replace(/,/g, '')),
              currentRatio: parseFloat(row['Current Ratio'].replace(/,/g, '')),
              grossMargin: parseFloat(row['Gross Margin (%)'].replace(/,/g, ''))
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
