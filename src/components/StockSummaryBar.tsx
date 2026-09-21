import React from 'react';
import { StockItem, TechnicalSummary } from '../types';
import { ShieldCheck, ArrowUpRight, ArrowDownRight, Activity, Clock } from 'lucide-react';

interface StockSummaryBarProps {
  stock: StockItem;
  technical: TechnicalSummary | null;
  colorScheme: 'TW' | 'US';
  updatedTime?: string;
}

export const StockSummaryBar: React.FC<StockSummaryBarProps> = ({
  stock,
  technical,
  colorScheme,
  updatedTime
}) => {
  const isTW = colorScheme === 'TW';
  const isUp = stock.change >= 0;
  const priceColor = isUp 
    ? (isTW ? 'text-rose-400' : 'text-emerald-400')
    : (isTW ? 'text-emerald-400' : 'text-rose-400');
  const bgTrend = isUp 
    ? (isTW ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300')
    : (isTW ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300');

  const formatVolume = (vol: number) => {
    if (vol >= 100000000) return `${(vol / 100000000).toFixed(2)} 億股`;
    if (vol >= 10000) return `${(vol / 10000).toFixed(1)} 萬股`;
    return `${vol.toLocaleString()} 股`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Stock Identity & Price */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {stock.name}
              </h2>
              <span className="font-mono text-base sm:text-lg font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 border border-slate-700">
                {stock.symbol}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
                {stock.market === 'TW' ? '台股上市' : (stock.market === 'ETF' ? '指數ETF' : '美股NASDAQ/NYSE')}
              </span>
            </div>
            {stock.industry && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                產業板塊：{stock.industry}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0">
            <div className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${priceColor}`}>
              {stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-400 ml-1.5">{stock.currency}</span>
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-semibold border ${bgTrend}`}>
              {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{isUp ? '+' : ''}{stock.change}</span>
              <span>({isUp ? '+' : ''}{stock.changePercent}%)</span>
            </div>
          </div>
        </div>

        {/* Right: Technical MA Status Badges */}
        {technical && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">均線架構：</span>
              <span className={`font-semibold ${technical.maTrend === '多頭排列' ? 'text-rose-400' : (technical.maTrend === '空頭排列' ? 'text-emerald-400' : 'text-amber-400')}`}>
                {technical.maTrend}
              </span>
            </div>

            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border ${technical.aboveMA20 ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              <span>月線(20D): {technical.aboveMA20 ? '● 站上' : '○ 跌破'}</span>
            </div>

            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border ${technical.aboveMA60 ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              <span>季線(60D): {technical.aboveMA60 ? '● 站上' : '○ 跌破'}</span>
            </div>

            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border ${technical.aboveMA120 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              <span>半年線(120D): {technical.aboveMA120 ? '● 守穩' : '○ 跌破'}</span>
            </div>

            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border ${technical.aboveMA240 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              <span>一年線(240D): {technical.aboveMA240 ? '● 多頭牛市' : '○ 熊市壓力'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-500 block">成交量 (Volume)</span>
          <span className="font-mono text-slate-200 font-semibold text-sm">
            {formatVolume(stock.volume)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">支撐關鍵位 (S1)</span>
          <span className="font-mono text-emerald-400 font-semibold text-sm">
            {technical ? `${technical.supportLevel} ${stock.currency}` : '--'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">壓力關鍵位 (R1)</span>
          <span className="font-mono text-rose-400 font-semibold text-sm">
            {technical ? `${technical.resistanceLevel} ${stock.currency}` : '--'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" /> 資料更新時間
          </span>
          <span className="font-mono text-slate-400 text-sm">
            {updatedTime || '即時連線更新中'}
          </span>
        </div>
      </div>
    </div>
  );
};
