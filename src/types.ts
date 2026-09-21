export type PeriodType = '30D' | '60D' | '90D' | '120D' | '240D';

export interface StockItem {
  symbol: string;
  name: string;
  market: 'TW' | 'US' | 'ETF';
  currency: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  high52w?: number;
  low52w?: number;
  industry?: string;
}

export interface KLinePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Moving averages
  ma5?: number;
  ma20?: number; // 月線
  ma60?: number; // 季線
  ma120?: number; // 半年線
  ma240?: number; // 一年線
  // Technical Indicators
  rsi?: number;
  k?: number;
  d?: number;
  dif?: number;
  dea?: number;
  macdBar?: number;
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
}

export interface TechnicalSummary {
  maTrend: '多頭排列' | '空頭排列' | '均線糾結' | '震盪整理';
  aboveMA20: boolean;
  aboveMA60: boolean; // 站上季線
  aboveMA120: boolean; // 站上半年線
  aboveMA240: boolean; // 站上年線
  rsiSignal: '超買區 (警戒)' | '超賣區 (反彈可期)' | '強勢區間' | '弱勢區間' | '中立震盪';
  kdSignal: 'KD黃金交叉 (買訊)' | 'KD死亡交叉 (賣訊)' | '高檔鈍化' | '低檔整理' | '中立';
  macdSignal: 'MACD翻紅 (多頭增強)' | 'MACD翻綠 (空頭增強)' | '柱狀收斂' | '紅柱放大' | '綠柱擴大';
  supportLevel: number;
  resistanceLevel: number;
  technicalScore: number; // 0 - 100
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url?: string;
  snippet: string;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  score: number; // -100 to +100
  catalysts?: string[];
  risks?: string[];
}

export interface SentimentAnalysisResult {
  overallScore: number; // 0 - 100 (50 is neutral, >60 bullish, <40 bearish)
  sentimentLabel: '極度樂觀' | '樂觀偏多' | '中立觀望' | '謹慎偏空' | '極度悲觀';
  bullishCount: number;
  neutralCount: number;
  bearishCount: number;
  bullishRatio: number;
  newsList: NewsItem[];
  hotTopics: string[];
  keyFactorsSummary: {
    positive: string[];
    negative: string[];
  };
}

export type OverallRating = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface ComprehensiveAnalysisResult {
  symbol: string;
  name: string;
  updatedAt: string;
  overallRating: OverallRating;
  overallScore: number; // 0 - 100
  ratingLabel: string;
  actionRecommendation: string;
  timeframePerspective: {
    d30Outlook: string; // 30天短波段研判
    d60Outlook: string; // 60天(季線)波段研判
    d90Outlook: string; // 90天中期趨勢研判
    d120Outlook: string; // 半年線長期防守位
    d240Outlook: string; // 一年線牛熊分水嶺
  };
  technicalHighlights: {
    score: number;
    title: string;
    details: string[];
  };
  sentimentHighlights: {
    score: number;
    title: string;
    details: string[];
  };
  supportResistance: {
    r2: number; // 強壓力位
    r1: number; // 頸線/近壓
    currentPrice: number;
    s1: number; // 近支撐(月線/季線)
    s2: number; // 強防守(半年線/年線)
    stopLoss: number; // 建議停損點
  };
  strategicAdvice: {
    entryStrategy: string; // 進場策略
    riskControl: string;  // 風險控管
    targetHorizon: string; // 建議持有週期
  };
  executiveReport: string;
}
