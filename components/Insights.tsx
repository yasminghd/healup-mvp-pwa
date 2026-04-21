
import React, { useEffect, useState } from 'react';
import { DailyRecord } from '../types';
import { generateHealthInsights } from '../services/geminiService';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import { t } from '../translations';
import GentleLoader from './GentleLoader';

interface InsightsProps {
  data: DailyRecord[];
  language: string;
}

const Insights: React.FC<InsightsProps> = ({ data, language }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await generateHealthInsights(data, language);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <div className="healup-reveal space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('insightsTitle', language)}</h1>
          <p className="text-gray-500">{t('insightsSubtitle', language)}</p>
        </div>
        <button 
          onClick={fetchInsights} 
          disabled={loading}
          className="healup-card flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {t('refresh', language)}
        </button>
      </header>

      <div className="rounded-[32px] bg-gradient-to-br from-matcha-600 via-matcha-700 to-matcha-800 p-1 shadow-lg text-white">
        <div className="h-full min-h-[420px] rounded-[28px] bg-[linear-gradient(180deg,rgba(248,244,235,0.12),rgba(248,244,235,0.06))] p-7 backdrop-blur-sm lg:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-white/20 pb-4">
            <BrainCircuit size={32} className="text-white" />
            <h2 className="text-xl font-semibold">Weekly Analysis</h2>
          </div>

          {loading ? (
            <div className="h-60">
              <GentleLoader
                title={t('analyzing', language)}
                subtitle="We’re looking for gentle patterns in your recent check-ins."
                tone="cream"
              />
            </div>
          ) : (
            <div className="prose prose-invert prose-p:text-matcha-50 prose-headings:text-white max-w-none">
                {/* Simple Markdown Rendering Replacement */}
                {insight?.split('\n').map((line, idx) => {
                    if (line.startsWith('##')) return <h3 key={idx} className="text-xl font-bold mt-6 mb-2">{line.replace('##', '')}</h3>;
                    if (line.startsWith('*') || line.startsWith('-')) return <li key={idx} className="ml-4 mb-1">{line.replace(/[*|-]/, '')}</li>;
                    if (line.startsWith('**')) return <strong key={idx}>{line.replace(/\*\*/g, '')}</strong>;
                    if (line.trim() === '') return <br key={idx} />;
                    return <p key={idx} className="mb-2 leading-relaxed">{line}</p>;
                })}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="healup-card rounded-[28px] p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Sleep Hygiene</h4>
            <p className="text-sm text-gray-600">Consider maintaining a consistent bedtime. Your data suggests flare-ups after nights with less than 6 hours of sleep.</p>
        </div>
        <div className="healup-card rounded-[28px] p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Hydration Check</h4>
            <p className="text-sm text-gray-600">Great job on water intake! Consistent hydration helps mitigate dry mouth symptoms associated with Sjögren’s.</p>
        </div>
        <div className="healup-card rounded-[28px] p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Stress Management</h4>
            <p className="text-sm text-gray-600">Mid-week stress spikes correlate with increased joint pain. Try 5-minute breathing exercises on Wednesday afternoons.</p>
        </div>
      </div>
    </div>
  );
};

export default Insights;
