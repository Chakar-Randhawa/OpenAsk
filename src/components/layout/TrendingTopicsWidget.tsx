import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  RefreshCw,
  Compass,
  ArrowRight,
  Flame,
  Zap,
  Lightbulb,
  MessageCircle,
  Hash
} from 'lucide-react';
import { trendingService, TrendingTopic, TrendingResponse } from '../../core/services/trendingService';

interface TrendingTopicsWidgetProps {
  className?: string;
  maxItems?: number;
}

export const TrendingTopicsWidget: React.FC<TrendingTopicsWidgetProps> = ({
  className = '',
  maxItems = 4
}) => {
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrending = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await trendingService.getTrendingTopics(force);
      setData(res);
    } catch (err) {
      console.warn('Error in TrendingTopicsWidget:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'hot':
        return <Flame className="w-3 h-3 text-red-500" />;
      case 'surging':
        return <Zap className="w-3 h-3 text-amber-500" />;
      case 'emerging':
        return <Lightbulb className="w-3 h-3 text-emerald-500" />;
      default:
        return <TrendingUp className="w-3 h-3 text-blue-500" />;
    }
  };

  const topics = data?.topics?.slice(0, maxItems) || [];

  return (
    <div
      className={`p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3.5 ${className}`}
      data-testid="trending-topics-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider">
              Trending Topics
            </h3>
            <p className="text-[10px] text-neutral-400 font-medium">
              AI-analyzed discussion themes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchTrending(true)}
          disabled={loading || refreshing}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
          title="Refresh AI trending analysis"
          aria-label="Refresh trending topics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3 animate-pulse pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-20 h-3 bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="w-12 h-3 bg-neutral-200 dark:bg-neutral-700 rounded" />
              </div>
              <div className="w-full h-3.5 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="w-3/4 h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="p-4 text-center text-xs text-neutral-400">
          No trending discussions detected yet.
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors group"
            >
              {/* Top metadata: Momentum & Category */}
              <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-200">
                  {getMomentumIcon(t.momentum)}
                  <span>{t.momentumLabel}</span>
                </span>

                <Link
                  to={`/category/${t.categorySlug}`}
                  className="px-2 py-0.5 rounded-full font-medium text-[10px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white truncate max-w-[120px]"
                  title={`View ${t.categoryName} category`}
                >
                  {t.categoryName}
                </Link>
              </div>

              {/* Title */}
              <Link
                to={`/search?q=${encodeURIComponent(t.title)}`}
                className="font-bold text-xs text-neutral-900 dark:text-white group-hover:underline line-clamp-2 block leading-snug"
              >
                {t.title}
              </Link>

              {/* AI Executive Summary */}
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {t.summary}
              </p>

              {/* Keywords / Tags */}
              {t.sampleKeywords && t.sampleKeywords.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {t.sampleKeywords.slice(0, 3).map((kw) => (
                    <Link
                      key={kw}
                      to={`/search?q=${encodeURIComponent(kw)}`}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Hash className="w-2.5 h-2.5 text-neutral-400" />
                      <span>{kw}</span>
                    </Link>
                  ))}
                  {t.questionCount > 0 && (
                    <span className="text-[10px] text-neutral-400 ml-auto tabular-nums">
                      {t.questionCount} {t.questionCount === 1 ? 'question' : 'questions'}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Link */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px]">
        <Link
          to="/discover"
          className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium flex items-center gap-1 group"
        >
          <span>Explore all discussions</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
    </div>
  );
};
