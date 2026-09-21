import React, { useState, useRef, useEffect, useMemo } from 'react';
import { KLinePoint } from '../types';

interface CandlestickChartProps {
  points: KLinePoint[];
  colorScheme: 'TW' | 'US';
  activeMAs: {
    ma5: boolean;
    ma20: boolean;
    ma60: boolean;
    ma120: boolean;
    ma240: boolean;
    bollinger: boolean;
  };
  subIndicator: 'RSI' | 'KD' | 'MACD';
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  points,
  colorScheme,
  activeMAs,
  subIndicator,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // ResizeObserver for responsive fluid sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          // Height responds appropriately to screen width
          const h = width < 640 ? 420 : 500;
          setDimensions({ width, height: h });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const count = points.length;
  const isTW = colorScheme === 'TW';
  const upColor = isTW ? '#f43f5e' : '#10b981'; // red in TW, green in US
  const downColor = isTW ? '#10b981' : '#f43f5e'; // green in TW, red in US

  // Chart Layout Calculations
  const padding = { top: 25, right: 65, bottom: 25, left: 15 };
  const width = Math.max(300, dimensions.width);
  const totalHeight = dimensions.height;
  
  // Height partitions: Main (60%), Volume (18%), Sub-indicator (22%)
  const mainHeight = totalHeight * 0.58;
  const volHeight = totalHeight * 0.16;
  const subHeight = totalHeight * 0.20;

  const mainTop = padding.top;
  const volTop = mainTop + mainHeight + 10;
  const subTop = volTop + volHeight + 10;

  const chartWidth = width - padding.left - padding.right;

  // Min and Max for Price
  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    if (points.length === 0) return { minPrice: 0, maxPrice: 100, maxVol: 1000 };
    let minP = Infinity;
    let maxP = -Infinity;
    let maxV = 0;

    for (const p of points) {
      if (p.low < minP) minP = p.low;
      if (p.high > maxP) maxP = p.high;
      if (p.volume > maxV) maxV = p.volume;

      // Include MAs in scale if enabled
      if (activeMAs.ma5 && p.ma5) {
        if (p.ma5 < minP) minP = p.ma5;
        if (p.ma5 > maxP) maxP = p.ma5;
      }
      if (activeMAs.ma20 && p.ma20) {
        if (p.ma20 < minP) minP = p.ma20;
        if (p.ma20 > maxP) maxP = p.ma20;
      }
      if (activeMAs.ma60 && p.ma60) {
        if (p.ma60 < minP) minP = p.ma60;
        if (p.ma60 > maxP) maxP = p.ma60;
      }
      if (activeMAs.ma120 && p.ma120) {
        if (p.ma120 < minP) minP = p.ma120;
        if (p.ma120 > maxP) maxP = p.ma120;
      }
      if (activeMAs.ma240 && p.ma240) {
        if (p.ma240 < minP) minP = p.ma240;
        if (p.ma240 > maxP) maxP = p.ma240;
      }
      if (activeMAs.bollinger && p.bbUpper && p.bbLower) {
        if (p.bbLower < minP) minP = p.bbLower;
        if (p.bbUpper > maxP) maxP = p.bbUpper;
      }
    }

