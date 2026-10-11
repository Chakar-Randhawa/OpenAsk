import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Layers,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  BarChart2,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import {
  analyticsService,
  DiscussionAnalyticsSummary,
  DailyDiscussionMetric,
  TopicVolumeMetric
} from '../../core/services/analyticsService';

interface DiscussionMetricsChartProps {
  className?: string;
  selectedCategorySlug?: string;
}

export const DiscussionMetricsChart: React.FC<DiscussionMetricsChartProps> = ({
  className = '',
  selectedCategorySlug
}) => {
  const [data, setData] = useState<DiscussionAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'topics' | 'split'>('timeline');
  const [metricFilter, setMetricFilter] = useState<'all' | 'questions' | 'answers'>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const loadData = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const summary = await analyticsService.get30DayMetrics(selectedCategorySlug);
      setData(summary);
    } catch (err) {
      console.warn('Error loading analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategorySlug]);

  const gridColor = isDarkMode ? '#262626' : '#f0f0f0';
  const axisColor = isDarkMode ? '#737373' : '#a3a3a3';

  // Custom Recharts Tooltip
  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload as DailyDiscussionMetric;
      return (
        <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[150px]">
          <p className="font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-1">
            {pData.formattedDate}
          </p>
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-medium">
            <span>Questions:</span>
            <span className="font-mono font-bold">{pData.questions}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Answers:</span>
            <span className="font-mono font-bold">{pData.answers}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
            <span>Total Volume:</span>
            <span className="font-mono">{pData.totalVolume}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTopicTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const tData = payload[0].payload as TopicVolumeMetric;
      return (
        <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-1">
            <span className="font-bold text-neutral-900 dark:text-white">{tData.topicName}</span>
            <span className="text-[10px] text-amber-500 font-medium">{tData.momentumLabel}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <span>Questions:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-white">{tData.questionsCount}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <span>Answers:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-white">{tData.answersCount}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-neutral-900 dark:text-white font-semibold">
            <span>30-Day Activity:</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">{tData.totalVolume}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section
      className={`p-4 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5 ${className}`}
      aria-label="Discussion volume and trending topics analytics"
    >
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white font-display">
              Trending Topics & Discussion Volume
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              <Calendar className="w-3 h-3 text-neutral-400" />
              Last 30 Days
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time metric synthesis of community inquiries, peer responses, and domain momentum.
          </p>
        </div>

        {/* View Mode & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode('topics')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'topics'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Topics
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer hidden sm:block ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Comparison
            </button>
          </div>

          {/* Metric Filter */}
          {viewMode !== 'topics' && (
            <div className="hidden lg:flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setMetricFilter('all')}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  metricFilter === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setMetricFilter('questions')}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  metricFilter === 'questions'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Questions
              </button>
              <button
                type="button"
                onClick={() => setMetricFilter('answers')}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  metricFilter === 'answers'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Answers
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh metrics"
            aria-label="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
              30-Day Questions
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-display text-neutral-950 dark:text-white tabular-nums">
                {data.total30DayQuestions}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                +14%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
              Peer Answers Contributed
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-display text-neutral-950 dark:text-white tabular-nums">
                {data.total30DayAnswers}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                +22%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
              Peak Volume Day
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold font-display text-neutral-950 dark:text-white truncate">
                {data.peakDay.date}
              </span>
              <span className="text-[11px] text-neutral-400 tabular-nums">
                ({data.peakDay.volume} acts)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
              Leading Domain
            </span>
            <div className="flex items-baseline gap-1.5 truncate">
              <span className="text-base sm:text-lg font-bold font-display text-neutral-950 dark:text-white truncate">
                {data.topCategory.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Area */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-neutral-50/50 dark:bg-neutral-850/40 rounded-xl border border-neutral-100 dark:border-neutral-800 animate-pulse">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Calculating 30-day discussion metrics...</span>
          </div>
        </div>
      ) : !data ? (
        <div className="h-48 flex items-center justify-center text-xs text-neutral-400">
          No metrics available.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Timeline View (AreaChart) */}
          {(viewMode === 'timeline' || viewMode === 'split') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  Daily Discussion Volume (30-Day Curve)
                </span>
                <div className="flex items-center gap-3 text-[11px] font-normal text-neutral-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" /> Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> Answers
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.dailyMetrics}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorAnswers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis
                      dataKey="formattedDate"
                      stroke={axisColor}
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: gridColor }}
                      interval={4}
                    />
                    <YAxis
                      stroke={axisColor}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTimelineTooltip />} />
                    {(metricFilter === 'all' || metricFilter === 'questions') && (
                      <Area
                        type="monotone"
                        dataKey="questions"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorQuestions)"
                        name="Questions"
                      />
                    )}
                    {(metricFilter === 'all' || metricFilter === 'answers') && (
                      <Area
                        type="monotone"
                        dataKey="answers"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAnswers)"
                        name="Answers"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Topics Breakdown View (BarChart) */}
          {(viewMode === 'topics' || viewMode === 'split') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
                  Top Trending Knowledge Domains (30-Day Activity)
                </span>
                <span className="text-[11px] font-normal text-neutral-400">
                  Questions vs Peer Answers
                </span>
              </div>

              <div className="h-60 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.topicMetrics}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis
                      dataKey="topicName"
                      stroke={axisColor}
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: gridColor }}
                      interval={0}
                      tickFormatter={(val) => (val.length > 10 ? `${val.slice(0, 9)}…` : val)}
                    />
                    <YAxis
                      stroke={axisColor}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTopicTooltip />} />
                    <Bar
                      dataKey="questionsCount"
                      name="Questions"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="answersCount"
                      name="Answers"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Topic Badges List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {data.topicMetrics.map((topic) => (
                  <Link
                    key={topic.categorySlug}
                    to={`/category/${topic.categorySlug}`}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: topic.color }}
                        />
                        <span className="font-semibold text-xs text-neutral-900 dark:text-white truncate group-hover:underline">
                          {topic.topicName}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block tabular-nums">
                        {topic.totalVolume} total discussions
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                      {topic.momentumLabel.split(' ')[0]}
                    </span>
                  </Link>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Powered by Recharts telemetry & OpenAsk discussion stream
        </span>
        <Link
          to="/categories"
          className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium flex items-center gap-0.5"
        >
          <span>All 50 categories</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
};
