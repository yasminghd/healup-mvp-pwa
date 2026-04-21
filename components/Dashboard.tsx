
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { DailyRecord } from '../types';
import { Droplets, Moon, Activity, Sun, Flame, Gem, CheckCircle2, Sparkles } from 'lucide-react';
import { t } from '../translations';

interface DashboardProps {
  data: DailyRecord[];
  language: string;
  restMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, language, restMode = false }) => {
  // Calculate averages
  const avgFatigueVal = (data.reduce((acc, curr) => acc + curr.fatigue, 0) / data.length).toFixed(1);
  const avgSleepVal = (data.reduce((acc, curr) => acc + curr.sleepHours, 0) / data.length).toFixed(1);
  const uniqueDates = Array.from(new Set(data.map((record) => record.date))).sort();

  const streakDays = (() => {
    if (uniqueDates.length === 0) return 0;

    let streak = 1;
    for (let index = uniqueDates.length - 1; index > 0; index -= 1) {
      const currentDate = new Date(uniqueDates[index]);
      const previousDate = new Date(uniqueDates[index - 1]);
      const dayDifference = Math.round((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDifference === 1) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  })();

  const totalLoggedDays = uniqueDates.length;
  const streakBonusGems = streakDays * 3;
  const totalGems = totalLoggedDays * 5 + streakBonusGems;
  const caringDaysThisWeek = data.filter((record) => {
    const today = new Date();
    const recordDate = new Date(record.date);
    return today.getTime() - recordDate.getTime() <= 6 * 24 * 60 * 60 * 1000;
  }).length;
  const gentleReminders = [
    {
      title: 'Time for a sip of water 🌿',
      body: 'Small, steady sips can help you stay more comfortable through the day.',
      icon: Droplets,
    },
    {
      title: 'Give your eyes a soft reset',
      body: 'A blink break, warm compress, or eye drops can be enough for now.',
      icon: Sun,
    },
    {
      title: 'Mouth care can stay simple',
      body: 'Keep water nearby and use whatever small routine already helps you most.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="healup-reveal space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900">{t('welcomeBack', language)}, Sarah</h1>
        <p className="text-gray-500">{t('healthOverview', language)}</p>
      </header>

      <section className="healup-card-soft rounded-[32px] p-7 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha-600">{t('consistencyTitle', language)}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{streakDays} {t('dayStreakTitle', language)}</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-gray-600">
              {t('consistencySubtitle', language)}
            </p>
            <p className="mt-3 inline-flex rounded-full bg-[#fdfaf4]/95 px-4 py-2 text-sm font-medium text-matcha-800 shadow-sm">
              You've cared for yourself {caringDaysThisWeek} days this week 🌱
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#f6efe3] bg-[#fdfaf4]/95 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-matcha-700">
                <Flame size={18} />
                <span className="text-sm font-semibold">{t('recordStreak', language)}</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">{streakDays}</p>
              <p className="mt-1 text-sm text-gray-500">{t('daysLoggedInARow', language)}</p>
            </div>

            <div className="rounded-2xl border border-[#f6efe3] bg-[#fdfaf4]/95 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-matcha-700">
                <Gem size={18} />
                <span className="text-sm font-semibold">{t('healingGems', language)}</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">{totalGems}</p>
              <p className="mt-1 text-sm text-gray-500">+{5} {t('gemsPerLog', language)} • +{streakBonusGems} {t('streakBonus', language)}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-[#fdfaf4]/90 p-4 shadow-sm">
            <div className="rounded-xl bg-matcha-100 p-2 text-matcha-700">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('dailyLogRewardTitle', language)}</p>
              <p className="mt-1 text-sm text-gray-500">{t('dailyLogRewardDesc', language)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#fdfaf4]/90 p-4 shadow-sm">
            <div className="rounded-xl bg-[#efe4d1] p-2 text-[#7e6a44]">
              <Flame size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('streakRewardTitle', language)}</p>
              <p className="mt-1 text-sm text-gray-500">{t('streakRewardDesc', language)}</p>
            </div>
          </div>
        </div>
      </section>

      {restMode && (
        <section className="healup-card rounded-[30px] p-7 lg:p-8">
          <h3 className="text-lg font-semibold text-gray-900">Rest mode</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">
            Today stays simple. We’re keeping the most helpful bits up front so you can check in without wading through everything at once.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-matcha-50 p-4">
              <p className="text-sm font-semibold text-matcha-800">One gentle step</p>
              <p className="mt-1 text-sm text-gray-600">Log how your body feels, then stop there if that’s enough for today.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-matcha-100">
              <p className="text-sm font-semibold text-matcha-800">Private by default</p>
              <p className="mt-1 text-sm text-gray-600">Your entries stay for your care and your patterns.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-matcha-100">
              <p className="text-sm font-semibold text-matcha-800">Come back anytime</p>
              <p className="mt-1 text-sm text-gray-600">You can turn rest mode off whenever you want the fuller view again.</p>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Gentle care reminders</h3>
            <p className="text-sm text-gray-500">A few soft nudges for the basics that can help on harder days.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {gentleReminders.map((reminder) => {
            const Icon = reminder.icon;
            return (
              <div key={reminder.title} className="healup-card rounded-[28px] p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-matcha-50 text-matcha-700">
                  <Icon size={18} />
                </div>
                <h4 className="text-base font-semibold text-gray-900">{reminder.title}</h4>
                <p className="mt-2 text-sm leading-6 text-gray-500">{reminder.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {!restMode && (
      <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="healup-card rounded-[26px] p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-matcha-100 rounded-lg text-matcha-700">
              <Activity size={18} />
            </div>
            <span className="text-sm text-gray-500">{t('avgFatigue', language)}</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{avgFatigueVal}<span className="text-sm text-gray-400 font-normal">/10</span></p>
        </div>
        
        <div className="healup-card rounded-[26px] p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-[#edf2e8] p-2 text-[#6a8963]">
              <Moon size={18} />
            </div>
            <span className="text-sm text-gray-500">{t('avgSleep', language)}</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{avgSleepVal}<span className="text-sm text-gray-400 font-normal"> hrs</span></p>
        </div>

        <div className="healup-card rounded-[26px] p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-[#efe4d1] p-2 text-[#7e6a44]">
              <Droplets size={18} />
            </div>
            <span className="text-sm text-gray-500">{t('hydration', language)}</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{t('goodTrend', language)}</p>
        </div>

        <div className="healup-card rounded-[26px] p-5">
           <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-[#edf2e8] p-2 text-[#6a8963]">
              <Sun size={18} />
            </div>
            <span className="text-sm text-gray-500">{t('flareRisk', language)}</span>
          </div>
          <p className="text-2xl font-bold text-matcha-600">{t('low', language)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="healup-card rounded-[30px] p-7">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('symptomTrends', language)}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c2a980" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#c2a980" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7ea96b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7ea96b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#a79f92" />
                <YAxis stroke="#a79f92" tick={{fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece5d9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '18px', border: '1px solid rgba(228, 221, 206, 0.9)', backgroundColor: 'rgba(255, 253, 249, 0.96)', boxShadow: '0 12px 28px rgba(80, 87, 77, 0.12)' }}
                />
                <Area type="monotone" dataKey="fatigue" stroke="#b79c73" strokeWidth={2.5} strokeLinecap="round" fillOpacity={1} fill="url(#colorFatigue)" name="Fatigue" />
                <Area type="monotone" dataKey="jointPain" stroke="#7ea96b" strokeWidth={2.5} strokeLinecap="round" fillOpacity={1} fill="url(#colorPain)" name="Joint Pain" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="healup-card rounded-[30px] p-7">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('sleepVsStress', language)}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#a79f92" />
                <YAxis stroke="#a79f92" tick={{fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece5d9" />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '18px', border: '1px solid rgba(228, 221, 206, 0.9)', backgroundColor: 'rgba(255, 253, 249, 0.96)', boxShadow: '0 12px 28px rgba(80, 87, 77, 0.12)' }} />
                <Legend />
                <Bar dataKey="sleepHours" fill="#7ea96b" radius={[4, 4, 0, 0]} name="Sleep (Hrs)" />
                <Bar dataKey="stressLevel" fill="#c2a980" radius={[4, 4, 0, 0]} name="Stress (1-10)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Dashboard;
