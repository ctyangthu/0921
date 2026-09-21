import { StockItem, KLinePoint, PeriodType, TechnicalSummary } from '../src/types';

export const POPULAR_STOCKS: StockItem[] = [
  { symbol: '2330', name: '台積電', market: 'TW', currency: 'TWD', currentPrice: 975, change: 15, changePercent: 1.56, volume: 38250000, industry: '半導體晶圓代工' },
  { symbol: '2454', name: '聯發科', market: 'TW', currency: 'TWD', currentPrice: 1320, change: 25, changePercent: 1.93, volume: 8900000, industry: 'IC設計' },
  { symbol: '2317', name: '鴻海', market: 'TW', currency: 'TWD', currentPrice: 185.5, change: -1.0, changePercent: -0.54, volume: 46200000, industry: '電子代工/AI伺服器' },
  { symbol: '2382', name: '廣達', market: 'TW', currency: 'TWD', currentPrice: 285.0, change: 4.5, changePercent: 1.60, volume: 18500000, industry: 'AI伺服器/筆電代工' },
  { symbol: '3231', name: '緯創', market: 'TW', currency: 'TWD', currentPrice: 112.5, change: 2.0, changePercent: 1.81, volume: 29400000, industry: 'AI伺服器運算' },
  { symbol: '2603', name: '長榮', market: 'TW', currency: 'TWD', currentPrice: 198.5, change: 3.5, changePercent: 1.79, volume: 22100000, industry: '航運物流' },
  { symbol: '0050', name: '元大台灣50', market: 'ETF', currency: 'TWD', currentPrice: 178.2, change: 1.8, changePercent: 1.02, volume: 15600000, industry: '大盤市值型ETF' },
  { symbol: '0056', name: '元大高股息', market: 'ETF', currency: 'TWD', currentPrice: 38.6, change: 0.15, changePercent: 0.39, volume: 24300000, industry: '高股息ETF' },
  { symbol: '00878', name: '國泰永續高股息', market: 'ETF', currency: 'TWD', currentPrice: 22.8, change: 0.08, changePercent: 0.35, volume: 38900000, industry: '高股息ETF' },
  { symbol: '2881', name: '富邦金', market: 'TW', currency: 'TWD', currentPrice: 89.4, change: 0.6, changePercent: 0.68, volume: 16500000, industry: '金控金融' },
  { symbol: '2882', name: '國泰金', market: 'TW', currency: 'TWD', currentPrice: 65.8, change: 0.4, changePercent: 0.61, volume: 14200000, industry: '金控金融' },
  { symbol: 'NVDA', name: '輝達 (NVIDIA)', market: 'US', currency: 'USD', currentPrice: 128.5, change: 4.2, changePercent: 3.38, volume: 48900000, industry: 'AI晶片/GPU' },
  { symbol: 'AAPL', name: '蘋果 (Apple)', market: 'US', currency: 'USD', currentPrice: 225.8, change: 1.5, changePercent: 0.67, volume: 39500000, industry: '消費電子/軟體' },
  { symbol: 'TSLA', name: '特斯拉 (Tesla)', market: 'US', currency: 'USD', currentPrice: 248.6, change: -5.4, changePercent: -2.13, volume: 55200000, industry: '電動車/自駕AI' },
  { symbol: 'MSFT', name: '微軟 (Microsoft)', market: 'US', currency: 'USD', currentPrice: 432.1, change: 3.8, changePercent: 0.89, volume: 21300000, industry: '雲端運算/AI' },
  { symbol: 'AMD', name: '超微 (AMD)', market: 'US', currency: 'USD', currentPrice: 156.4, change: 3.1, changePercent: 2.02, volume: 32400000, industry: '處理器/AI加速晶片' },
  { symbol: 'TSM', name: '台積電 ADR', market: 'US', currency: 'USD', currentPrice: 174.6, change: 2.8, changePercent: 1.63, volume: 16800000, industry: '晶圓代工' }
];

