import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DailyRecord, QuantifiableEntry, SymptomEntry, TrackedQuantifiableMetricDefinition, TrackedSymptomDefinition } from '../types';
import { Activity, AlertCircle, Brain, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Cloud, Coffee, Download, Droplets, Eye, Footprints, HeartPulse, Leaf, Moon, Plus, Save, Settings2, Sparkles, SunMedium, X } from 'lucide-react';
import { t } from '../translations';

interface TrackerProps {
  existingData: DailyRecord[];
  onSave: (record: DailyRecord) => void;
  language: string;
  restMode?: boolean;
}

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;
type FormState = { notes: string; symptomEntries: SymptomEntry[]; quantifiableEntries: QuantifiableEntry[] };

const SYMPTOM_KEY = 'healup-tracked-symptoms';
const METRIC_KEY = 'healup-tracked-metrics';
const CORE_IDS = ['fatigue', 'dryEyes', 'dryMouth', 'jointPain'];
const ICONS: Record<string, IconComponent> = { moon: Moon, eye: Eye, droplets: Droplets, sparkles: Sparkles, brain: Brain, sun: SunMedium, cloud: Cloud, pulse: HeartPulse, activity: Activity, feet: Footprints, coffee: Coffee };
const LEVELS = [{ value: 0, label: 'None', symbol: '○' }, { value: 1, label: 'Light', symbol: '◔' }, { value: 2, label: 'Manageable', symbol: '◑' }, { value: 3, label: 'Heavy', symbol: '◕' }, { value: 4, label: 'Strong', symbol: '⬤' }, { value: 5, label: 'Very strong', symbol: '✹' }];
const SUGGESTED_SYMPTOMS: TrackedSymptomDefinition[] = [
  { id: 'fatigue', label: 'Fatigue', helper: 'How heavy does your energy feel right now?', iconKey: 'moon', source: 'suggested', suggestedLabel: 'Common in Sjogren studies' },
  { id: 'dryEyes', label: 'Dry Eyes', helper: 'A quick check-in on irritation or scratchiness.', iconKey: 'eye', source: 'suggested', suggestedLabel: 'Common in Sjogren studies' },
  { id: 'dryMouth', label: 'Dry Mouth', helper: 'Notice any dryness, thirst, or discomfort?', iconKey: 'droplets', source: 'suggested', suggestedLabel: 'Common in Sjogren studies' },
  { id: 'jointPain', label: 'Pain', helper: 'Log today\'s body pain with one gentle tap.', iconKey: 'sparkles', source: 'suggested', suggestedLabel: 'Common in Sjogren studies' },
  { id: 'brainFog', label: 'Brain Fog', helper: 'Track focus, clarity, or mental tiredness.', iconKey: 'brain', source: 'suggested', suggestedLabel: 'Often studied in Sjogren care' },
  { id: 'drySkin', label: 'Dry Skin', helper: 'Notice tightness, itching, or skin discomfort.', iconKey: 'sun', source: 'suggested' },
  { id: 'headache', label: 'Headache', helper: 'A gentle check-in for head pain or pressure.', iconKey: 'cloud', source: 'suggested' },
  { id: 'swollenGlands', label: 'Swollen Glands', helper: 'Useful for gland tenderness or swelling changes.', iconKey: 'pulse', source: 'suggested', suggestedLabel: 'Common in Sjogren studies' },
  { id: 'mouthSores', label: 'Mouth Sores', helper: 'Track irritation or sensitivity inside the mouth.', iconKey: 'activity', source: 'suggested' },
];
const SUGGESTED_METRICS: TrackedQuantifiableMetricDefinition[] = [
  { id: 'sleepHours', label: 'Sleep', helper: 'Track hours of sleep on your own scale.', unit: 'hrs', max: 12, min: 6, iconKey: 'moon', source: 'suggested', suggestedLabel: 'Common in Sjogren studies' },
  { id: 'stressLevel', label: 'Stress', helper: 'Use a personal stress range that feels natural to you.', unit: '', max: 10, min: 5, iconKey: 'brain', source: 'suggested', suggestedLabel: 'Common in Sjogren studies' },
  { id: 'waterIntake', label: 'Water', helper: 'Track hydration in glasses or a range that fits you.', unit: 'glasses', max: 12, min: 6, iconKey: 'droplets', source: 'suggested', suggestedLabel: 'Common in Sjogren studies' },
  { id: 'steps', label: 'Steps', helper: 'Helpful if pacing and movement patterns matter to you.', unit: 'steps', max: 12000, min: 1000, iconKey: 'feet', source: 'suggested' },
  { id: 'caffeine', label: 'Caffeine', helper: 'Track cups if caffeine affects dryness, sleep, or jitters.', unit: 'cups', max: 6, min: 1, iconKey: 'coffee', source: 'suggested' },
  { id: 'movementMinutes', label: 'Movement', helper: 'Use for gentle movement, yoga, or exercise minutes.', unit: 'mins', max: 120, min: 10, iconKey: 'activity', source: 'suggested' },
];

