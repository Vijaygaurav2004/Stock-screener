'use client'

import { useEffect, useState } from 'react'
import { fetchStockData } from '@/lib/fetchStockData'
import { ChevronRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Stock {
  id: number
  name: string
  marketCap: number
  pe: number
  roe: number
  debtToEquity: number
  divYield: number
  revenueGrowth: number
  epsGrowth: number
  currentRatio: number
  grossMargin: number
}

interface QueryCondition {
  field: string
  operator: string
  value: number
}

type SortField = keyof Stock | 'id';
type SortDirection = 'asc' | 'desc';

interface SortState {
  field: SortField;
  direction: SortDirection;
}

function parseQuery(queryString: string): QueryCondition[] {
  const lines = queryString
    .split('\n')
    .map(line => line.replace(/\s+AND\s*$/, '').trim())
    .filter(line => line);
    
  return lines.map(line => {
    const [field, operator, value] = line.split(/\s*(>|<|=)\s*/);
    return {
      field: field.trim(),
      operator: operator.trim(),
      value: parseFloat(value)
    };
  });
}

function evaluateCondition(stock: Stock, condition: QueryCondition): boolean {
  const fieldMap: { [key: string]: keyof Stock } = {
    'Market Capitalization': 'marketCap',
    'P/E Ratio': 'pe',
    'ROE': 'roe',
    'Debt-to-Equity': 'debtToEquity',
    'Dividend Yield': 'divYield',
    'Revenue Growth': 'revenueGrowth',
    'EPS Growth': 'epsGrowth',
    'Current Ratio': 'currentRatio',
    'Gross Margin': 'grossMargin'
  }

  const stockField = fieldMap[condition.field]
  if (!stockField) return true

  const stockValue = stock[stockField]
  
  switch (condition.operator) {
    case '>':
      return Number(stockValue) > condition.value
    case '<':
      return Number(stockValue) < condition.value
    case '=':
      return stockValue === condition.value
    default:
      return true
  }
}

function filterStocks(stocks: Stock[], query: string): Stock[] {
  if (!query.trim()) return stocks
  
  const conditions = parseQuery(query)
  return stocks.filter(stock => 
    conditions.every(condition => evaluateCondition(stock, condition))
  )
}

const paginateResults = (items: Stock[], currentPage: number, itemsPerPage: number) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

const sortStocks = (stocks: Stock[], sortState: SortState) => {
  return [...stocks].sort((a, b) => {
    let aValue = sortState.field === 'id' ? a.id : a[sortState.field as keyof Stock];
    let bValue = sortState.field === 'id' ? b.id : b[sortState.field as keyof Stock];
    
    if (aValue === null) aValue = 0;
    if (bValue === null) bValue = 0;
    
    if (sortState.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}

export function StockScreener() {
  const [showResults, setShowResults] = useState(false)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([])
  const [sort, setSort] = useState<SortState>({
    field: 'id',
    direction: 'asc'
  });

  useEffect(() => {
    async function loadStockData() {
      try {
        const data = await fetchStockData() as Stock[]
        setStocks(data)
      } catch (error) {
        console.error('Error loading stock data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStockData()
  }, [])

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.query) {
        setQuery(event.state.query);
      }
      if (event.state?.showResults !== undefined) {
        setShowResults(event.state.showResults);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleRunQuery = () => {
    const filtered = filterStocks(stocks, query)
    setFilteredStocks(filtered)
    setShowResults(true)
    
    window.history.pushState(
      { query, showResults: true },
      '',
      window.location.pathname
    );
  }

  const handleReset = () => {
    setShowResults(false)
    setPage(1)
    
    window.history.pushState(
      { query, showResults: false },
      '',
      window.location.pathname
    );
  }

  if (showResults) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        {loading ? (
          <div className="text-center">Loading stock data...</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="mb-4"
              >
                ← Back to Query
              </Button>
              <div className="text-sm text-muted-foreground">
                {filteredStocks.length} results found. Showing page {page} of {Math.ceil(filteredStocks.length / 10)}
              </div>
            </div>

            <div className="border rounded-lg mb-6 overflow-x-auto bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      { id: 'id', label: 'S.No.' },
                      { id: 'name', label: 'Name' },
                      { id: 'marketCap', label: 'Market Cap (B)' },
                      { id: 'pe', label: 'P/E' },
                      { id: 'roe', label: 'ROE %' },
                      { id: 'debtToEquity', label: 'D/E Ratio' },
                      { id: 'divYield', label: 'Div Yield %' },
                      { id: 'revenueGrowth', label: 'Rev Growth %' },
                      { id: 'epsGrowth', label: 'EPS Growth %' },
                      { id: 'currentRatio', label: 'Current Ratio' },
                      { id: 'grossMargin', label: 'Gross Margin %' }
                    ].map(({ id, label }) => (
                      <TableHead 
                        key={id}
                        className="cursor-pointer hover:bg-slate-100 text-blue-600 font-medium"
                        onClick={() => {
                          setSort(prev => ({
                            field: id as SortField,
                            direction: prev.field === id ? 
                              (prev.direction === 'asc' ? 'desc' : 'asc') : 
                              'asc'
                          }));
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {sort.field === id && (
                            <span className="text-xs">
                              {sort.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginateResults(sortStocks(filteredStocks, sort), page, 10).map((stock, index) => (
                    <TableRow key={stock.id}>
                      <TableCell>{((page - 1) * 10) + index + 1}</TableCell>
                      <TableCell className="font-medium text-blue-600">{stock.name}</TableCell>
                      <TableCell>{(stock.marketCap ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{(stock.pe ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{(stock.roe ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{(stock.debtToEquity ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{(stock.divYield ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{(stock.revenueGrowth ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{(stock.epsGrowth ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{(stock.currentRatio ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{(stock.grossMargin ?? 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex gap-2 flex-wrap justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(3, Math.ceil(filteredStocks.length / 10)) }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(Math.min(Math.ceil(filteredStocks.length / 10), page + 1))}
                  disabled={page === Math.ceil(filteredStocks.length / 10)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground text-center sm:text-right">
                Showing {((page - 1) * 10) + 1}-{Math.min(page * 10, filteredStocks.length)} of {filteredStocks.length} results
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="font-medium mb-4">Search Query</h2>
              <p className="text-sm text-muted-foreground mb-2">You can customize the query below:</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    className="font-mono min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={query}
                    onChange={(e) => {
                      const input = e.target.value;
                      const formattedInput = input
                        .split('\n')
                        .map(line => {
                          let cleanLine = line.replace(/\s+AND\s*$/, '');
                          if (cleanLine && !cleanLine.endsWith('AND')) {
                            cleanLine += ' AND';
                          }
                          return cleanLine;
                        })
                        .join('\n');
                      setQuery(formattedInput);
                    }}
                    placeholder="Enter your query here..."
                  />
                  <Button
                    onClick={handleRunQuery}
                    className="bg-[#6366F1] hover:bg-[#5558E3] text-white w-full mt-2"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    RUN THIS QUERY
                  </Button>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg mb-2">Custom query example</h3>
                  <div className="space-y-1 text-sm">
                    <p className="mb-1">Dividend Yield &gt; 2 AND</p>
                    <p className="mb-1">P/E Ratio &lt; 20 AND</p>
                    <p className="mb-4">Debt-to-Equity Ratio &lt; 1</p>
                    <a href="#" className="text-blue-600 text-sm">Detailed guide on creating screens</a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
      <h1 className="text-2xl font-semibold mb-6">Create a Search Query</h1>
      
      <div className="mb-6">
        <h2 className="text-lg mb-2">Query</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <textarea
              className="font-mono min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={query}
              onChange={(e) => {
                const input = e.target.value;
                const formattedInput = input
                  .split('\n')
                  .map(line => {
                    let cleanLine = line.replace(/\s+AND\s*$/, '');
                    if (cleanLine && !cleanLine.endsWith('AND')) {
                      cleanLine += ' AND';
                    }
                    return cleanLine;
                  })
                  .join('\n');
                setQuery(formattedInput);
              }}
              placeholder="Enter your query here..."
            />
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg mb-2">Custom query example</h3>
            <p className="text-sm mb-1">Dividend Yield &gt; 2 AND</p>
            <p className="text-sm mb-1">P/E Ratio &lt; 20 AND</p>
            <p className="text-sm mb-4">Debt-to-Equity Ratio &lt; 1</p>
            <a href="#" className="text-blue-600 text-sm">Detailed guide on creating screens</a>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Checkbox id="sep2024" />
        <label htmlFor="sep2024" className="text-sm">
          Only companies with Sep 2024 results
        </label>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={handleRunQuery}
          className="bg-[#6366F1] hover:bg-[#5558E3] text-white"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          RUN THIS QUERY
        </Button>
      </div>
    </div>
  )
}