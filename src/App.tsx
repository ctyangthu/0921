import React, { useState, useEffect, useCallback } from 'react';
import { 
  StockItem, 
  PeriodType, 
  KLinePoint, 
  TechnicalSummary, 
  SentimentAnalysisResult, 
  ComprehensiveAnalysisResult 
} from './types';
import { Header } from './components/Header';
import { StockSummaryBar } from './components/StockSummaryBar';
import { PeriodSelector } from './components/PeriodSelector';
import { CandlestickChart } from './components/CandlestickChart';
import { TechnicalSignalsCard } from './components/TechnicalSignalsCard';
import { NewsSentimentCard } from './components/NewsSentimentCard';
import { ComprehensiveJudgmentCard } from './components/ComprehensiveJudgmentCard';
import { AlertCircle } from 'lucide-react';

const DEFAULT_STOCK: StockItem = {
  symbol: '2330',
  name: '台積電',
  market: 'TW',
  currency: 'TWD',
  currentPrice: 975,
  change: 15,
  changePercent: 1.56,
  volume: 38250000,
  industry: '半導體晶圓代工'
};

export default function App() {
  const [currentStock, setCurrentStock] = useState<StockItem>(DEFAULT_STOCK);
  const [period, setPeriod] = useState<PeriodType>('60D');
  const [colorScheme, setColorScheme] = useState<'TW' | 'US'>('TW');
  
  const [activeMAs, setActiveMAs] = useState({
    ma5: true,
    ma20: true,
    ma60: true,
    ma120: true,
    ma240: true,
    bollinger: false,
  });

  const [subIndicator, setSubIndicator] = useState<'RSI' | 'KD' | 'MACD'>('KD');

  // Analytical data states
  const [points, setPoints] = useState<KLinePoint[]>([]);
  const [technical, setTechnical] = useState<TechnicalSummary | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysisResult | null>(null);
  const [comprehensive, setComprehensive] = useState<ComprehensiveAnalysisResult | null>(null);

  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedTime, setUpdatedTime] = useState<string>('');

  // Fetch Technical Chart & Indicators
  const fetchTechnicalHistory = useCallback(async (symbol: string, currentPeriod: PeriodType) => {
    setIsLoadingChart(true);
    try {
      const res = await fetch(`/api/stock/history?symbol=${symbol}&period=${currentPeriod}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPoints(data.data.points);
        setTechnical(data.data.summary);
      }
    } catch (err: any) {
      console.error('Fetch technical error:', err);
      setError('載入歷史線圖時發生異常，請重試。');
    } finally {
      setIsLoadingChart(false);
    }
  }, []);

  // Fetch News & Sentiment
  const fetchNewsSentiment = useCallback(async (symbol: string, name?: string) => {
    setIsLoadingNews(true);
    try {
      const res = await fetch(`/api/stock/news?symbol=${symbol}&name=${encodeURIComponent(name || '')}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSentiment(data.data);
      }
    } catch (err: any) {
      console.error('Fetch news error:', err);
    } finally {
      setIsLoadingNews(false);
    }
  }, []);

  // Full Comprehensive AI Multi-Factor Analysis
  const runFullAnalysis = useCallback(async (stock: StockItem, currentPeriod: PeriodType) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/stock/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: stock.symbol, period: currentPeriod }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPoints(data.data.points);
        setTechnical(data.data.technical);
        setSentiment(data.data.sentiment);
        setComprehensive(data.data.analysis);
        setCurrentStock(data.data.stock);
        setUpdatedTime(new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        throw new Error(data.error || '分析服務未正常回應');
      }
    } catch (err: any) {
      console.error('Run full analysis error:', err);
      setError(err.message || '執行綜合研判時發生問題');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    runFullAnalysis(currentStock, period);
  }, []);

  // Period change only reloads chart
  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
    fetchTechnicalHistory(currentStock.symbol, newPeriod);
  };

  // Stock selection triggers full analysis
  const handleSelectStock = (stock: StockItem) => {
    setCurrentStock(stock);
    runFullAnalysis(stock, period);
  };

  const handleToggleMA = (key: keyof typeof activeMAs) => {
    setActiveMAs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleColorScheme = () => {
    setColorScheme(prev => (prev === 'TW' ? 'US' : 'TW'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentStock={currentStock}
        onSelectStock={handleSelectStock}
        onTriggerAnalysis={() => runFullAnalysis(currentStock, period)}
        isAnalyzing={isAnalyzing}
        colorScheme={colorScheme}
        onToggleColorScheme={handleToggleColorScheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 sm:px-6 space-y-5">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              關閉
            </button>
          </div>
        )}

        {/* Stock Price & Key Moving Averages Summary Bar */}
        <StockSummaryBar
          stock={currentStock}
          technical={technical}
          colorScheme={colorScheme}
          updatedTime={updatedTime}
        />

        {/* Period Selector (30天 / 60天 / 90天 / 半年線 / 一年線) */}
        <PeriodSelector
          currentPeriod={period}
          onSelectPeriod={handlePeriodChange}
          activeMAs={activeMAs}
          onToggleMA={handleToggleMA}
          subIndicator={subIndicator}
          onSelectSubIndicator={setSubIndicator}
        />

        {/* Main Interactive Candlestick & Technical Indicators Chart */}
        <CandlestickChart
          points={points}
          colorScheme={colorScheme}
          activeMAs={activeMAs}
          subIndicator={subIndicator}
        />

        {/* Core Comprehensive Multi-Factor Judgment Card */}
        <ComprehensiveJudgmentCard
          analysis={comprehensive}
          isLoading={isAnalyzing}
          onRefresh={() => runFullAnalysis(currentStock, period)}
        />

        {/* Side-by-side: Technical Breakdown & News Sentiment Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Technical Indicator Detailed Signals */}
          <TechnicalSignalsCard
            summary={technical}
            latestPoint={points[points.length - 1]}
          />

          {/* News Crawler & Sentiment Analysis */}
          <NewsSentimentCard
            sentiment={sentiment}
            isLoading={isLoadingNews}
            onRefreshNews={() => fetchNewsSentiment(currentStock.symbol, currentStock.name)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-4 text-center text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>股票技術與消息面綜合研判儀 · Powered by Gemini 3.8 Flash & Quantitative Technical Engine</span>
          <span className="text-[11px] text-slate-600">本系統分析結果僅供參考與學術研討，投資決策請審慎評估市場風險。</span>
        </div>
      </footer>
    </div>
  );
}
