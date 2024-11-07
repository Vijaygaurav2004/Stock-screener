# Stock Screener Application

This application is a stock screener built with Next.js and React. It allows users to create custom queries to filter stocks based on various financial metrics.

## Features

- **Custom Query Input**: Users can input custom queries to filter stocks. The query supports conditions like `Market Capitalization > 500 AND Price to Earning < 15 AND Return on Capital Employed > 22%`.
- **Stock Data Fetching**: The application fetches stock data from a Google Sheets CSV file using the `fetchStockData` function.
- **Dynamic Filtering**: Stocks are filtered based on user queries using the `filterStocks` function, which evaluates each stock against the query conditions.
- **Sorting and Pagination**: Users can sort stocks by different fields and navigate through paginated results.
- **State Management**: The application uses React hooks for managing state, including query input, filtered results, and pagination.

## Components

- **StockScreener**: The main component that handles user input, displays results, and manages state.
  - **Query Input**: A textarea for entering custom queries.
  - **Results Table**: Displays filtered stocks with sorting and pagination controls.

- **UI Components**: Includes reusable components like `Button`, `Checkbox`, `Input`, `Table`, and `Select` for building the user interface.

## Code Structure

- **`components/stock-screener.tsx`**: Contains the main logic for the stock screener, including query parsing, filtering, and rendering the UI.
  - Query parsing and evaluation:
    ```typescript:components/stock-screener.tsx
    startLine: 46
    endLine: 99
    ```
  - State management and effects:
    ```typescript:components/stock-screener.tsx
    startLine: 123
    endLine: 185
    ```

- **`lib/fetchStockData.ts`**: Handles fetching and parsing stock data from a CSV file.
  ```typescript:lib/fetchStockData.ts
  startLine: 3
  endLine: 60
  ```

- **`components/ui`**: Contains UI components like `Input`, `Select`, `Table`, and `Checkbox` for building the interface.
  - Input component:
    ```typescript:components/ui/input.tsx
    startLine: 1
    endLine: 25
    ```
  - Table component:
    ```typescript:components/ui/table.tsx
    startLine: 1
    endLine: 117
    ```

## Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
