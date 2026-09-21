import { GoogleGenAI } from '@google/genai';
import { 
  ComprehensiveAnalysisResult, 
  StockItem, 
  TechnicalSummary, 
  SentimentAnalysisResult, 
  KLinePoint,
  OverallRating
} from '../src/types';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function generateComprehensiveAnalysis(
  stock: StockItem,
  technical: TechnicalSummary,
  sentiment: SentimentAnalysisResult,
  points: KLinePoint[]
): Promise<ComprehensiveAnalysisResult> {
  const curPrice = stock.currentPrice;
  const latestPoint = points[points.length - 1] || {};

  const ma5 = latestPoint.ma5 || curPrice;
  const ma20 = latestPoint.ma20 || curPrice;
  const ma60 = latestPoint.ma60 || curPrice * 0.98;
  const ma120 = latestPoint.ma120 || curPrice * 0.95; // 半年線
  const ma240 = latestPoint.ma240 || curPrice * 0.90; // 一年線

  const rsi = latestPoint.rsi || 50;
  const k = latestPoint.k || 50;
  const d = latestPoint.d || 50;
  const macdBar = latestPoint.macdBar || 0;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `你是一位華爾街與台股機構資深首席量化投資策略官。請針對以下股票進行「技術指標」與「新聞消息面情緒」的深度綜合研判。

【標的資訊】
- 代碼: ${stock.symbol}
- 名稱: ${stock.name}
- 當前市價: ${curPrice} ${stock.currency} (漲跌: ${stock.change >= 0 ? '+' : ''}${stock.change}, ${stock.changePercent}%)
- 產業板塊: ${stock.industry || '大型權值股'}

【關鍵均線與技術數據】
- MA5 (週線): ${ma5}
- MA20 (月線): ${ma20}
- MA60 (季線): ${ma60}
- MA120 (半年線): ${ma120}
- MA240 (一年線/年線): ${ma240}
- 均線排列: ${technical.maTrend}
- 股價位階: 站上月線(${technical.aboveMA20 ? '是' : '否'}), 站上季線(${technical.aboveMA60 ? '是' : '否'}), 站上半年線(${technical.aboveMA120 ? '是' : '否'}), 站上年線(${technical.aboveMA240 ? '是' : '否'})
- RSI (14): ${rsi} (${technical.rsiSignal})
- KD (9,3,3): K=${k}, D=${d} (${technical.kdSignal})
- MACD柱狀: ${macdBar} (${technical.macdSignal})
- 技術面評分: ${technical.technicalScore} / 100

【最新新聞輿情與情緒指標】
- 新聞情緒指數: ${sentiment.overallScore} / 100 (${sentiment.sentimentLabel})
- 消息多空比: 正向 ${sentiment.bullishCount} 則 / 中立 ${sentiment.neutralCount} 則 / 負向 ${sentiment.bearishCount} 則
- 焦點熱搜: ${sentiment.hotTopics.join(', ')}
- 利多因子: ${sentiment.keyFactorsSummary.positive.join('; ')}
- 潛在風險: ${sentiment.keyFactorsSummary.negative.join('; ')}

請特別分析「30天短線」、「60天季線波段」、「90天中期趨勢」、「半年線(120D)防守」、「一年線(240D)牛熊界限」各週期的多空研判，並計算出關鍵壓力位(R1, R2)、支撐位(S1, S2)、停損價位與進出場策略。

請嚴格輸出合法 JSON 格式，不得包含多餘說明文字：
{
  "overallRating": "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL",
  "overallScore": 數字(0-100),
  "ratingLabel": "強力買進" | "偏多操作" | "區間震盪觀望" | "偏空防守" | "強烈賣出",
  "actionRecommendation": "簡練具體的操作決策建議(例如: 沿月線拉回量縮分批承接，跌破半年線停損)",
  "timeframePerspective": {
    "d30Outlook": "30天短波段研判(動能、均線爭奪、KD訊號)",
    "d60Outlook": "60天季線波段研判(季線扣抵、法人季度換股邏輯)",
    "d90Outlook": "90天中期趨勢研判(中期趨勢線與營收延續性)",
    "d120Outlook": "半年線防守研判(半年線位置重要性與大波段生命線)",
    "d240Outlook": "一年線長期研判(年線牛熊分水嶺與長線價值評估)"
  },
  "technicalHighlights": {
    "score": ${technical.technicalScore},
    "title": "技術面格局概述",
    "details": ["要點1", "要點2", "要點3"]
  },
  "sentimentHighlights": {
    "score": ${sentiment.overallScore},
    "title": "消息面情緒概述",
    "details": ["要點1", "要點2", "要點3"]
  },
  "supportResistance": {
    "r2": 數字(第二道強壓力),
    "r1": 數字(近期頸線或第一道壓力),
    "currentPrice": ${curPrice},
    "s1": 數字(月線或季線支撐),
    "s2": 數字(半年線或強防守點),
    "stopLoss": 數字(建議停損參考價)
  },
  "strategicAdvice": {
    "entryStrategy": "建倉與加碼策略",
    "riskControl": "風險控管要點",
    "targetHorizon": "建議投資持有週期"
  },
  "executiveReport": "專業長文研判報告(結合技術面與新聞消息面的全面總結，250字左右)"
}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
          },
        }),
        10000
      );

      const text = response.text || '';
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed && parsed.overallRating && parsed.timeframePerspective) {
        return {
          symbol: stock.symbol,
          name: stock.name,
          updatedAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          overallRating: parsed.overallRating as OverallRating,
          overallScore: typeof parsed.overallScore === 'number' ? parsed.overallScore : 72,
          ratingLabel: parsed.ratingLabel || '偏多操作',
          actionRecommendation: parsed.actionRecommendation,
          timeframePerspective: parsed.timeframePerspective,
          technicalHighlights: parsed.technicalHighlights,
          sentimentHighlights: parsed.sentimentHighlights,
          supportResistance: parsed.supportResistance || {
            r2: Math.round(curPrice * 1.08 * 10) / 10,
            r1: Math.round(curPrice * 1.03 * 10) / 10,
            currentPrice: curPrice,
            s1: Math.round(Math.min(ma20, curPrice * 0.97) * 10) / 10,
            s2: Math.round(Math.min(ma120, curPrice * 0.92) * 10) / 10,
            stopLoss: Math.round(curPrice * 0.94 * 10) / 10,
          },
          strategicAdvice: parsed.strategicAdvice,
          executiveReport: parsed.executiveReport,
        };
      }
    } catch (e) {
      console.warn('Gemini comprehensive synthesis error, using algorithmic synthesis:', e);
    }
  }

  // Algorithmic synthesis fallback
  return generateAlgorithmicAnalysis(stock, technical, sentiment, ma5, ma20, ma60, ma120, ma240);
}

function generateAlgorithmicAnalysis(
  stock: StockItem,
  technical: TechnicalSummary,
  sentiment: SentimentAnalysisResult,
  ma5: number,
  ma20: number,
  ma60: number,
  ma120: number,
  ma240: number
): ComprehensiveAnalysisResult {
  const curPrice = stock.currentPrice;
  const techScore = technical.technicalScore;
  const sentScore = sentiment.overallScore;
  
  // Weighted multi-factor score: 55% Technical + 45% Sentiment
  const combinedScore = Math.round(techScore * 0.55 + sentScore * 0.45);

  let overallRating: OverallRating = 'NEUTRAL';
  let ratingLabel = '區間震盪觀望';

  if (combinedScore >= 80) {
    overallRating = 'STRONG_BUY';
    ratingLabel = '強力買進';
  } else if (combinedScore >= 62) {
    overallRating = 'BUY';
    ratingLabel = '偏多操作';
  } else if (combinedScore >= 45) {
    overallRating = 'NEUTRAL';
    ratingLabel = '區間震盪觀望';
  } else if (combinedScore >= 30) {
    overallRating = 'SELL';
    ratingLabel = '偏空防守';
  } else {
    overallRating = 'STRONG_SELL';
    ratingLabel = '強烈賣出';
  }

  const r1 = Math.round(curPrice * 1.035 * 10) / 10;
  const r2 = Math.round(curPrice * 1.085 * 10) / 10;
  const s1 = Math.round((technical.aboveMA20 ? ma20 : ma60) * 10) / 10;
  const s2 = Math.round(ma120 * 10) / 10;
  const stopLoss = Math.round(Math.min(s1 * 0.97, curPrice * 0.94) * 10) / 10;

  return {
    symbol: stock.symbol,
    name: stock.name,
    updatedAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    overallRating,
    overallScore: combinedScore,
    ratingLabel,
    actionRecommendation: combinedScore >= 62 
      ? `目前均線呈${technical.maTrend}，消息面偏向樂觀。建議以月線(${ma20})作為防守位，回檔量縮逢低分批布局。`
      : `短線動能處於${technical.rsiSignal}，消息面多空拉鋸。建議控制持股水位，等待技術面重新站穩季線後再行介入。`,
    timeframePerspective: {
      d30Outlook: `30天短期視角：股價目前${curPrice >= ma5 ? '站上' : '跌破'}5日短均線(${ma5})，${technical.kdSignal}，短期乖離率處於可控區間，關注短線放量攻擊信號。`,
      d60Outlook: `60天季線波段：季線(MA60=${ma60})是重要波段成本線，現階段${technical.aboveMA60 ? '穩居季線之上，波段多方控盤' : '回測季線支撐尋求築底'}，中期趨勢具備延續動能。`,
      d90Outlook: `90天中期趨勢：90天內法人籌碼進出平穩，配合財報季度認列與產業展望，多方防線以季線不破為主要依歸。`,
      d120Outlook: `半年線(MA120=${ma120})防守：半年線為中長線主力防守核心與多空重要基準。目前股價距半年線乖離約${Math.round(((curPrice - ma120) / ma120) * 1000) / 10}%，具備堅實下檔支撐。`,
      d240Outlook: `一年線(MA240=${ma240})長期牛熊界限：年線作為長期多空牛熊分水嶺，目前${technical.aboveMA240 ? '呈現長線多頭架構，長線投資人可採定期定額或波段拉回承接策略' : '處於年線下方震盪洗盤，長線宜靜待扣抵走平向上'}。`
    },
    technicalHighlights: {
      score: techScore,
      title: `技術面整體評定：${technical.maTrend} (${techScore}分)`,
      details: [
        `均線格局：現呈${technical.maTrend}，短均與長均結構清晰。`,
        `指標狀態：${technical.rsiSignal}，${technical.kdSignal}。`,
        `動能觀察：${technical.macdSignal}，成交量能配合適度換手。`
      ]
    },
    sentimentHighlights: {
      score: sentScore,
      title: `新聞情緒整體評定：${sentiment.sentimentLabel} (${sentScore}分)`,
      details: [
        `主流題材：${sentiment.hotTopics.slice(0, 3).join('、')}等話題討論熱烈。`,
        `正向驅動：${sentiment.keyFactorsSummary.positive[0] || '營運展望樂觀'}。`,
        `潛在考量：${sentiment.keyFactorsSummary.negative[0] || '需關注外部總經變數'}。`
      ]
    },
    supportResistance: {
      r2,
      r1,
      currentPrice: curPrice,
      s1,
      s2,
      stopLoss
    },
    strategicAdvice: {
      entryStrategy: combinedScore >= 62 ? '突破頸線追價，或等待拉回量縮至月線附近分批承接。' : '採取區間低接高調節策略，避免在急拉時盲目追高。',
      riskControl: `停損點設定於 ${stopLoss} (約破前低或跌破關鍵均線)，單筆交易風險建議不超過總資金 2%。`,
      targetHorizon: combinedScore >= 65 ? '1至3個月波段操作，觀察季線與半年線支撐力度。' : '短期2至4週靈活操作，達前壓即行停利。'
    },
    executiveReport: `【${stock.name} (${stock.symbol}) 綜合研判摘要】當前股價收於 ${curPrice} ${stock.currency}。技術面方面，呈現${technical.maTrend}，指標顯示${technical.kdSignal}與${technical.rsiSignal}；關鍵均線方面，股價${technical.aboveMA120 ? '強勢守穩半年線(' + ma120 + ')' : '於半年線附近尋求築底'}，一年線(${ma240})為長線牛熊分水嶺。消息面方面，近期財經新聞多空比呈現${sentiment.bullishCount}多 / ${sentiment.bearishCount}空，市場綜合情緒指數為 ${sentScore}分(${sentiment.sentimentLabel})。技術與消息面綜合評分為 ${combinedScore}分，整體評級為「${ratingLabel}」，短中期操作建議以回檔均線不破分批布局為宜，上方第一道壓力關注 ${r1}，強防守位設於 ${s2}。`
  };
}
