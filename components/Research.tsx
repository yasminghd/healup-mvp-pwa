
import React, { useState } from 'react';
import { 
  BookOpen, 
  Newspaper, 
  Activity, 
  ClipboardCheck, 
  ExternalLink,
  Calendar,
  User,
  Building2,
  ArrowRight
} from 'lucide-react';
import { t } from '../translations';

interface ResearchProps {
  language: string;
}

type TabType = 'journals' | 'news' | 'trials' | 'recruitment';

const JOURNALS: Array<any> = [];
const NEWS: Array<any> = [];
const TRIALS: Array<any> = [];
const RECRUITMENT: Array<any> = [];

const Research: React.FC<ResearchProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<TabType>('journals');

  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex-1 py-4 px-2 flex flex-col md:flex-row items-center justify-center gap-2 border-b-2 transition-all
        ${activeTab === id 
          ? 'border-matcha-600 text-matcha-800 bg-matcha-50/50' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
      `}
    >
      <Icon size={20} className={activeTab === id ? 'text-matcha-600' : 'text-gray-400'} />
      <span className="text-sm font-semibold text-center">{label}</span>
    </button>
  );

  const EmptyState = ({ label }: { label: string }) => (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-gray-500">
      <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
      <p className="font-medium text-gray-700">{t('noEntriesYet', language)}</p>
      <p className="mt-1 text-sm">{label} {t('willAppearLive', language)}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{t('researchTitle', language)}</h1>
        <p className="text-gray-500">{t('researchSubtitle', language)}</p>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 flex overflow-hidden">
        <TabButton id="journals" label={t('tabJournals', language)} icon={BookOpen} />
        <TabButton id="news" label={t('tabNews', language)} icon={Newspaper} />
        <TabButton id="trials" label={t('tabTrials', language)} icon={Activity} />
        <TabButton id="recruitment" label={t('tabRecruitment', language)} icon={ClipboardCheck} />
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 border-t-0 p-6 min-h-[400px]">
        
        {/* Journals View */}
        {activeTab === 'journals' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {JOURNALS.map(article => (
              <div key={article.id} className="p-4 rounded-xl border border-gray-100 hover:border-matcha-200 transition-colors group">
                <div className="flex flex-col md:flex-row justify-between gap-2 mb-2">
                   <h3 className="text-lg font-bold text-gray-800 group-hover:text-matcha-700 transition-colors">{article.title}</h3>
                   <span className="text-xs text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-1 rounded h-fit">{article.date}</span>
                </div>
                <p className="text-sm text-matcha-600 font-medium mb-3 flex items-center gap-2">
                   <Building2 size={14}/> {article.journal} • <User size={14}/> {article.authors}
                </p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4 italic">
                  "{article.summary}"
                </div>
                <a href={article.url} className="inline-flex items-center gap-1 text-sm font-bold text-matcha-600 hover:underline">
                  {t('readFull', language)} <ExternalLink size={14} />
                </a>
              </div>
            ))}
            {JOURNALS.length === 0 && <EmptyState label={t('researchArticlesLabel', language)} />}
          </div>
        )}

        {/* News View */}
        {activeTab === 'news' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
            {NEWS.map(news => (
              <div key={news.id} className="flex flex-col rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100">
                   <img src={news.imageUrl} alt="News" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                   <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span className="font-semibold text-matcha-700">{news.source}</span>
                      <span>{news.date}</span>
                   </div>
                   <h3 className="font-bold text-gray-900 mb-2 leading-tight">{news.headline}</h3>
                   <p className="text-sm text-gray-600 mb-4 line-clamp-3">{news.snippet}</p>
                   <a href={news.url} className="mt-auto text-sm font-bold text-gray-800 hover:text-matcha-600 flex items-center gap-1">
                      {t('readArticle', language)} <ArrowRight size={14} />
                   </a>
                </div>
              </div>
            ))}
            {NEWS.length === 0 && <div className="md:col-span-2 lg:col-span-3"><EmptyState label={t('newsLabel', language)} /></div>}
          </div>
        )}

        {/* Trials View */}
        {activeTab === 'trials' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {TRIALS.map(trial => (
              <div key={trial.id} className="flex flex-col md:flex-row gap-6 p-6 rounded-xl border border-gray-100 bg-gray-50/30">
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          trial.status === 'Active' ? 'bg-green-100 text-green-700' :
                          trial.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                      }`}>
                        {trial.status}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">{trial.institute}</span>
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-2">{trial.title}</h3>
                   <p className="text-sm text-gray-600">{trial.summary}</p>
                 </div>
                 
                 <div className="w-full md:w-48 flex flex-col justify-center gap-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('phase', language)}</div>
                    <div className="flex items-center gap-1 w-full">
                       {['Phase 1', 'Phase 2', 'Phase 3'].map((p, i) => {
                          // Simple logic to show progress
                          const currentPhaseIdx = parseInt(trial.phase.split(' ')[1]) - 1;
                          return (
                            <div key={p} className={`h-2 flex-1 rounded-full ${i <= currentPhaseIdx ? 'bg-matcha-500' : 'bg-gray-200'}`}></div>
                          )
                       })}
                    </div>
                    <div className="text-right text-xs font-bold text-matcha-700">{trial.phase}</div>
                 </div>
              </div>
            ))}
            {TRIALS.length === 0 && <EmptyState label={t('trialsLabel', language)} />}
          </div>
        )}

        {/* Recruitment View */}
        {activeTab === 'recruitment' && (
          <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
            {RECRUITMENT.map(study => (
              <div key={study.id} className="border-2 border-matcha-100 rounded-2xl p-6 bg-matcha-50/20 hover:border-matcha-300 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-matcha-100 text-matcha-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">
                   {t('recruiting', language)}
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-1">{study.title}</h3>
                <p className="text-xs text-matcha-600 font-semibold mb-4 uppercase">{study.institute}</p>
                
                <div className="space-y-3 mb-6">
                   <div className="flex items-start gap-2 text-sm">
                      <Building2 size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{study.type} • {study.location}</span>
                   </div>
                   <div className="flex items-start gap-2 text-sm">
                      <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-900">{t('eligibility', language)}: </span>
                        <span className="text-gray-600">{study.eligibility}</span>
                      </div>
                   </div>
                   <div className="inline-block bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600 font-medium shadow-sm">
                      Comp: {study.compensation}
                   </div>
                </div>

                <button className="w-full bg-matcha-600 hover:bg-matcha-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-matcha-100 flex items-center justify-center gap-2">
                   {t('applyNow', language)} <ExternalLink size={16} />
                </button>
              </div>
            ))}
            {RECRUITMENT.length === 0 && <div className="md:col-span-2"><EmptyState label={t('recruitingStudiesLabel', language)} /></div>}
          </div>
        )}

      </div>
    </div>
  );
};

export default Research;