export function searchStocks(query: string): StockItem[] {
  if (!query || query.trim() === '') {
    return POPULAR_STOCKS.slice(0, 10);
  }
  const q = query.trim().toLowerCase();
  const matched = POPULAR_STOCKS.filter(s => 
    s.symbol.toLowerCase().includes(q) || 
    s.name.toLowerCase().includes(q) ||
    (s.industry && s.industry.toLowerCase().includes(q))
  );

  if (matched.length > 0) return matched;

  // If not found in default list, synthesize dynamic stock item
  const isTaiwanTicker = /^\d{4,5}$/.test(q);
  const isUsTicker = /^[A-Za-z]{1,5}$/.test(q);

  const newStock: StockItem = {
    symbol: query.trim().toUpperCase(),
    name: query.trim().toUpperCase(),
    market: isTaiwanTicker ? 'TW' : (isUsTicker ? 'US' : 'TW'),
    currency: isTaiwanTicker ? 'TWD' : 'USD',
    currentPrice: isTaiwanTicker ? 120.0 : 150.0,
    change: 1.5,
    changePercent: 1.25,
    volume: 12000000,
    industry: '產業龍頭'
  };

  return [newStock, ...POPULAR_STOCKS.slice(0, 5)];
}

export function getStockInfo(symbol: string): StockItem {
  const cleanSymbol = symbol.trim().toUpperCase();
  const existing = POPULAR_STOCKS.find(s => 
    s.symbol.toUpperCase() === cleanSymbol || 
    s.name.toLowerCase().includes(symbol.toLowerCase())
  );
  if (existing) return existing;

  const isTaiwan = /^\d{4,5}$/.test(cleanSymbol);
  return {
    symbol: cleanSymbol,
    name: cleanSymbol,
    market: isTaiwan ? 'TW' : 'US',
    currency: isTaiwan ? 'TWD' : 'USD',
    currentPrice: isTaiwan ? 150 : 180,
    change: 2.5,
    changePercent: 1.69,
    volume: 15000000,
    industry: '綜合產業'
  };
}

/**
 * Generate high-fidelity historical data spanning at least 260 trading days
 * so that MA5, MA20, MA60, MA120 (半年線), MA240 (一年線) can be calculated with full accuracy.
 */
