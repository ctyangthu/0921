import React from 'react';
import { PeriodType } from '../types';
import { Calendar, Eye, Activity, Layers } from 'lucide-react';

interface PeriodSelectorProps {
  currentPeriod: PeriodType;
  onSelectPeriod: (period: PeriodType) => void;
  activeMAs: {
    ma5: boolean;
    ma20: boolean;
    ma60: boolean;
    ma120: boolean;
    ma240: boolean;
    bollinger: boolean;
  };
  onToggleMA: (key: keyof PeriodSelectorProps['activeMAs']) => void;
  subIndicator: 'RSI' | 'KD' | 'MACD';
  onSelectSubIndicator: (ind: 'RSI' | 'KD' | 'MACD') => void;
}

const PERIOD_OPTIONS: { id: PeriodType; label: string; desc: string }[] = [
  { id: '30D', label: '30天', desc: '短期衝刺' },
  { id: '60D', label: '60天 (季線)', desc: '季度波段' },
  { id: '90D', label: '90天', desc: '中期趨勢' },
  { id: '120D', label: '半年線', desc: '主力生命線' },
  { id: '240D', label: '一年線', desc: '牛熊分水嶺' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  currentPeriod,
  onSelectPeriod,
  activeMAs,
  onToggleMA,
  subIndicator,
  onSelectSubIndicator,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-4 shadow-sm">
      {/* Period Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-rose-400" />
          分析週期：
        </span>
        {PERIOD_OPTIONS.map((opt) => {
          const isActive = currentPeriod === opt.id;
          return (
            <button
              key={opt.id}
              id={`period-btn-${opt.id}`}
              onClick={() => onSelectPeriod(opt.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-rose-500 text-white font-semibold shadow-md shadow-rose-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{opt.label}</span>
              {isActive && (
                <span className="text-[9px] opacity-80 ml-0.5 hidden sm:inline">
                  · {opt.desc}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MA Toggles & Sub-indicator selection */}
      <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
        {/* MA Toggles */}
        <div className="flex items-center gap-1 text-[11px] bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 px-1 font-mono flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" /> 均線:
          </span>
          <button
            onClick={() => onToggleMA('ma5')}
            className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
              activeMAs.ma5
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            MA5
          </button>
          <button
            onClick={() => onToggleMA('ma20')}
            className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
              activeMAs.ma20
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            MA20(月)
          </button>
          <button
            onClick={() => onToggleMA('ma60')}
            className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
              activeMAs.ma60
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            MA60(季)
          </button>
          <button
            onClick={() => onToggleMA('ma120')}
            className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
              activeMAs.ma120
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            半年線
          </button>
          <button
            onClick={() => onToggleMA('ma240')}
            className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
              activeMAs.ma240
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            一年線
          </button>
          <button
            onClick={() => onToggleMA('bollinger')}
            className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
              activeMAs.bollinger
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            布林帶
          </button>
        </div>

        {/* Sub Indicator Switcher */}
        <div className="flex items-center gap-1 text-[11px] bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 px-1 font-mono flex items-center gap-1">
            <Activity className="w-3 h-3 text-slate-400" /> 副圖:
          </span>
          {(['RSI', 'KD', 'MACD'] as const).map((ind) => (
            <button
              key={ind}
              onClick={() => onSelectSubIndicator(ind)}
              className={`px-2 py-0.5 rounded font-mono transition-colors ${
                subIndicator === ind
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