const getIcon = (key: string) => ICONS[key] || Sparkles;
const mergeById = <T extends { id: string }>(left: T[], right: T[]) => [...left, ...right.filter((item) => !left.some((current) => current.id === item.id))];
const metricDefault = (id: string, max: number) => id === 'sleepHours' ? Math.min(7, max) : id === 'stressLevel' ? Math.min(3, max) : id === 'waterIntake' ? Math.min(4, max) : 0;
const readJson = <T,>(key: string): T | null => { try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; } };
const makeId = (prefix: string, label: string) => `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
const badge = (text?: string) => text ? <span className="rounded-full bg-matcha-100 px-2 py-1 text-[11px] font-semibold text-matcha-800">{text}</span> : null;
const formatMetricMax = (max: number, unit?: string) => `Max ${max}${unit ? ` ${unit}` : ''}`;
const isLegacyDefaultSymptoms = (items: TrackedSymptomDefinition[]) => items.length === CORE_IDS.length && items.every((item) => CORE_IDS.includes(item.id) && item.source === 'suggested');
const isLegacyDefaultMetrics = (items: TrackedQuantifiableMetricDefinition[]) => {
  const defaultMetricIds = ['sleepHours', 'stressLevel', 'waterIntake'];
  return items.length === defaultMetricIds.length && items.every((item) => defaultMetricIds.includes(item.id) && item.source === 'suggested');
};

const fromRecordSymptoms = (record?: DailyRecord) => {
  if (!record) return [] as TrackedSymptomDefinition[];
  if (record.trackedSymptoms?.length) return record.trackedSymptoms;
  return (record.additionalSymptoms || []).map((entry) => SUGGESTED_SYMPTOMS.find((item) => item.id === entry.id) || { id: entry.id, label: entry.name, helper: 'A custom symptom you chose to keep an eye on.', iconKey: 'sparkles', source: entry.source });
};

const fromRecordMetrics = (record?: DailyRecord) => {
  if (!record) return [] as TrackedQuantifiableMetricDefinition[];
  if (record.trackedQuantifiableMetrics?.length) return record.trackedQuantifiableMetrics;
  if (record.quantifiableEntries?.length) return record.quantifiableEntries.map((entry) => SUGGESTED_METRICS.find((item) => item.id === entry.id) || { id: entry.id, label: entry.name, helper: 'A custom lifestyle measure you want to track.', unit: entry.unit, max: entry.max || 10, min: 1, iconKey: 'activity', source: entry.source });
  return [];
};

const normalizeSymptoms = (defs: TrackedSymptomDefinition[], entries?: SymptomEntry[]) => defs.map((def) => {
  const current = entries?.find((entry) => entry.id === def.id);
  return { id: def.id, name: def.label, severity: current?.severity ?? 0, source: def.source };
});

const normalizeMetrics = (defs: TrackedQuantifiableMetricDefinition[], entries?: QuantifiableEntry[]) => defs.map((def) => {
  const current = entries?.find((entry) => entry.id === def.id);
  return { id: def.id, name: def.label, value: current?.value ?? metricDefault(def.id, def.max), unit: current?.unit || def.unit, max: current?.max ?? def.max, source: def.source };
});

const Tracker: React.FC<TrackerProps> = ({ existingData, onSave, language, restMode = false }) => {
  const latestManaged = useMemo(() => [...existingData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).find((record) => record.trackedSymptoms?.length || record.trackedQuantifiableMetrics?.length || record.symptomEntries?.length || record.quantifiableEntries?.length || record.additionalSymptoms?.length), [existingData]);
  const defaultSymptoms = useMemo(() => {
    const stored = typeof window !== 'undefined' ? readJson<TrackedSymptomDefinition[]>(SYMPTOM_KEY) : null;
    return stored?.length && !isLegacyDefaultSymptoms(stored) ? stored : fromRecordSymptoms(latestManaged);
  }, [latestManaged]);
  const defaultMetrics = useMemo(() => {
    const stored = typeof window !== 'undefined' ? readJson<TrackedQuantifiableMetricDefinition[]>(METRIC_KEY) : null;
    return stored?.length && !isLegacyDefaultMetrics(stored) ? stored : fromRecordMetrics(latestManaged);
  }, [latestManaged]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trackedSymptoms, setTrackedSymptoms] = useState(defaultSymptoms);
  const [trackedMetrics, setTrackedMetrics] = useState(defaultMetrics);
  const [form, setForm] = useState<FormState>({ notes: '', symptomEntries: normalizeSymptoms(defaultSymptoms), quantifiableEntries: normalizeMetrics(defaultMetrics) });
  const [saved, setSaved] = useState(false);
  const [symptomManagerOpen, setSymptomManagerOpen] = useState(false);
  const [lifestyleManagerOpen, setLifestyleManagerOpen] = useState(false);
  const [customSymptom, setCustomSymptom] = useState('');
  const [customMetric, setCustomMetric] = useState({ name: '', unit: '', max: '10' });
  const autosaveReadyRef = useRef(false);
  const symptomsRef = useRef(trackedSymptoms);
  const metricsRef = useRef(trackedMetrics);

  useEffect(() => { symptomsRef.current = trackedSymptoms; window.localStorage.setItem(SYMPTOM_KEY, JSON.stringify(trackedSymptoms)); }, [trackedSymptoms]);
  useEffect(() => { metricsRef.current = trackedMetrics; window.localStorage.setItem(METRIC_KEY, JSON.stringify(trackedMetrics)); }, [trackedMetrics]);

  useEffect(() => {
    autosaveReadyRef.current = false;
    const record = existingData.find((item) => item.date === selectedDate);
    const nextSymptoms = mergeById(symptomsRef.current, fromRecordSymptoms(record));
    const nextMetrics = mergeById(metricsRef.current, fromRecordMetrics(record));
    if (nextSymptoms.length !== symptomsRef.current.length) { symptomsRef.current = nextSymptoms; setTrackedSymptoms(nextSymptoms); }
    if (nextMetrics.length !== metricsRef.current.length) { metricsRef.current = nextMetrics; setTrackedMetrics(nextMetrics); }

    const legacySymptoms: SymptomEntry[] = record ? [
      { id: 'fatigue', name: 'Fatigue', severity: record.fatigue || 0, source: 'suggested' },
      { id: 'dryEyes', name: 'Dry Eyes', severity: record.dryEyes || 0, source: 'suggested' },
      { id: 'dryMouth', name: 'Dry Mouth', severity: record.dryMouth || 0, source: 'suggested' },
      { id: 'jointPain', name: 'Pain', severity: record.jointPain || 0, source: 'suggested' },
      ...(record.additionalSymptoms || []).map((entry) => ({ id: entry.id, name: entry.name, severity: entry.severity, source: entry.source })),
    ] : [];
    const legacyMetrics: QuantifiableEntry[] = record ? [
      { id: 'sleepHours', name: 'Sleep', value: record.sleepHours || 0, unit: 'hrs', max: 12, source: 'suggested' },
      { id: 'stressLevel', name: 'Stress', value: record.stressLevel || 0, unit: '', max: 10, source: 'suggested' },
      { id: 'waterIntake', name: 'Water', value: record.waterIntake || 0, unit: 'glasses', max: 12, source: 'suggested' },
    ] : [];

    setForm({
      notes: record?.notes || '',
      symptomEntries: normalizeSymptoms(nextSymptoms, record?.symptomEntries || legacySymptoms),
      quantifiableEntries: normalizeMetrics(nextMetrics, record?.quantifiableEntries || legacyMetrics),
    });
    setSaved(false);
    const timer = window.setTimeout(() => { autosaveReadyRef.current = true; }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedDate, existingData]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      symptomEntries: normalizeSymptoms(trackedSymptoms, current.symptomEntries),
      quantifiableEntries: normalizeMetrics(trackedMetrics, current.quantifiableEntries),
    }));
  }, [trackedSymptoms, trackedMetrics]);

  const persist = () => {
    const symptomValue = (id: string) => form.symptomEntries.find((entry) => entry.id === id)?.severity || 0;
    const metricValue = (id: string) => form.quantifiableEntries.find((entry) => entry.id === id)?.value || 0;
    onSave({
      id: existingData.find((item) => item.date === selectedDate)?.id || Date.now().toString(),
      date: selectedDate,
      fatigue: symptomValue('fatigue'),
      dryEyes: symptomValue('dryEyes'),
      dryMouth: symptomValue('dryMouth'),
      jointPain: symptomValue('jointPain'),
      additionalSymptoms: form.symptomEntries.filter((entry) => !CORE_IDS.includes(entry.id)).map((entry) => ({ id: entry.id, name: entry.name, severity: entry.severity, source: entry.source })),
      symptomEntries: form.symptomEntries,
      quantifiableEntries: form.quantifiableEntries,
      trackedSymptoms,
      trackedQuantifiableMetrics: trackedMetrics,
      sleepHours: metricValue('sleepHours'),
      stressLevel: metricValue('stressLevel'),
      waterIntake: metricValue('waterIntake'),
      activityLevel: 'Moderate',
      notes: form.notes,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    if (!autosaveReadyRef.current) return;
    const timer = window.setTimeout(() => persist(), 900);
    return () => window.clearTimeout(timer);
  }, [form, trackedSymptoms, trackedMetrics, selectedDate]);

  const updateSymptom = (id: string, severity: number) => setForm((current) => ({ ...current, symptomEntries: current.symptomEntries.map((entry) => entry.id === id ? { ...entry, severity } : entry) }));
  const updateMetric = (id: string, value: number) => setForm((current) => ({ ...current, quantifiableEntries: current.quantifiableEntries.map((entry) => entry.id === id ? { ...entry, value: Math.min(value, entry.max) } : entry) }));
  const addSymptom = (def: TrackedSymptomDefinition) => setTrackedSymptoms((current) => current.some((item) => item.id === def.id) ? current : [...current, def]);
  const removeSymptom = (id: string) => setTrackedSymptoms((current) => current.filter((item) => item.id !== id));
  const addMetric = (def: TrackedQuantifiableMetricDefinition) => setTrackedMetrics((current) => current.some((item) => item.id === def.id) ? current : [...current, def]);
  const removeMetric = (id: string) => setTrackedMetrics((current) => current.filter((item) => item.id !== id));
  const updateMetricLimit = (id: string, raw: number) => {
    setTrackedMetrics((current) => current.map((item) => item.id === id ? { ...item, max: Math.max(item.min, Number(raw) || item.min) } : item));
    setForm((current) => ({ ...current, quantifiableEntries: current.quantifiableEntries.map((entry) => {
      if (entry.id !== id) return entry;
      const metric = metricsRef.current.find((item) => item.id === id);
      const max = Math.max(metric?.min || 1, Number(raw) || metric?.min || 1);
      return { ...entry, max, value: Math.min(entry.value, max) };
    }) }));
  };

  const addCustomSymptom = () => {
    const name = customSymptom.trim();
    if (!name || trackedSymptoms.some((item) => item.label.toLowerCase() === name.toLowerCase())) return setCustomSymptom('');
    addSymptom({ id: makeId('custom-symptom', name), label: name, helper: 'A custom symptom you chose to keep an eye on.', iconKey: 'sparkles', source: 'custom' });
    setCustomSymptom('');
  };

  const addCustomMetric = () => {
    const name = customMetric.name.trim();
    const unit = customMetric.unit.trim() || 'units';
    const max = Math.max(1, Number(customMetric.max) || 1);
    if (!name || trackedMetrics.some((item) => item.label.toLowerCase() === name.toLowerCase())) return;
    addMetric({ id: makeId('custom-metric', name), label: name, helper: 'A custom lifestyle measure you want to track.', unit, max, min: 1, iconKey: 'activity', source: 'custom' });
    setCustomMetric({ name: '', unit: '', max: '10' });
  };

  const exportCsv = () => {
    const rows = [...existingData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((row) => [
      row.date,
      `"${(row.symptomEntries || []).map((entry) => `${entry.name}: ${entry.severity}`).join(' | ').replace(/"/g, '""')}"`,
      `"${(row.quantifiableEntries || []).map((entry) => `${entry.name}: ${entry.value}/${entry.max} ${entry.unit}`).join(' | ').replace(/"/g, '""')}"`,
      `"${(row.notes || '').replace(/"/g, '""')}"`,
    ].join(','));
    const blob = new Blob([['Date', 'Symptoms', 'Lifestyle', 'Notes'].join(','), ...rows].join('\n'), { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `HealUp_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const days = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i, label: new Date(2026, i, 1).toLocaleDateString(language === 'English' ? 'en-US' : 'de-DE', { month: 'long' }) }));
  const symptomCards = trackedSymptoms.map((def) => ({ def, entry: form.symptomEntries.find((item) => item.id === def.id) || { id: def.id, name: def.label, severity: 0, source: def.source } }));
  const metricCards = trackedMetrics.map((def) => ({ def, entry: form.quantifiableEntries.find((item) => item.id === def.id) || { id: def.id, name: def.label, value: metricDefault(def.id, def.max), unit: def.unit, max: def.max, source: def.source } }));

  return (
    <div className="healup-reveal animate-in fade-in duration-500 space-y-8">
      <header className="flex items-end justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">{t('trackerTitle', language)}</h2><p className="text-gray-500">{t('trackerSubtitle', language)}</p></div>
        <button onClick={exportCsv} className="healup-card flex items-center gap-2 rounded-[24px] px-4 py-3 text-sm text-matcha-800 transition-all hover:scale-[1.01] hover:bg-matcha-50"><Download size={16} /> {t('exportReport', language)}</button>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="healup-card h-fit rounded-[30px] p-7">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-bold text-gray-800"><CalendarIcon size={18} className="text-matcha-600" />{currentMonth.toLocaleDateString(language === 'English' ? 'en-US' : 'de-DE', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex gap-1"><button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="rounded-xl p-2 hover:bg-gray-100"><ChevronLeft size={20} /></button><button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="rounded-xl p-2 hover:bg-gray-100"><ChevronRight size={20} /></button></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1"><span className="text-xs font-medium text-gray-500">Month</span><select value={currentMonth.getMonth()} onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), Number(e.target.value), 1))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">{monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-medium text-gray-500">Year</span><select value={currentMonth.getFullYear()} onChange={(e) => setCurrentMonth(new Date(Number(e.target.value), currentMonth.getMonth(), 1))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">{yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}</select></label>
            </div>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i}>{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
              const date = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const selected = selectedDate === date;
              const recorded = existingData.some((entry) => entry.date === date);
              return <button key={day} onClick={() => setSelectedDate(date)} className={`relative flex h-10 flex-col items-center justify-center rounded-lg text-sm ${selected ? 'bg-matcha-600 text-white shadow-md shadow-matcha-200' : 'bg-gray-50/50 text-gray-700 hover:bg-matcha-50'}`}><span className="font-medium">{day}</span>{recorded && <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${selected ? 'bg-white' : 'bg-matcha-500'}`} />}</button>;
            })}
          </div>
          <div className="mt-6 border-t border-gray-100 pt-4"><div className="mb-2 flex items-center gap-2 text-xs text-gray-500"><div className="h-2 w-2 rounded-full bg-matcha-500" /> Recorded Entry</div></div>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <div className="healup-card rounded-[30px] p-7 lg:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div><h3 className="text-lg font-bold text-gray-900">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3></div>
              {saved && <div className="healup-saved-toast healup-reveal flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-sm"><Check size={16} /><span>{t('savedGently', language)}</span></div>}
            </div>
            <div className="healup-card-soft mb-8 rounded-[26px] p-5"><p className="text-sm font-medium text-matcha-800">{t('trackerEncouragement', language)}</p><p className="mt-1 text-sm text-gray-500">{t('trackerAutosaveNote', language)}</p></div>
            {restMode && <div className="healup-card mb-8 rounded-[26px] p-5"><p className="text-sm font-semibold text-matcha-800">Rest mode keeps this lighter.</p><p className="mt-1 text-sm leading-6 text-gray-500">You can still manage what appears here, but the main logging surfaces stay simple.</p></div>}
            <form onSubmit={(e) => { e.preventDefault(); persist(); }} className="space-y-10">
              <div>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div><h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-matcha-800"><AlertCircle size={16} /> Symptoms</h4><p className="text-sm text-gray-500">Track only what matters to you right now. Core symptoms are removable too.</p></div>
                  <button type="button" onClick={() => setSymptomManagerOpen((x) => !x)} className="healup-button-secondary healup-focus inline-flex min-h-[48px] items-center gap-2 rounded-[24px] px-4 py-3 text-sm font-semibold"><Settings2 size={16} />{symptomManagerOpen ? 'Close symptom manager' : 'Manage symptoms'}</button>
                </div>
                {symptomManagerOpen && !restMode && <div className="healup-card-soft mb-8 rounded-[28px] p-5"><div className="grid gap-3 md:grid-cols-2">{SUGGESTED_SYMPTOMS.map((s) => { const Icon = getIcon(s.iconKey); const selected = trackedSymptoms.some((x) => x.id === s.id); return <button key={s.id} type="button" onClick={() => selected ? removeSymptom(s.id) : addSymptom(s)} className={`healup-focus rounded-[24px] border p-5 text-left ${selected ? 'border-matcha-300 bg-white shadow-sm' : 'border-transparent bg-white/70 hover:border-matcha-200 hover:bg-white'}`}><div className="mb-3 flex items-center justify-between gap-3"><div className="rounded-xl bg-matcha-50 p-2 text-matcha-700"><Icon size={18} /></div><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${selected ? 'bg-matcha-100 text-matcha-800' : 'bg-gray-100 text-gray-500'}`}>{selected ? 'Tracking' : 'Add'}</span></div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-gray-900">{s.label}</p>{badge(s.suggestedLabel)}</div><p className="mt-1 text-sm leading-6 text-gray-500">{s.helper}</p></button>; })}</div>{trackedSymptoms.some((s) => s.source === 'custom') && <div className="mt-5 border-t border-matcha-100 pt-5"><p className="text-sm font-semibold text-matcha-800">Your custom symptoms</p><div className="mt-4 grid gap-3 md:grid-cols-2">{trackedSymptoms.filter((s) => s.source === 'custom').map((s) => { const Icon = getIcon(s.iconKey); return <button key={s.id} type="button" onClick={() => removeSymptom(s.id)} className="healup-focus rounded-[24px] border border-matcha-300 bg-white p-5 text-left shadow-sm"><div className="mb-3 flex items-center justify-between gap-3"><div className="rounded-xl bg-matcha-50 p-2 text-matcha-700"><Icon size={18} /></div><span className="rounded-full bg-matcha-100 px-2 py-1 text-[11px] font-semibold text-matcha-800">Tracking</span></div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-gray-900">{s.label}</p><span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-matcha-700">Custom</span></div><p className="mt-1 text-sm leading-6 text-gray-500">{s.helper}</p><p className="mt-3 text-xs font-medium text-gray-400">Tap to remove</p></button>; })}</div></div>}<div className="mt-6 border-t border-matcha-100 pt-5"><p className="text-sm font-semibold text-matcha-800">Add your own symptom</p><p className="mt-1 text-sm text-gray-500">Custom symptoms appear in the same section as every other symptom.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input type="text" value={customSymptom} onChange={(e) => setCustomSymptom(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSymptom(); } }} placeholder="Add a symptom like jaw pain or dizziness" className="healup-focus min-h-[48px] flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-700" /><button type="button" onClick={addCustomSymptom} className="healup-button healup-focus inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[24px] px-4 py-3 text-sm font-semibold text-white"><Leaf size={16} className="healup-leaf-wiggle" /><span>Add symptom</span></button></div></div></div>}
                {!symptomManagerOpen && (symptomCards.length ? <div className="grid gap-4 md:grid-cols-2">{symptomCards.map(({ def, entry }) => { const Icon = getIcon(def.iconKey); return <div key={def.id} className="rounded-2xl border border-matcha-100 bg-matcha-50/60 p-4"><div className="mb-4 flex items-start gap-3"><div className="rounded-xl bg-white p-2 text-matcha-700 shadow-sm"><Icon size={18} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h5 className="text-base font-semibold text-gray-900">{def.label}</h5>{def.source === 'custom' && <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-matcha-700">Custom</span>}</div><p className="text-sm leading-6 text-gray-500">{def.helper}</p></div></div><div className="grid grid-cols-3 gap-2">{LEVELS.map((level) => { const selected = entry.severity === level.value; return <button key={level.value} type="button" onClick={() => updateSymptom(def.id, level.value)} className={`min-h-[68px] rounded-2xl border px-3 py-3 text-left ${selected ? 'border-matcha-300 bg-white text-matcha-800 shadow-sm' : 'border-transparent bg-white/70 text-gray-600 hover:border-matcha-200 hover:bg-white'}`}><span className="block text-lg">{level.symbol}</span><span className="mt-1 block text-xs font-semibold">{level.label}</span></button>; })}</div></div>; })}</div> : <div className="healup-card-soft rounded-[28px] p-6"><p className="text-sm font-semibold text-matcha-800">No symptoms selected yet</p><p className="mt-1 text-sm text-gray-500">Open the symptom manager and add only the symptoms you want to track.</p></div>)}
              </div>
              <div className="my-4 h-px w-full bg-gray-100" />
              <div>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div><h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-matcha-800">{t('lifestyle', language)}</h4><p className="text-sm text-gray-500">Add, remove, and define quantifiable lifestyle items, including their own limits.</p></div>
                  <button type="button" onClick={() => setLifestyleManagerOpen((x) => !x)} className="healup-button-secondary healup-focus inline-flex min-h-[48px] items-center gap-2 rounded-[24px] px-4 py-3 text-sm font-semibold"><Settings2 size={16} />{lifestyleManagerOpen ? 'Close lifestyle manager' : 'Manage lifestyle'}</button>
                </div>
                {!restMode && <div className="mb-4 flex flex-wrap gap-2">{trackedMetrics.length ? trackedMetrics.map((m) => <span key={m.id} className="inline-flex items-center gap-2 rounded-full border border-matcha-100 bg-matcha-50 px-3 py-2 text-xs font-semibold text-matcha-800">{m.label}: {formatMetricMax(m.max, m.unit)}</span>) : <span className="text-sm text-gray-500">No quantifiable lifestyle items are being tracked yet.</span>}</div>}
                {lifestyleManagerOpen && !restMode && <div className="healup-card-soft mb-8 rounded-[28px] p-5"><div className="grid gap-3 md:grid-cols-2">{SUGGESTED_METRICS.map((m) => { const Icon = getIcon(m.iconKey); const selected = trackedMetrics.some((x) => x.id === m.id); return <button key={m.id} type="button" onClick={() => selected ? removeMetric(m.id) : addMetric(m)} className={`healup-focus rounded-[24px] border p-5 text-left ${selected ? 'border-matcha-300 bg-white shadow-sm' : 'border-transparent bg-white/70 hover:border-matcha-200 hover:bg-white'}`}><div className="mb-3 flex items-center justify-between gap-3"><div className="rounded-xl bg-matcha-50 p-2 text-matcha-700"><Icon size={18} /></div><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${selected ? 'bg-matcha-100 text-matcha-800' : 'bg-gray-100 text-gray-500'}`}>{selected ? 'Tracking' : 'Add'}</span></div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-gray-900">{m.label}</p>{badge(m.suggestedLabel)}</div><p className="mt-1 text-sm leading-6 text-gray-500">{m.helper}</p></button>; })}</div>{trackedMetrics.some((m) => m.source === 'custom') && <div className="mt-5 border-t border-matcha-100 pt-5"><p className="text-sm font-semibold text-matcha-800">Your custom lifestyle measures</p><div className="mt-4 grid gap-4 md:grid-cols-2">{trackedMetrics.filter((m) => m.source === 'custom').map((m) => { const Icon = getIcon(m.iconKey); return <div key={m.id} className="healup-card rounded-[24px] p-5"><div className="flex items-start justify-between gap-3"><div><div className="mb-3 flex items-center gap-3"><div className="rounded-xl bg-matcha-50 p-2 text-matcha-700"><Icon size={18} /></div><span className="rounded-full bg-matcha-100 px-2 py-1 text-[11px] font-semibold text-matcha-800">Tracking</span></div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-gray-900">{m.label}</p><span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-matcha-700">Custom</span></div><p className="mt-1 text-sm text-gray-500">{m.helper}</p></div><button type="button" onClick={() => removeMetric(m.id)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X size={14} /></button></div><div className="mt-4"><label className="block text-xs font-medium text-gray-500">Upper limit</label><div className="mt-2 flex items-center gap-3"><input type="number" min={m.min} value={m.max} onChange={(e) => updateMetricLimit(m.id, Number(e.target.value))} className="healup-focus min-h-[48px] w-28 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-700" /><span className="text-sm text-gray-500">{m.unit}</span></div></div></div>; })}</div></div>}<div className="mt-6 border-t border-matcha-100 pt-5"><p className="text-sm font-semibold text-matcha-800">Define your own lifestyle measure</p><p className="mt-1 text-sm text-gray-500">Choose the label, unit, and maximum yourself.</p><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_auto]"><input type="text" value={customMetric.name} onChange={(e) => setCustomMetric((current) => ({ ...current, name: e.target.value }))} placeholder="Example: Eye drops or screen time" className="healup-focus min-w-0 min-h-[48px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-700" /><input type="text" value={customMetric.unit} onChange={(e) => setCustomMetric((current) => ({ ...current, unit: e.target.value }))} placeholder="Unit" className="healup-focus min-w-0 min-h-[48px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-700" /><input type="number" min={1} value={customMetric.max} onChange={(e) => setCustomMetric((current) => ({ ...current, max: e.target.value }))} placeholder="Max" className="healup-focus min-w-0 min-h-[48px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-700" /><button type="button" onClick={addCustomMetric} className="healup-button healup-focus inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[24px] px-4 py-3 text-sm font-semibold text-white md:col-span-2 xl:col-span-1 xl:w-auto"><Plus size={16} /> Add</button></div></div></div>}
                {!lifestyleManagerOpen && (metricCards.length ? <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">{metricCards.map(({ def, entry }) => { const Icon = getIcon(def.iconKey); return <div key={def.id} className="space-y-3 rounded-[24px] border border-matcha-100 bg-[#fffdf9] p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="rounded-xl bg-matcha-50 p-2 text-matcha-700"><Icon size={18} /></div><div><div className="flex flex-wrap items-center gap-2"><label className="text-sm font-semibold text-gray-900">{def.label}</label></div><p className="text-sm text-gray-500">{def.helper}</p></div></div><span className="rounded bg-matcha-50 px-2 py-0.5 text-sm font-bold text-matcha-700">{entry.value}</span></div><input type="range" min={0} max={entry.max} value={entry.value} onChange={(e) => updateMetric(def.id, Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-matcha-600" /><div className="flex justify-between text-xs text-gray-400"><span>0</span><span>{formatMetricMax(entry.max, entry.unit)}</span></div></div>; })}</div> : <div className="healup-card-soft rounded-[28px] p-6"><p className="text-sm font-semibold text-matcha-800">No lifestyle measures selected yet</p><p className="mt-1 text-sm text-gray-500">Open the lifestyle manager and add any quantifiable measures you want to track.</p></div>)}
              </div>
              <div><label className="mb-2 block text-sm font-medium text-gray-700">{t('dailyNotes', language)}</label><textarea className="healup-focus w-full rounded-2xl border border-gray-200 p-4 outline-none transition-all" rows={3} placeholder={t('notesPlaceholder', language)} value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} /></div>
              <button type="submit" className="healup-button healup-focus flex w-full items-center justify-center gap-2 rounded-[24px] py-4 font-bold text-white"><Save size={20} /> {t('saveNow', language)}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
