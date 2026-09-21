import React from 'react';
import { ComprehensiveAnalysisResult } from '../types';
import { Sparkles, Shield, Target, Compass, AlertCircle, ArrowUpRight, CheckCircle2, Award } from 'lucide-react';

interface ComprehensiveJudgmentCardProps {
  analysis: ComprehensiveAnalysisResult | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ComprehensiveJudgmentCard: React.FC<ComprehensiveJudgmentCardProps> = ({
  analysis,
  isLoading,
  onRefresh,
}) => {
  if (isLoading || !analysis) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="w-9 h-9 mx-auto mb-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-300 font-semibold">
          AI 正在交叉運算技術指標全週期與即時新聞情緒...
        </p>
        <p className="text-xs text-slate-500 mt-1">
          深入整合 30D/60D/90D/半年線/一年線 與輿情多空向量
        </p>
      </div>
    );
  }

  const { overallRating, overallScore, ratingLabel, actionRecommendation, timeframePerspective, supportResistance, strategicAdvice, executiveReport } = analysis;

  const ratingColors = {
    STRONG_BUY: { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', badge: 'bg-rose-500 text-white' },
    BUY: { text: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/20', badge: 'bg-rose-600 text-white' },
    NEUTRAL: { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', badge: 'bg-amber-500 text-slate-950' },
    SELL: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', badge: 'bg-emerald-600 text-white' },
    STRONG_SELL: { text: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/30', badge: 'bg-emerald-500 text-white' },
  }[overallRating] || { text: 'text-slate-300', bg: 'bg-slate-800 border-slate-700', badge: 'bg-slate-700 text-white' };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Main Title & Rating Pill */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-5 mb-5 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
              AI Multi-Factor Synthesis Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            技術面與消息面綜合研判報告
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            標的: {analysis.name} ({analysis.symbol}) · 研判時間: {analysis.updatedAt}
          </p>
        </div>

        {/* Rating and Score block */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-3 px-4 rounded-2xl">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">綜合多空評分</span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-3xl font-extrabold font-mono text-amber-400">
                {overallScore}
              </span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-left">
            <span className="text-[11px] text-slate-500 block">最終決策評級</span>
            <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold tracking-wide ${ratingColors.badge}`}>
              {ratingLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Action Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6 flex items-start gap-3">
        <Compass className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            核心操作建議與建倉方針
          </h4>
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            {actionRecommendation}
          </p>
        </div>
      </div>

      {/* Timeframe Horizons Breakdown: 30D, 60D, 90D, 半年線, 一年線 */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          多週期時間架構全景研判 (30天 / 60天 / 90天 / 半年線 / 一年線)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 30天 */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 font-mono">30天 短期衝刺</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">短波段</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {timeframePerspective.d30Outlook}
            </p>
          </div>

          {/* 60天 (季線) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-300 font-mono">60天 季線波段</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">季成本線</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {timeframePerspective.d60Outlook}
            </p>
          </div>

          {/* 90天 */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-300 font-mono">90天 中期趨勢</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">營運延續</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {timeframePerspective.d90Outlook}
            </p>
          </div>

          {/* 半年線 (120D) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-300 font-mono">半年線 (120D)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold">主力生命線</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {timeframePerspective.d120Outlook}
            </p>
          </div>

          {/* 一年線 (240D) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-orange-300 font-mono">一年線 (240D)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-orange-400 font-semibold">牛熊分水嶺</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {timeframePerspective.d240Outlook}
            </p>
          </div>
        </div>
      </div>

      {/* Support & Resistance Price Ladder */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-rose-400" />
          關鍵價位攻防階梯 (支撐位 / 壓力位 / 停損參考)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center font-mono">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[11px] text-rose-300 block mb-0.5">強壓力位 (R2)</span>
            <span className="text-base font-bold text-rose-400">{supportResistance.r2}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10">
            <span className="text-[11px] text-rose-300 block mb-0.5">頸線近壓 (R1)</span>
            <span className="text-base font-bold text-rose-300">{supportResistance.r1}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
            <span className="text-[11px] text-slate-400 block mb-0.5">現行股價</span>
            <span className="text-base font-bold text-white">{supportResistance.currentPrice}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <span className="text-[11px] text-emerald-300 block mb-0.5">月/季近支撐 (S1)</span>
            <span className="text-base font-bold text-emerald-300">{supportResistance.s1}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-300 block mb-0.5">半年線強防守 (S2)</span>
            <span className="text-base font-bold text-emerald-400">{supportResistance.s2}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-red-500/30">
            <span className="text-[11px] text-red-400 block mb-0.5">防守停損點</span>
            <span className="text-base font-bold text-red-400">{supportResistance.stopLoss}</span>
          </div>
        </div>
      </div>

      {/* Strategic Advice (Entry, Risk, Horizon) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-amber-400 font-semibold block mb-1">建倉與加碼策略</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {strategicAdvice.entryStrategy}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-rose-400 font-semibold block mb-1">風險控管與停損</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {strategicAdvice.riskControl}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-sky-400 font-semibold block mb-1">建議投資持有週期</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {strategicAdvice.targetHorizon}
          </p>
        </div>
      </div>

      {/* Executive Report text */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          機構級綜合研判總結報告 (Executive Summary)
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
          {executiveReport}
        </p>
      </div>
    </div>
  );
};