export function generateHistoryData(symbol: string, period: PeriodType): { points: KLinePoint[]; summary: TechnicalSummary } {
  const stock = getStockInfo(symbol);
  const basePrice = stock.currentPrice;

  // We need at least 260 days to compute 240-day Moving Average (一年線)
  const totalDays = 270;
  const now = new Date();
  
  // Seed random deterministically by symbol
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed = (seed * 31 + symbol.charCodeAt(i)) & 0xffffffff;
  }
  const pseudoRandom = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return (seed < 0 ? seed + 4294967296 : seed) / 4294967296;
  };

  // Generate price series backward from current price
  const rawData: { date: string; open: number; high: number; low: number; close: number; volume: number }[] = [];
  
  // We'll simulate walking backward or forward
  // Let's generate a trend path that finishes at stock.currentPrice
  const dailyReturns: number[] = [];
  const drift = (stock.changePercent > 0 ? 0.0006 : -0.0003);
  const volatility = 0.016;

  for (let i = 0; i < totalDays; i++) {
    const u1 = Math.max(0.0001, pseudoRandom());
    const u2 = pseudoRandom();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    dailyReturns.push(drift + volatility * z);
  }

  // Calculate cumulative close prices
  const closes: number[] = new Array(totalDays);
  closes[totalDays - 1] = basePrice;
  for (let i = totalDays - 2; i >= 0; i--) {
    const ret = dailyReturns[i + 1];
    closes[i] = closes[i + 1] / (1 + ret);
  }

  // Build exact business day dates (chronological order)
  const dates: string[] = [];
  const cur = new Date();
  while (cur.getDay() === 0 || cur.getDay() === 6) {
    cur.setDate(cur.getDate() - 1);
  }
  const dCursor = new Date(cur);
  while (dates.length < totalDays) {
    if (dCursor.getDay() !== 0 && dCursor.getDay() !== 6) {
      dates.push(dCursor.toISOString().split('T')[0]);
    }
    dCursor.setDate(dCursor.getDate() - 1);
  }
  dates.reverse(); // Chronological: index 0 is oldest, index totalDays - 1 is today

  for (let i = 0; i < totalDays; i++) {
    const dateStr = dates[i];
    const close = Math.round(closes[i] * 100) / 100;
    const prevClose = i > 0 ? closes[i - 1] : close * 0.995;
    const intradayVol = close * (0.008 + pseudoRandom() * 0.014);
    
    const open = Math.round((prevClose + (pseudoRandom() - 0.48) * intradayVol * 0.8) * 100) / 100;
    const high = Math.round((Math.max(open, close) + pseudoRandom() * intradayVol) * 100) / 100;
    const low = Math.round((Math.min(open, close) - pseudoRandom() * intradayVol) * 100) / 100;
    const baseVol = stock.volume > 0 ? stock.volume : 20000000;
    const volVariation = 0.6 + pseudoRandom() * 0.9;
    const volume = Math.round(baseVol * volVariation);

    rawData.push({ date: dateStr, open, high, low, close, volume });
  }

  // Ensure chronological order
  rawData.sort((a, b) => a.date.localeCompare(b.date));

  // Compute Technical Indicators
  const fullPoints: KLinePoint[] = [];

  // RSI state
  let avgGain = 0;
  let avgLoss = 0;

  // KD state
  let prevK = 50;
  let prevD = 50;

  // MACD state (EMA12, EMA26, DEA9)
  let ema12 = rawData[0].close;
  let ema26 = rawData[0].close;
  let dea = 0;

  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];
    const point: KLinePoint = { ...item };

    // MA5
    if (i >= 4) {
      let sum = 0;
      for (let j = i - 4; j <= i; j++) sum += rawData[j].close;
      point.ma5 = Math.round((sum / 5) * 100) / 100;
    }

    // MA20 (月線)
    if (i >= 19) {
      let sum = 0;
      for (let j = i - 19; j <= i; j++) sum += rawData[j].close;
      point.ma20 = Math.round((sum / 20) * 100) / 100;

      // Bollinger Bands (20, 2)
      let variance = 0;
      const mean = sum / 20;
      for (let j = i - 19; j <= i; j++) {
        variance += Math.pow(rawData[j].close - mean, 2);
      }
      const stdDev = Math.sqrt(variance / 20);
      point.bbMiddle = Math.round(mean * 100) / 100;
      point.bbUpper = Math.round((mean + 2 * stdDev) * 100) / 100;
      point.bbLower = Math.round((mean - 2 * stdDev) * 100) / 100;
    }

    // MA60 (季線)
    if (i >= 59) {
      let sum = 0;
      for (let j = i - 59; j <= i; j++) sum += rawData[j].close;
      point.ma60 = Math.round((sum / 60) * 100) / 100;
    }

    // MA120 (半年線)
    if (i >= 119) {
      let sum = 0;
      for (let j = i - 119; j <= i; j++) sum += rawData[j].close;
      point.ma120 = Math.round((sum / 120) * 100) / 100;
    }

    // MA240 (一年線)
    if (i >= 239) {
      let sum = 0;
      for (let j = i - 239; j <= i; j++) sum += rawData[j].close;
      point.ma240 = Math.round((sum / 240) * 100) / 100;
    }

    // RSI (14)
    if (i > 0) {
      const diff = rawData[i].close - rawData[i - 1].close;
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      if (i <= 14) {
        avgGain += gain / 14;
        avgLoss += loss / 14;
        if (i === 14) {
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          point.rsi = Math.round((100 - (100 / (1 + rs))) * 10) / 10;
        }
      } else {
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        point.rsi = Math.round((100 - (100 / (1 + rs))) * 10) / 10;
      }
    }

    // KD (9, 3, 3)
    if (i >= 8) {
      let highestHigh = rawData[i].high;
      let lowestLow = rawData[i].low;
      for (let j = i - 8; j <= i; j++) {
        if (rawData[j].high > highestHigh) highestHigh = rawData[j].high;
        if (rawData[j].low < lowestLow) lowestLow = rawData[j].low;
      }
      const range = highestHigh - lowestLow;
      const rsv = range === 0 ? 50 : ((rawData[i].close - lowestLow) / range) * 100;
      prevK = (2 / 3) * prevK + (1 / 3) * rsv;
      prevD = (2 / 3) * prevD + (1 / 3) * prevK;
      point.k = Math.round(prevK * 10) / 10;
      point.d = Math.round(prevD * 10) / 10;
    }

    // MACD (12, 26, 9)
    if (i > 0) {
      ema12 = ema12 * (11 / 13) + rawData[i].close * (2 / 13);
      ema26 = ema26 * (25 / 27) + rawData[i].close * (2 / 27);
      const dif = ema12 - ema26;
      point.dif = Math.round(dif * 100) / 100;
      if (i >= 26) {
        dea = dea * (8 / 10) + dif * (2 / 10);
        point.dea = Math.round(dea * 100) / 100;
        point.macdBar = Math.round((dif - dea) * 2 * 100) / 100;
      }
    }

    fullPoints.push(point);
  }

  // Filter based on user-requested period
  let sliceCount = 30;
  if (period === '30D') sliceCount = 30;
  else if (period === '60D') sliceCount = 60; // 季線週期
  else if (period === '90D') sliceCount = 90;
  else if (period === '120D') sliceCount = 120; // 半年線週期
  else if (period === '240D') sliceCount = 240; // 一年線週期

  const displayPoints = fullPoints.slice(-sliceCount);

  // Compute Technical Summary on the latest day
  const latest = fullPoints[fullPoints.length - 1];
  const curPrice = latest.close;

  const aboveMA20 = latest.ma20 ? curPrice >= latest.ma20 : true;
  const aboveMA60 = latest.ma60 ? curPrice >= latest.ma60 : true;
  const aboveMA120 = latest.ma120 ? curPrice >= latest.ma120 : true;
  const aboveMA240 = latest.ma240 ? curPrice >= latest.ma240 : true;

  let maTrend: TechnicalSummary['maTrend'] = '震盪整理';
  if (latest.ma5 && latest.ma20 && latest.ma60 && latest.ma120) {
    if (latest.ma5 > latest.ma20 && latest.ma20 > latest.ma60 && latest.ma60 > latest.ma120) {
      maTrend = '多頭排列';
    } else if (latest.ma5 < latest.ma20 && latest.ma20 < latest.ma60 && latest.ma60 < latest.ma120) {
      maTrend = '空頭排列';
    } else {
      maTrend = '均線糾結';
    }
  }

  let rsiSignal: TechnicalSummary['rsiSignal'] = '中立震盪';
  if (latest.rsi) {
    if (latest.rsi >= 75) rsiSignal = '超買區 (警戒)';
    else if (latest.rsi <= 25) rsiSignal = '超賣區 (反彈可期)';
    else if (latest.rsi >= 55) rsiSignal = '強勢區間';
    else if (latest.rsi <= 45) rsiSignal = '弱勢區間';
  }

  let kdSignal: TechnicalSummary['kdSignal'] = '中立';
  if (latest.k !== undefined && latest.d !== undefined) {
    if (latest.k > 80 && latest.d > 80) kdSignal = '高檔鈍化';
    else if (latest.k < 20 && latest.d < 20) kdSignal = '低檔整理';
    else if (latest.k > latest.d && (latest.k - latest.d) < 5) kdSignal = 'KD黃金交叉 (買訊)';
    else if (latest.k < latest.d && (latest.d - latest.k) < 5) kdSignal = 'KD死亡交叉 (賣訊)';
  }

  let macdSignal: TechnicalSummary['macdSignal'] = '柱狀收斂';
  if (latest.macdBar !== undefined) {
    if (latest.macdBar > 0) {
      macdSignal = latest.macdBar > 0.5 ? '紅柱放大' : 'MACD翻紅 (多頭增強)';
    } else {
      macdSignal = latest.macdBar < -0.5 ? '綠柱擴大' : 'MACD翻綠 (空頭增強)';
    }
  }

  // Calculate support and resistance based on recent high/low and MAs
  const recentSlice = fullPoints.slice(-60);
  const highestRecent = Math.max(...recentSlice.map(p => p.high));
  const lowestRecent = Math.min(...recentSlice.map(p => p.low));
  
  // Calculate technical score (0 - 100)
  let score = 50;
  if (maTrend === '多頭排列') score += 18;
  else if (maTrend === '空頭排列') score -= 18;

  if (aboveMA20) score += 6; else score -= 6;
  if (aboveMA60) score += 8; else score -= 8;
  if (aboveMA120) score += 8; else score -= 8;
  if (aboveMA240) score += 10; else score -= 10;

  if (kdSignal.includes('黃金交叉')) score += 8;
  if (kdSignal.includes('死亡交叉')) score -= 8;

  if (macdSignal.includes('翻紅') || macdSignal.includes('紅柱放大')) score += 7;
  if (macdSignal.includes('翻綠') || macdSignal.includes('綠柱擴大')) score -= 7;

  if (rsiSignal === '超賣區 (反彈可期)') score += 5;
  if (rsiSignal === '超買區 (警戒)') score -= 5;

  score = Math.max(10, Math.min(95, score));

  const summary: TechnicalSummary = {
    maTrend,
    aboveMA20,
    aboveMA60,
    aboveMA120,
    aboveMA240,
    rsiSignal,
    kdSignal,
    macdSignal,
    supportLevel: Math.round((latest.ma120 || lowestRecent) * 100) / 100,
    resistanceLevel: Math.round(highestRecent * 100) / 100,
    technicalScore: score
  };

  return { points: displayPoints, summary };
}
