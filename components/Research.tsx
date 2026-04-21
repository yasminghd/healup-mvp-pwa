
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

// --- MOCK DATA ---

const MOCK_JOURNALS = [
  {
    id: 1,
    title: "Efficacy and Safety of Ianalumab in Sjögren’s Syndrome: A Randomized, Double-Blind Trial",
    authors: "Bowman, S., et al.",
    journal: "The Lancet Rheumatology",
    date: "2024-03-15",
    summary: "A phase 2b study showing dose-dependent improvements in disease activity (ESSDAI) and patient-reported outcomes compared to placebo over 24 weeks.",
    url: "#"
  },
  {
    id: 2,
    title: "Novel Biomarkers for Early Detection of Autoimmune Flares",
    authors: "Chen, L. & Smith, J.",
    journal: "Journal of Autoimmunity",
    date: "2024-04-10",
    summary: "Researchers identified a panel of 3 cytokine markers in saliva that predict symptom flare-ups with 85% accuracy up to 48 hours in advance.",
    url: "#"
  },
  {
    id: 3,
    title: "Dietary Interventions and Fatigue Management in Systemic Autoimmune Diseases",
    authors: "Garcia-Perez, M.",
    journal: "Nutrition Reviews",
    date: "2024-02-28",
    summary: "A systematic review suggesting that a Mediterranean-style diet significantly reduces self-reported fatigue levels in patients with Lupus and Sjögren’s.",
    url: "#"
  }
];

const MOCK_NEWS = [
  {
    id: 1,
    headline: "FDA Grants Fast Track Designation for New Sjögren’s Therapy",
    source: "Health Daily",
    date: "2 days ago",
    snippet: "The new biologic drug 'SjoBlock' has received special status from the FDA, potentially speeding up its path to patients by 2026.",
    imageUrl: "https://picsum.photos/seed/news1/300/200",
    url: "#"
  },
  {
    id: 2,
    headline: "Why Autoimmune Diseases Affect Women More Than Men",
    source: "Science Magazine",
    date: "1 week ago",
    snippet: "A new Stanford study points to the X-chromosome gene regulation mechanism 'Xist' as a key driver in the disparity.",
    imageUrl: "https://picsum.photos/seed/news2/300/200",
    url: "#"
  },
  {
    id: 3,
    headline: "Living with Invisible Illness: A Photo Essay",
    source: "The New York Times",
    date: "3 weeks ago",
    snippet: "Five patients share their daily reality of managing chronic fatigue and pain while looking 'perfectly healthy' on the outside.",
    imageUrl: "https://picsum.photos/seed/news3/300/200",
    url: "#"
  }
];

const MOCK_TRIALS = [
  {
    id: 1,
    title: "Safety Evaluation of Drug X-101",
    phase: "Phase 3",
    status: "Active",
    summary: "Evaluating long-term safety profile in 500 participants over 2 years. Interim results show no major adverse events.",
    institute: "Global Pharma Inc."
  },
  {
    id: 2,
    title: "Vagus Nerve Stimulation for Dry Eye",
    phase: "Phase 2",
    status: "Completed",
    summary: "Study met primary endpoints. Participants reported a 40% increase in tear production after 8 weeks of daily use.",
    institute: "TechBio Labs"
  },
  {
    id: 3,
    title: "Gut Microbiome Modulation Study",
    phase: "Phase 1",
    status: "Analyzing",
    summary: "First-in-human study to test if specific probiotics can lower systemic inflammation markers.",
    institute: "University Medical Center"
  }
];

const MOCK_RECRUITMENT = [
  {
    id: 1,
    title: "Digital Biomarker Fatigue Study",
    type: "Observational",
    location: "Remote (App-based)",
    compensation: "$50 Gift Card",
    eligibility: "Diagnosed with Sjögren’s or Lupus, owns a smartwatch.",
    institute: "Digital Health Institute"
  },
  {
    id: 2,
    title: "Clinical Trial for Severe Dry Eye",
    type: "Interventional",
    location: "Boston, London, Tokyo sites",
    compensation: "Travel covered + Stipend",
    eligibility: "Severe dry eye symptoms despite artificial tears use. Age 18-65.",
    institute: "Ocular Research Group"
  }
];

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
            {MOCK_JOURNALS.map(article => (
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
          </div>
        )}

        {/* News View */}
        {activeTab === 'news' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
            {MOCK_NEWS.map(news => (
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
          </div>
        )}

        {/* Trials View */}
        {activeTab === 'trials' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {MOCK_TRIALS.map(trial => (
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
          </div>
        )}

        {/* Recruitment View */}
        {activeTab === 'recruitment' && (
          <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
            {MOCK_RECRUITMENT.map(study => (
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
            
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50/50">
               <p className="text-sm font-medium">More studies coming soon...</p>
               <p className="text-xs mt-1">Check back next week for updates.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Research;
