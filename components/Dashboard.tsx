
import React from 'react';
import { DailyRecord } from '../types';
import { CalendarDays, Flame, Gem, CheckCircle2 } from 'lucide-react';
import { t } from '../translations';

interface DashboardProps {
  data: DailyRecord[];
  language: string;
  restMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, language, restMode = false }) => {
  const hasData = data.length > 0;
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
  const latestEntryDate = hasData
    ? new Date(uniqueDates[uniqueDates.length - 1]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="healup-reveal space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900">{t('welcomeBack', language)}</h1>
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
            {hasData ? (
              <p className="mt-3 inline-flex rounded-full bg-[#fdfaf4]/95 px-4 py-2 text-sm font-medium text-matcha-800 shadow-sm">
                {t('caringDaysPrefix', language)} {caringDaysThisWeek} {t('caringDaysSuffix', language)}
              </p>
            ) : (
              <div className="mt-4 rounded-2xl border border-matcha-100 bg-[#fdfaf4]/95 p-4 shadow-sm">
                <p className="text-sm font-semibold text-matcha-800">{t('noEntriesYet', language)}</p>
                <p className="mt-1 text-sm leading-6 text-gray-500">{t('onceTracking', language)}</p>
              </div>
            )}
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
          <h3 className="text-lg font-semibold text-gray-900">{t('restModeTitle', language)}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">
            {t('restModeBody', language)}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-matcha-50 p-4">
              <p className="text-sm font-semibold text-matcha-800">{t('oneGentleStep', language)}</p>
              <p className="mt-1 text-sm text-gray-600">{t('oneGentleStepDesc', language)}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-matcha-100">
              <p className="text-sm font-semibold text-matcha-800">{t('privateRestTitle', language)}</p>
              <p className="mt-1 text-sm text-gray-600">{t('privateRestDesc', language)}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-matcha-100">
              <p className="text-sm font-semibold text-matcha-800">{t('comeBackAnytime', language)}</p>
              <p className="mt-1 text-sm text-gray-600">{t('comeBackAnytimeDesc', language)}</p>
            </div>
          </div>
        </section>
      )}

      {!restMode && (hasData ? (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="healup-card rounded-[26px] p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-[#efe4d1] p-2 text-[#7e6a44]">
              <CalendarDays size={18} />
            </div>
            <span className="text-sm text-gray-500">{t('loggedDaysLabel', language)}</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalLoggedDays}</p>
        </div>

        <div className="healup-card rounded-[26px] p-5">
           <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-[#edf2e8] p-2 text-[#6a8963]">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-sm text-gray-500">{t('latestCheckInLabel', language)}</span>
          </div>
          <p className="text-2xl font-bold text-matcha-600">{latestEntryDate}</p>
        </div>
      </div>
      ) : (
        <section className="healup-card rounded-[30px] p-7 text-center">
          <p className="text-sm font-semibold text-matcha-800">{t('noEntriesYet', language)}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">{t('symptomHistoryAppear', language)}</p>
        </section>
      ))}
    </div>
  );
};

export default Dashboard;
