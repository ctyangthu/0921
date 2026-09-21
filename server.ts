import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { searchStocks, getStockInfo, generateHistoryData } from './server/stockData';
import { crawlStockNews } from './server/newsCrawler';
import { generateComprehensiveAnalysis } from './server/geminiService';
import { PeriodType } from './src/types';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Stock search endpoint (supports symbol or company name)
  app.get('/api/stock/search', (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const results = searchStocks(q);
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Stock quote
  app.get('/api/stock/quote', (req, res) => {
    try {
      const symbol = (req.query.symbol as string) || '2330';
      const info = getStockInfo(symbol);
      res.json({ success: true, data: info });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Stock technical chart history
  app.get('/api/stock/history', (req, res) => {
    try {
      const symbol = (req.query.symbol as string) || '2330';
      const period = (req.query.period as PeriodType) || '60D';
      const history = generateHistoryData(symbol, period);
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Real-time financial news crawler & sentiment analysis
  app.get('/api/stock/news', async (req, res) => {
    try {
      const symbol = (req.query.symbol as string) || '2330';
      const name = req.query.name as string | undefined;
      const sentimentResult = await crawlStockNews(symbol, name);
      res.json({ success: true, data: sentimentResult });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Comprehensive AI analysis (combining technical indicators + news sentiment)
  app.post('/api/stock/analyze', async (req, res) => {
    try {
      const symbol = req.body.symbol || '2330';
      const period = (req.body.period as PeriodType) || '60D';
      const stock = getStockInfo(symbol);
      const { points, summary: technicalSummary } = generateHistoryData(symbol, period);
      const sentimentResult = await crawlStockNews(symbol, stock.name);
      
      const analysis = await generateComprehensiveAnalysis(
        stock,
        technicalSummary,
        sentimentResult,
        points
      );

      res.json({
        success: true,
        data: {
          stock,
          technical: technicalSummary,
          sentiment: sentimentResult,
          analysis,
          points
        }
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware in dev / static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Stock analysis platform listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
