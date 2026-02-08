'use client';

import { WatchlistItem } from '@/types/watchlist';
import { X, RefreshCw, AlertTriangle, Shield, Search } from 'lucide-react';

interface WatchlistCardProps {
  item: WatchlistItem;
  onRemove: (ticker: string) => void;
  onReanalyze: (ticker: string) => void;
  reanalyzing?: boolean;
}

export function WatchlistCard({ item, onRemove, onReanalyze, reanalyzing }: WatchlistCardProps) {
  const fmtCurrency = (val: number | null) => {
    if (!val) return '-';
    if (Math.abs(val) >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
    return `$${val.toLocaleString()}`;
  };

  const fmtRatio = (val: number | null) => {
    if (!val) return '-';
    return val.toFixed(1);
  };

  const fmtPct = (val: number | null) => {
    if (val === null || val === undefined) return '-';
    const prefix = val >= 0 ? '+' : '';
    return `${prefix}${val.toFixed(1)}%`;
  };

  const pctColor = (val: number | null) => {
    if (val === null || val === undefined) return 'text-gray-400';
    return val >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header: Ticker, Name, Sector, Price */}
      <div className="px-6 py-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-900">{item.ticker}</span>
              {item.sector && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-medium">
                  {item.sector}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{item.company_name}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-bold font-mono text-gray-900">
            ${item.price?.toFixed(2) || '-'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Mkt Cap: {fmtCurrency(item.market_cap)}
          </div>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="px-6 py-3 bg-gray-50 border-y border-gray-100 flex flex-wrap gap-x-8 gap-y-2">
        <Metric label="Revenue" value={fmtCurrency(item.revenue)} />
        <Metric label="Net Income" value={fmtCurrency(item.net_income)} />
        <Metric label="EPS" value={item.eps ? `$${item.eps.toFixed(2)}` : '-'} />
        <Metric label="P/E" value={fmtRatio(item.pe_ratio)} />
        <Metric label="P/B" value={fmtRatio(item.pb_ratio)} />
        <Metric label="EV/EBITDA" value={fmtRatio(item.ev_ebitda)} />
        <Metric label="YTD" value={fmtPct(item.ytd_change)} className={pctColor(item.ytd_change)} />
        <Metric label="1Y" value={fmtPct(item.one_year_change)} className={pctColor(item.one_year_change)} />
      </div>

      {/* Description */}
      {item.description && (
        <div className="px-6 pt-4 pb-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            {item.description.length > 400
              ? item.description.slice(0, 400) + '...'
              : item.description}
          </p>
        </div>
      )}

      {/* Risks & Strengths side by side */}
      <div className="px-6 py-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Risks
          </h4>
          <ul className="space-y-1.5">
            {item.risks.map((risk, i) => (
              <li key={i} className="text-sm text-gray-600 leading-relaxed flex gap-2">
                <span className="text-red-300 shrink-0">-</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Strengths
          </h4>
          <ul className="space-y-1.5">
            {item.strengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 leading-relaxed flex gap-2">
                <span className="text-green-400 shrink-0">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Evaluation */}
      {item.evaluation && (
        <div className="px-6 py-3">
          <h4 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Verdict
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">{item.evaluation}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Analyzed {new Date(item.analyzed_at).toLocaleDateString()}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onReanalyze(item.ticker)}
            disabled={reanalyzing}
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${reanalyzing ? 'animate-spin' : ''}`} />
            Re-analyze
          </button>
          <button
            onClick={() => onRemove(item.ticker)}
            className="inline-flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-mono font-medium ${className || 'text-gray-900'}`}>{value}</div>
    </div>
  );
}