    const priceBuffer = (maxP - minP) * 0.05 || 1;
    return {
      minPrice: Math.max(0, minP - priceBuffer),
      maxPrice: maxP + priceBuffer,
      maxVol: maxV * 1.15 || 1000,
    };
  }, [points, activeMAs]);

  // Coordinate mapper functions
  const getX = (index: number) => {
    if (count <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (count - 1)) * chartWidth;
  };

  const getYPrice = (price: number) => {
    if (maxPrice === minPrice) return mainTop + mainHeight / 2;
    return mainTop + mainHeight - ((price - minPrice) / (maxPrice - minPrice)) * mainHeight;
  };

  const getYVol = (vol: number) => {
    if (maxVol === 0) return volTop + volHeight;
    return volTop + volHeight - (vol / maxVol) * volHeight;
  };

  // Sub-indicator min/max scale
  const subScale = useMemo(() => {
    if (subIndicator === 'RSI') {
      return { min: 0, max: 100, getY: (val: number) => subTop + subHeight - (val / 100) * subHeight };
    }
    if (subIndicator === 'KD') {
      return { min: 0, max: 100, getY: (val: number) => subTop + subHeight - (val / 100) * subHeight };
    }
    // MACD
    let minM = -1;
    let maxM = 1;
    for (const p of points) {
      if (p.dif !== undefined) {
        if (p.dif < minM) minM = p.dif;
        if (p.dif > maxM) maxM = p.dif;
      }
      if (p.dea !== undefined) {
        if (p.dea < minM) minM = p.dea;
        if (p.dea > maxM) maxM = p.dea;
      }
      if (p.macdBar !== undefined) {
        if (p.macdBar < minM) minM = p.macdBar;
        if (p.macdBar > maxM) maxM = p.macdBar;
      }
    }
    const bound = Math.max(Math.abs(minM), Math.abs(maxM)) * 1.2 || 1;
    return {
      min: -bound,
      max: bound,
      getY: (val: number) => subTop + subHeight / 2 - (val / bound) * (subHeight / 2)
    };
  }, [subIndicator, points, subTop, subHeight]);

  // Candle width based on count
  const candleWidth = Math.max(2, Math.min(18, (chartWidth / count) * 0.72));

  // Build SVG Paths for MAs
  const buildLinePath = (getter: (p: KLinePoint) => number | undefined) => {
    let path = '';
    let started = false;
    points.forEach((p, idx) => {
      const val = getter(p);
      if (val !== undefined && val !== null) {
        const x = getX(idx);
        const y = getYPrice(val);
        if (!started) {
          path += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          started = true;
        } else {
          path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }
    });
    return path;
  };

  const pathMA5 = activeMAs.ma5 ? buildLinePath((p) => p.ma5) : '';
  const pathMA20 = activeMAs.ma20 ? buildLinePath((p) => p.ma20) : '';
  const pathMA60 = activeMAs.ma60 ? buildLinePath((p) => p.ma60) : '';
  const pathMA120 = activeMAs.ma120 ? buildLinePath((p) => p.ma120) : '';
  const pathMA240 = activeMAs.ma240 ? buildLinePath((p) => p.ma240) : '';

  // Bollinger Bands
  const { bbUpperPath, bbLowerPath, bbAreaPath } = useMemo(() => {
    if (!activeMAs.bollinger) return { bbUpperPath: '', bbLowerPath: '', bbAreaPath: '' };
    const validPoints = points.map((p, idx) => ({ p, idx })).filter(item => item.p.bbUpper && item.p.bbLower);
    if (validPoints.length === 0) return { bbUpperPath: '', bbLowerPath: '', bbAreaPath: '' };

    let upper = '';
    let lowerRev = '';
    validPoints.forEach(({ p, idx }, i) => {
      const x = getX(idx);
      const yu = getYPrice(p.bbUpper!);
      const yl = getYPrice(p.bbLower!);
      if (i === 0) {
        upper += `M ${x.toFixed(1)} ${yu.toFixed(1)}`;
      } else {
        upper += ` L ${x.toFixed(1)} ${yu.toFixed(1)}`;
      }
      lowerRev = ` L ${x.toFixed(1)} ${yl.toFixed(1)}` + lowerRev;
    });

    const startX = getX(validPoints[0].idx);
    const startYl = getYPrice(validPoints[0].p.bbLower!);
    const area = upper + lowerRev + ` L ${startX.toFixed(1)} ${startYl.toFixed(1)} Z`;

    let lower = '';
    validPoints.forEach(({ p, idx }, i) => {
      const x = getX(idx);
      const yl = getYPrice(p.bbLower!);
      if (i === 0) lower += `M ${x.toFixed(1)} ${yl.toFixed(1)}`;
      else lower += ` L ${x.toFixed(1)} ${yl.toFixed(1)}`;
    });

    return { bbUpperPath: upper, bbLowerPath: lower, bbAreaPath: area };
  }, [points, activeMAs.bollinger, minPrice, maxPrice, chartWidth]);

  // Sub-indicator paths
  const subPaths = useMemo(() => {
    if (subIndicator === 'RSI') {
      let rsiP = '';
      points.forEach((p, idx) => {
        if (p.rsi !== undefined) {
          const x = getX(idx);
          const y = subScale.getY(p.rsi);
          rsiP += rsiP ? ` L ${x.toFixed(1)} ${y.toFixed(1)}` : `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      });
      return { rsiP };
    }
    if (subIndicator === 'KD') {
      let kP = '';
      let dP = '';
      points.forEach((p, idx) => {
        const x = getX(idx);
        if (p.k !== undefined) {
          const yk = subScale.getY(p.k);
          kP += kP ? ` L ${x.toFixed(1)} ${yk.toFixed(1)}` : `M ${x.toFixed(1)} ${yk.toFixed(1)}`;
        }
        if (p.d !== undefined) {
          const yd = subScale.getY(p.d);
          dP += dP ? ` L ${x.toFixed(1)} ${yd.toFixed(1)}` : `M ${x.toFixed(1)} ${yd.toFixed(1)}`;
        }
      });
      return { kP, dP };
    }
    if (subIndicator === 'MACD') {
      let difP = '';
      let deaP = '';
      points.forEach((p, idx) => {
        const x = getX(idx);
        if (p.dif !== undefined) {
          const y = subScale.getY(p.dif);
          difP += difP ? ` L ${x.toFixed(1)} ${y.toFixed(1)}` : `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        if (p.dea !== undefined) {
          const y = subScale.getY(p.dea);
          deaP += deaP ? ` L ${x.toFixed(1)} ${y.toFixed(1)}` : `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      });
      return { difP, deaP };
    }
    return {};
  }, [subIndicator, points, subScale]);

  // Handle Mouse Move for Hover Tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - padding.left;
    if (mouseX < 0 || mouseX > chartWidth) {
      setHoverIndex(null);
      return;
    }
    const idx = Math.round((mouseX / chartWidth) * (count - 1));
    if (idx >= 0 && idx < count) {
      setHoverIndex(idx);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeIndex = hoverIndex !== null ? hoverIndex : count - 1;
  const hoveredPoint = points[activeIndex];

  // Grid price ticks (5 horizontal ticks)
  const priceTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (maxPrice - minPrice) / 4;
    for (let i = 0; i <= 4; i++) {
      ticks.push(minPrice + step * i);
    }
    return ticks;
  }, [minPrice, maxPrice]);

  return (
    <div ref={containerRef} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl select-none">
      {/* Dynamic Hover Metrics Header */}
      {hoveredPoint && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-1 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">{hoveredPoint.date}</span>
            <span className="text-slate-500">開: <strong className="text-slate-200">{hoveredPoint.open}</strong></span>
            <span className="text-slate-500">高: <strong className="text-rose-400">{hoveredPoint.high}</strong></span>
            <span className="text-slate-500">低: <strong className="text-emerald-400">{hoveredPoint.low}</strong></span>
            <span className="text-slate-500">收: <strong className={hoveredPoint.close >= hoveredPoint.open ? upColor : downColor}>{hoveredPoint.close}</strong></span>
            <span className="text-slate-500">量: <strong className="text-slate-300">{(hoveredPoint.volume / 1000).toFixed(0)}張</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
            {activeMAs.ma5 && hoveredPoint.ma5 && (
              <span className="text-amber-400">MA5:{hoveredPoint.ma5}</span>
            )}
            {activeMAs.ma20 && hoveredPoint.ma20 && (
              <span className="text-sky-400">MA20(月):{hoveredPoint.ma20}</span>
            )}
            {activeMAs.ma60 && hoveredPoint.ma60 && (
              <span className="text-purple-400">MA60(季):{hoveredPoint.ma60}</span>
            )}
            {activeMAs.ma120 && hoveredPoint.ma120 && (
              <span className="text-emerald-400">MA120(半年):{hoveredPoint.ma120}</span>
            )}
            {activeMAs.ma240 && hoveredPoint.ma240 && (
              <span className="text-orange-400">MA240(年):{hoveredPoint.ma240}</span>
            )}
          </div>
        </div>
      )}

      {/* SVG Canvas Chart */}
      <div className="relative overflow-hidden cursor-crosshair">
        <svg
          width={width}
          height={totalHeight}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="block"
        >
          <defs>
            <linearGradient id="bbGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Background Grids for Main Price */}
          {priceTicks.map((p, idx) => {
            const y = getYPrice(p);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left + chartWidth + 6}
                  y={y + 3.5}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {p.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Volume baseline */}
          <line
            x1={padding.left}
            y1={volTop}
            x2={padding.left + chartWidth}
            y2={volTop}
            stroke="#334155"
            strokeWidth="0.8"
          />
          <text
            x={padding.left + chartWidth + 6}
            y={volTop + 10}
            fill="#64748b"
            fontSize="9"
            fontFamily="monospace"
          >
            VOL
          </text>

          {/* Sub-indicator baseline */}
          <line
            x1={padding.left}
            y1={subTop}
            x2={padding.left + chartWidth}
            y2={subTop}
            stroke="#334155"
            strokeWidth="0.8"
          />
          <text
            x={padding.left + chartWidth + 6}
            y={subTop + 10}
            fill="#64748b"
            fontSize="9"
            fontFamily="monospace"
          >
            {subIndicator}
          </text>

          {/* Bollinger Band Shading & Lines */}
          {activeMAs.bollinger && bbAreaPath && (
            <>
              <path d={bbAreaPath} fill="url(#bbGradient)" />
              <path d={bbUpperPath} fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 2" />
              <path d={bbLowerPath} fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 2" />
            </>
          )}

          {/* Candlestick Bars */}
          {points.map((p, idx) => {
            const x = getX(idx);
            const isUp = p.close >= p.open;
            const color = isUp ? upColor : downColor;
            
            const yHigh = getYPrice(p.high);
            const yLow = getYPrice(p.low);
            const yOpen = getYPrice(p.open);
            const yClose = getYPrice(p.close);
            
            const topY = Math.min(yOpen, yClose);
            const bottomY = Math.max(yOpen, yClose);
            const candleH = Math.max(1.5, bottomY - topY);

            // Volume bar
            const yVol = getYVol(p.volume);
            const volH = Math.max(1, volTop + volHeight - yVol);

            return (
              <g key={p.date} opacity={hoverIndex !== null && hoverIndex !== idx ? 0.75 : 1}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={topY}
                  width={candleWidth}
                  height={candleH}
                  fill={isTW ? (isUp ? '#f43f5e' : '#10b981') : (isUp ? '#10b981' : '#f43f5e')}
                  rx={0.5}
                />
                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={yVol}
                  width={candleWidth}
                  height={volH}
                  fill={color}
                  opacity="0.65"
                />
              </g>
            );
          })}

          {/* Moving Average Overlay Curves */}
          {activeMAs.ma5 && pathMA5 && (
            <path d={pathMA5} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
          )}
          {activeMAs.ma20 && pathMA20 && (
            <path d={pathMA20} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
          )}
          {activeMAs.ma60 && pathMA60 && (
            <path d={pathMA60} fill="none" stroke="#a855f7" strokeWidth="1.8" />
          )}
          {activeMAs.ma120 && pathMA120 && (
            <path d={pathMA120} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 2" />
          )}
          {activeMAs.ma240 && pathMA240 && (
            <path d={pathMA240} fill="none" stroke="#f97316" strokeWidth="2.2" />
          )}

          {/* Sub-indicator Rendering */}
          {subIndicator === 'RSI' && (
            <>
              {/* Overbought 70 and Oversold 30 lines */}
              <line
                x1={padding.left}
                y1={subScale.getY(70)}
                x2={padding.left + chartWidth}
                y2={subScale.getY(70)}
                stroke="#f43f5e"
                strokeDasharray="2 2"
                strokeWidth="0.8"
              />
              <line
                x1={padding.left}
                y1={subScale.getY(30)}
                x2={padding.left + chartWidth}
                y2={subScale.getY(30)}
                stroke="#10b981"
                strokeDasharray="2 2"
                strokeWidth="0.8"
              />
              {subPaths.rsiP && (
                <path d={subPaths.rsiP} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              )}
            </>
          )}

          {subIndicator === 'KD' && (
            <>
              <line
                x1={padding.left}
                y1={subScale.getY(80)}
                x2={padding.left + chartWidth}
                y2={subScale.getY(80)}
                stroke="#f43f5e"
                strokeDasharray="2 2"
                strokeWidth="0.8"
              />
              <line
                x1={padding.left}
                y1={subScale.getY(20)}
                x2={padding.left + chartWidth}
                y2={subScale.getY(20)}
                stroke="#10b981"
                strokeDasharray="2 2"
                strokeWidth="0.8"
              />
              {subPaths.kP && (
                <path d={subPaths.kP} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              )}
              {subPaths.dP && (
                <path d={subPaths.dP} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              )}
            </>
          )}

          {subIndicator === 'MACD' && (
            <>
              {/* Zero line */}
              <line
                x1={padding.left}
                y1={subScale.getY(0)}
                x2={padding.left + chartWidth}
                y2={subScale.getY(0)}
                stroke="#475569"
                strokeWidth="1"
              />
              {/* Histogram bars */}
              {points.map((p, idx) => {
                if (p.macdBar === undefined) return null;
                const x = getX(idx);
                const yZero = subScale.getY(0);
                const yBar = subScale.getY(p.macdBar);
                const barTop = Math.min(yZero, yBar);
                const barH = Math.max(1, Math.abs(yZero - yBar));
                const barColor = p.macdBar >= 0 ? upColor : downColor;
                return (
                  <rect
                    key={`macd-${p.date}`}
                    x={x - candleWidth / 2}
                    y={barTop}
                    width={candleWidth}
                    height={barH}
                    fill={barColor}
                    opacity="0.8"
                  />
                );
              })}
              {subPaths.difP && (
                <path d={subPaths.difP} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              )}
              {subPaths.deaP && (
                <path d={subPaths.deaP} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              )}
            </>
          )}

          {/* Crosshair Line & Target Tooltip */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical crosshair line */}
              <line
                x1={getX(hoverIndex)}
                y1={mainTop}
                x2={getX(hoverIndex)}
                y2={subTop + subHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Date tag below */}
              <rect
                x={getX(hoverIndex) - 35}
                y={subTop + subHeight + 3}
                width="70"
                height="16"
                fill="#0f172a"
                stroke="#475569"
                rx="3"
              />
              <text
                x={getX(hoverIndex)}
                y={subTop + subHeight + 14}
                fill="#cbd5e1"
                fontSize="9"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                {points[hoverIndex].date.slice(5)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Footer Legend & Indicator Notes */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300">均線圖例:</span>
          {activeMAs.ma5 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-amber-400 rounded-full" /> MA5 週線
            </span>
          )}
          {activeMAs.ma20 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-sky-400 rounded-full" /> MA20 月線
            </span>
          )}
          {activeMAs.ma60 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-purple-400 rounded-full" /> MA60 季線
            </span>
          )}
          {activeMAs.ma120 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-emerald-400 rounded-full" /> MA120 半年線 (主力生命線)
            </span>
          )}
          {activeMAs.ma240 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-orange-400 rounded-full" /> MA240 一年線 (牛熊分水嶺)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {subIndicator === 'RSI' && (
            <span className="text-slate-400">
              RSI(14): <strong className="text-sky-300">{hoveredPoint?.rsi || '--'}</strong> (70超買 / 30超賣)
            </span>
          )}
          {subIndicator === 'KD' && (
            <span className="text-slate-400">
              K: <strong className="text-amber-400">{hoveredPoint?.k || '--'}</strong>, D: <strong className="text-sky-400">{hoveredPoint?.d || '--'}</strong>
            </span>
          )}
          {subIndicator === 'MACD' && (
            <span className="text-slate-400">
              DIF: <strong className="text-sky-400">{hoveredPoint?.dif || '--'}</strong>, DEA: <strong className="text-amber-400">{hoveredPoint?.dea || '--'}</strong>, 柱: <strong className="text-rose-400">{hoveredPoint?.macdBar || '--'}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
