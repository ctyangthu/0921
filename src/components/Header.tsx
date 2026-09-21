import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, RefreshCw, BarChart2, Sparkles, Check, ChevronDown } from 'lucide-react';
import { StockItem } from '../types';

interface HeaderProps {
  currentStock: StockItem;
  onSelectStock: (stock: StockItem) => void;
  onTriggerAnalysis: () => void;
  isAnalyzing: boolean;
  colorScheme: 'TW' | 'US';
  onToggleColorScheme: () => void;
}

const POPULAR_CHIPS = [
  { symbol: '2330', name: '台積電', tag: '權值王' },
  { symbol: '2454', name: '聯發科', tag: 'IC設計' },
  { symbol: '2317', name: '鴻海', tag: 'AI代工' },
  { symbol: '2382', name: '廣達', tag: '伺服器' },
  { symbol: '0050', name: '元大台灣50', tag: '市值ETF' },
  { symbol: 'NVDA', name: '輝達', tag: 'AI龍頭' },
  { symbol: 'AAPL', name: '蘋果', tag: '科技巨頭' },
  { symbol: 'TSLA', name: '特斯拉', tag: '電動車' },
];

export const Header: React.FC<HeaderProps> = ({
  currentStock,
  onSelectStock,
  onTriggerAnalysis,
  isAnalyzing,
  colorScheme,
  onToggleColorScheme,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const res = await fetch(`/api/stock/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error('Stock search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (stock: StockItem) => {
    onSelectStock(stock);
    setQuery('');
    setShowDropdown(false);
  };

  const isUp = currentStock.change >= 0;
  const isTW = colorScheme === 'TW';
  const upColor = isTW ? 'text-rose-400' : 'text-emerald-400';
  const downColor = isTW ? 'text-emerald-400' : 'text-rose-400';
  const priceColor = isUp ? upColor : downColor;
  const bgBadgeColor = isUp 
    ? (isTW ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')
    : (isTW ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20');

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    股票技術與消息面綜合研判儀
                  </h1>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Pro v2.5
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  即時技術指標 · 均線全週期(30/60/90D/半年線/一年線) · 財經新聞情緒深度解構
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                id="btn-mobile-color-scheme"
                onClick={onToggleColorScheme}
                title="切換漲跌色彩 (紅漲綠跌 / 綠漲紅跌)"
                className="px-2 py-1 text-xs rounded border border-slate-700 bg-slate-800 text-slate-300"
              >
                {isTW ? '台/亞標準 (紅漲)' : '美股標準 (綠漲)'}
              </button>
            </div>
          </div>

          {/* Search bar & Controls */}
          <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
            <div className="relative flex-1" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="stock-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => query.trim() && setShowDropdown(true)}
                  placeholder="輸入股票代號或公司名稱 (例: 2330、台積電、NVDA、輝達、聯發科)"
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                />
                {isSearching && (
                  <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 border-b border-slate-800 bg-slate-900/50 flex justify-between">
                    <span>搜尋結果 ({searchResults.length})</span>
                    <span>支援台股與美股代號/名稱</span>
                  </div>
                  {searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSelect(stock)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 flex items-center justify-between border-b border-slate-800/40 last:border-0 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-semibold text-rose-400 group-hover:text-rose-300">
                          {stock.symbol}
                        </span>
                        <span className="text-sm text-slate-200">{stock.name}</span>
                        {stock.industry && (
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                            {stock.industry}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-medium text-slate-200">
                          {stock.currentPrice} {stock.currency}
                        </div>
                        <div className={`text-[11px] font-mono ${stock.change >= 0 ? (isTW ? 'text-rose-400' : 'text-emerald-400') : (isTW ? 'text-emerald-400' : 'text-rose-400')}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Re-analyze Button */}
            <button
              id="btn-trigger-ai-analysis"
              onClick={onTriggerAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-500/20 transition-all shrink-0 cursor-pointer"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>{isAnalyzing ? '分析中...' : 'AI 綜合研判'}</span>
            </button>

            {/* Desktop Color Scheme Toggle */}
            <button
              id="btn-color-scheme-toggle"
              onClick={onToggleColorScheme}
              title="切換色彩慣例 (亞洲標準 紅漲綠跌 / 歐美標準 綠漲紅跌)"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs transition-colors shrink-0"
            >
              <div className={`w-2 h-2 rounded-full ${isTW ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span>{isTW ? '紅漲綠跌' : '綠漲紅跌'}</span>
            </button>
          </div>
        </div>

        {/* Popular chips row */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] text-slate-400 shrink-0 font-medium mr-1 flex items-center gap-1">
            <BarChart2 className="w-3 h-3 text-slate-400" /> 熱門選股：
          </span>
          {POPULAR_CHIPS.map((chip) => {
            const isSelected = currentStock.symbol === chip.symbol;
            return (
              <button
                key={chip.symbol}
                onClick={() => handleSelect({
                  symbol: chip.symbol,
                  name: chip.name,
                  market: chip.symbol.match(/^\d+$/) ? 'TW' : 'US',
                  currency: chip.symbol.match(/^\d+$/) ? 'TWD' : 'USD',
                  currentPrice: 100,
                  change: 1,
                  changePercent: 1.0,
                  volume: 10000000
                })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                <span className="font-semibold">{chip.name}</span>
                <span className="text-[10px] text-slate-400">({chip.symbol})</span>
                {chip.tag && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-700 text-slate-300">
                    {chip.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
