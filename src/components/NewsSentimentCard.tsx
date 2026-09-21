import React, { useState } from 'react';
import { SentimentAnalysisResult, NewsItem } from '../types';
import { Newspaper, MessageSquareText, TrendingUp, AlertTriangle, CheckCircle, ExternalLink, Filter } from 'lucide-react';

interface NewsSentimentCardProps {
  sentiment: SentimentAnalysisResult | null;
  isLoading: boolean;
  onRefreshNews: () => void;
}

export const NewsSentimentCard: React.FC<NewsSentimentCardProps> = ({
  sentiment,
  isLoading,
  onRefreshNews,
}) => {
  const [filter, setFilter] = useState<'all' | 'bullish' | 'neutral' | 'bearish'>('all');

  if (isLoading || !sentiment) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="w-8 h-8 mx-auto mb-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">正在聯網爬取最新財經新聞並執行情緒分析...</p>
      </div>
    );
  }

  const filteredNews = sentiment.newsList.filter(item => {
    if (filter === 'all') return true;
    return item.sentiment === filter;
  });

  const sentScore = sentiment.overallScore;
  const sentColor = sentScore >= 60 ? 'text-rose-400' : (sentScore >= 40 ? 'text-amber-400' : 'text-emerald-400');
  const sentBadgeBg = sentScore >= 60 ? 'bg-rose-500/10 border-rose-500/20' : (sentScore >= 40 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              即時財經新聞爬蟲與輿情情緒分析
            </h3>
            <p className="text-xs text-slate-400">
              即時追蹤法說會、營收公告、外資報告與產業鏈重大資訊
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${sentBadgeBg}`}>
            <MessageSquareText className={`w-4 h-4 ${sentColor}`} />
            <span className="text-xs text-slate-400">新聞情緒:</span>
            <span className={`text-base font-mono font-bold ${sentColor}`}>
              {sentScore}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({sentiment.sentimentLabel})
            </span>
          </div>

          <button
            onClick={onRefreshNews}
            title="重新爬取最新新聞"
            className="p-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            重新爬取
          </button>
        </div>
      </div>

      {/* Sentiment Gauge & Ratio Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
        {/* Ratio Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium block mb-2">多空消息佔比</span>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> 正向利多:
              </span>
              <strong className="text-slate-200">{sentiment.bullishCount} 則 ({Math.round(sentiment.bullishCount / sentiment.newsList.length * 100)}%)</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 中立客觀:
              </span>
              <strong className="text-slate-200">{sentiment.neutralCount} 則 ({Math.round(sentiment.neutralCount / sentiment.newsList.length * 100)}%)</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> 謹慎負向:
              </span>
              <strong className="text-slate-200">{sentiment.bearishCount} 則 ({Math.round(sentiment.bearishCount / sentiment.newsList.length * 100)}%)</strong>
            </div>
          </div>
          {/* Segmented bar */}
          <div className="w-full h-2 rounded-full overflow-hidden flex mt-2.5 bg-slate-800">
            <div
              style={{ width: `${(sentiment.bullishCount / sentiment.newsList.length) * 100}%` }}
              className="bg-rose-500 h-full"
            />
            <div
              style={{ width: `${(sentiment.neutralCount / sentiment.newsList.length) * 100}%` }}
              className="bg-amber-500 h-full"
            />
            <div
              style={{ width: `${(sentiment.bearishCount / sentiment.newsList.length) * 100}%` }}
              className="bg-emerald-500 h-full"
            />
          </div>
        </div>

        {/* Hot Topics */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium block mb-2">焦點熱搜關鍵詞</span>
          <div className="flex flex-wrap gap-1.5">
            {sentiment.hotTopics.map((topic, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/90 text-rose-300 border border-slate-700/80 font-medium"
              >
                #{topic}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            AI 即時聚合各大財經媒體關鍵字頻率與情緒權重。
          </p>
        </div>

        {/* Catalysts & Risks Digest */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium block mb-1.5">利多與風險精華</span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-1.5 text-rose-300">
              <CheckCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{sentiment.keyFactorsSummary.positive[0] || '營運結構穩健'}</span>
            </div>
            <div className="flex items-start gap-1.5 text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{sentiment.keyFactorsSummary.negative[0] || '需留意外部環境波動'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          最新爬取新聞列表 ({filteredNews.length})
        </span>
        <div className="flex items-center gap-1 text-xs bg-slate-800/60 p-0.5 rounded-lg border border-slate-700">
          {(['all', 'bullish', 'neutral', 'bearish'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                filter === mode
                  ? 'bg-slate-700 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'all' ? '全部' : (mode === 'bullish' ? '利多' : (mode === 'neutral' ? '中立' : '保守'))}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {filteredNews.map((item) => {
          const isBull = item.sentiment === 'bullish';
          const isNeut = item.sentiment === 'neutral';
          const badgeClass = isBull 
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
            : (isNeut ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20');
          const badgeText = isBull ? '偏多利好' : (isNeut ? '中性資訊' : '利空警示');

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800/80 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-rose-300 transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {badgeText} ({item.score > 0 ? `+${item.score}` : item.score})
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                {item.snippet}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {item.source}
                  </span>
                  <span>{item.time}</span>
                </div>

                {item.catalysts && item.catalysts.length > 0 && (
                  <div className="flex items-center gap-1 text-slate-400 hidden sm:flex">
                    <span className="text-slate-500">焦點:</span>
                    <span className="text-slate-300">{item.catalysts.join('、')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
