import React from 'react';
import { TechnicalSummary, KLinePoint } from '../types';
import { Activity, TrendingUp, TrendingDown, Gauge, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface TechnicalSignalsCardProps {
  summary: TechnicalSummary | null;
  latestPoint?: KLinePoint;
}

export const TechnicalSignalsCard: React.FC<TechnicalSignalsCardProps> = ({
  summary,
  latestPoint,
}) => {
  if (!summary) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-slate-500">
        正在載入技術指標數據...
      </div>
    );
  }

  const score = summary.technicalScore;
  const scoreColor = score >= 75 ? 'text-rose-400' : (score >= 55 ? 'text-amber-400' : 'text-emerald-400');
  const scoreBg = score >= 75 ? 'bg-rose-500/10 border-rose-500/20' : (score >= 55 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">技術面信號與均線多空分析</h3>
            <p className="text-xs text-slate-400">結合短中長各天期均線 (MA5~MA240) 及動能指標</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${scoreBg}`}>
          <Gauge className={`w-4 h-4 ${scoreColor}`} />
          <span className="text-xs text-slate-400">技術評分:</span>
          <span className={`text-base font-mono font-bold ${scoreColor}`}>{score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>

      {/* Grid of Key Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
        {/* MA Alignment & Trend */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">均線架構排列</span>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
              summary.maTrend === '多頭排列'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : (summary.maTrend === '空頭排列' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30')
            }`}>
              {summary.maTrend}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {summary.maTrend === '多頭排列' 
              ? '短天期均線依序大於長天期均線，均線發散向上，多方掌控盤勢節奏。'
              : (summary.maTrend === '空頭排列' ? '均線呈空方壓制格局，反彈逢均線反壓易受阻。' : '均線緊密交纏糾結，預示即將迎來重大方向性突破。')}
          </p>
        </div>

        {/* Key Moving Average Hurdles */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium block mb-2">關鍵均線位階對照</span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className={`p-1.5 rounded flex items-center justify-between ${summary.aboveMA20 ? 'bg-slate-800/80 text-sky-300' : 'bg-slate-900 text-slate-500'}`}>
              <span>月線 (MA20):</span>
              <strong>{summary.aboveMA20 ? '站上 ✓' : '跌破 ✗'}</strong>
            </div>
            <div className={`p-1.5 rounded flex items-center justify-between ${summary.aboveMA60 ? 'bg-slate-800/80 text-purple-300' : 'bg-slate-900 text-slate-500'}`}>
              <span>季線 (MA60):</span>
              <strong>{summary.aboveMA60 ? '站上 ✓' : '跌破 ✗'}</strong>
            </div>
            <div className={`p-1.5 rounded flex items-center justify-between ${summary.aboveMA120 ? 'bg-slate-800/80 text-emerald-300' : 'bg-slate-900 text-slate-500'}`}>
              <span>半年線 (120D):</span>
              <strong>{summary.aboveMA120 ? '站穩 ✓' : '失守 ✗'}</strong>
            </div>
            <div className={`p-1.5 rounded flex items-center justify-between ${summary.aboveMA240 ? 'bg-slate-800/80 text-amber-300' : 'bg-slate-900 text-slate-500'}`}>
              <span>一年線 (240D):</span>
              <strong>{summary.aboveMA240 ? '牛市 ✓' : '熊市 ✗'}</strong>
            </div>
          </div>
        </div>

        {/* RSI & KD Oscillators */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">動能擺盪指標 (RSI / KD)</span>
            <span className="text-xs font-mono text-slate-300">
              RSI: {latestPoint?.rsi || '--'}
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">RSI(14)狀態:</span>
              <span className="text-slate-200 font-semibold">{summary.rsiSignal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">KD(9,3,3)信號:</span>
              <span className="text-amber-400 font-semibold">{summary.kdSignal}</span>
            </div>
          </div>
        </div>

        {/* MACD Trend */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">趨勢動能 (MACD)</span>
            <span className="text-xs font-mono text-slate-300">
              柱狀: {latestPoint?.macdBar !== undefined ? (latestPoint.macdBar > 0 ? `+${latestPoint.macdBar}` : latestPoint.macdBar) : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">柱狀體變化:</span>
            <span className={`font-semibold ${summary.macdSignal.includes('紅') ? 'text-rose-400' : (summary.macdSignal.includes('綠') ? 'text-emerald-400' : 'text-slate-300')}`}>
              {summary.macdSignal}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {summary.macdSignal.includes('紅') ? '快線在慢線上方發散，多方攻擊動能充沛。' : '柱狀收縮或處於負值，短線進入震盪消化期。'}
          </p>
        </div>
      </div>

      {/* Progress Bar of Technical Momentum */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex justify-between text-xs mb-1.5 text-slate-400 font-mono">
          <span>空方防守 (0)</span>
          <span className="text-slate-300 font-semibold">技術力道：{score}分</span>
          <span>多方進攻 (100)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              score >= 70 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : (score >= 45 ? 'bg-amber-500' : 'bg-emerald-500')
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};
