
import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Video, 
  Users, 
  GraduationCap, 
  ExternalLink,
  Clock,
  Filter,
  Globe,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import { t } from '../translations';

type EventType = 'educational' | 'community';
type EventFormat = 'all' | 'virtual' | 'in-person';

interface HealthEvent {
  id: string;
  title: string;
  description: string;
  host: string;
  date: string;
  time: string;
  type: EventType;
  category: string;
  isVirtual: boolean;
  location?: string;
  imageUrl: string;
  registered: boolean;
  language: string;
  distanceMiles?: number;
}

const MOCK_EVENTS: HealthEvent[] = [
  {
    id: '1',
    title: 'Managing Flares: Nutrition & Diet',
    description: 'Join Dr. Wilson for a deep dive into anti-inflammatory foods that can help manage Sjögren’s symptoms.',
    host: 'Dr. James Wilson',
    date: '2024-05-15',
    time: '2:00 PM EST',
    type: 'educational',
    category: 'Webinar',
    isVirtual: true,
    imageUrl: 'https://picsum.photos/seed/nutrition/400/200',
    registered: true,
    language: 'English'
  },
  {
    id: '2',
    title: 'Portland Warriors Coffee Meetup',
    description: 'Casual in-person meetup for patients in the Portland area. Come share your stories and support each other.',
    host: 'Sarah Jenkins (You)',
    date: '2024-05-18',
    time: '10:00 AM PST',
    type: 'community',
    category: 'Social',
    isVirtual: false,
    location: 'Matcha Cafe, Pearl District',
    imageUrl: 'https://picsum.photos/seed/coffee/400/200',
    registered: true,
    language: 'English',
    distanceMiles: 3.5
  },
  {
    id: '3',
    title: 'New Therapies on the Horizon',
    description: 'The Sjogren’s Foundation presents an update on clinical trials and upcoming medications for 2024.',
    host: 'Sjögren’s Foundation',
    date: '2024-05-22',
    time: '5:00 PM EST',
    type: 'educational',
    category: 'Medical Update',
    isVirtual: true,
    imageUrl: 'https://picsum.photos/seed/medicine/400/200',
    registered: false,
    language: 'English'
  },
  {
    id: '4',
    title: 'Thursday Night Virtual Support',
    description: 'Our weekly safe space to vent, laugh, and cry. Open to all autoimmune warriors.',
    host: 'Autoimmune Alliance',
    date: '2024-05-23',
    time: '7:00 PM CST',
    type: 'community',
    category: 'Support Group',
    isVirtual: true,
    imageUrl: 'https://picsum.photos/seed/support/400/200',
    registered: false,
    language: 'English'
  },
  {
    id: '5',
    title: 'Dry Eye Workshop: Tips & Tricks',
    description: 'Practical demonstration of eyelid hygiene, warm compresses, and drop administration.',
    host: 'Dr. Ayesha Patel',
    date: '2024-05-28',
    time: '1:00 PM EST',
    type: 'educational',
    category: 'Workshop',
    isVirtual: true,
    imageUrl: 'https://picsum.photos/seed/eye/400/200',
    registered: false,
    language: 'English'
  },
  {
    id: '6',
    title: 'Vivir con Sjögren: Estrategias Diarias',
    description: 'Un seminario web especial para nuestra comunidad de habla hispana sobre el manejo de la fatiga.',
    host: 'Asociación Española',
    date: '2024-06-02',
    time: '11:00 AM CST',
    type: 'educational',
    category: 'Webinar',
    isVirtual: true,
    imageUrl: 'https://picsum.photos/seed/spanish/400/200',
    registered: false,
    language: 'Spanish'
  },
  {
    id: '7',
    title: 'Seattle Regional Conference',
    description: 'Annual gathering of patients and researchers in the Pacific Northwest.',
    host: 'NW Autoimmune Network',
    date: '2024-06-10',
    time: '9:00 AM PST',
    type: 'educational',
    category: 'Conference',
    isVirtual: false,
    location: 'Seattle Convention Center',
    imageUrl: 'https://picsum.photos/seed/seattle/400/200',
    registered: false,
    language: 'English',
    distanceMiles: 175
  },
  {
    id: '8',
    title: 'Cucina Antinfiammatoria',
    description: 'Impara a cucinare piatti deliziosi che aiutano a ridurre l\'infiammazione nel corpo.',
    host: 'Dr. Marco Rossi',
    date: '2024-06-15',
    time: '6:00 PM CET',
    type: 'educational',
    category: 'Workshop',
    isVirtual: true,
    imageUrl: 'https://picsum.photos/seed/cooking/400/200',
    registered: false,
    language: 'Italian'
  },
  {
    id: '9',
    title: 'Sentupada a Cuira',
    description: 'Nus ans inscuntrain per barattar ideas ed experientschas da viver cun malsognas autoimmunas.',
    host: 'Grup da sustegn Grischun',
    date: '2024-06-20',
    time: '7:00 PM CET',
    type: 'community',
    category: 'Social',
    isVirtual: false,
    location: 'Chur, GR',
    imageUrl: 'https://picsum.photos/seed/chur/400/200',
    registered: false,
    language: 'Romansh',
    distanceMiles: 5200 
  }
];

interface EventsProps {
    language: string;
}

const Events: React.FC<EventsProps> = ({ language }) => {
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'educational' | 'community'>('all');
  const [formatFilter, setFormatFilter] = useState<EventFormat>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [distanceFilter, setDistanceFilter] = useState<number>(50); // Value depends on unit
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi');
  
  const [events, setEvents] = useState(MOCK_EVENTS);

  const toggleRegister = (id: string) => {
    setEvents(prev => prev.map(e => 
      e.id === id ? { ...e, registered: !e.registered } : e
    ));
  };

  const toggleUnit = () => {
    const factor = 1.60934;
    if (distanceUnit === 'mi') {
      // Switch to KM: convert value up
      setDistanceUnit('km');
      setDistanceFilter(Math.round(distanceFilter * factor));
    } else {
      // Switch to MI: convert value down
      setDistanceUnit('mi');
      setDistanceFilter(Math.round(distanceFilter / factor));
    }
  };

  const filteredEvents = events.filter(e => {
    // 1. Category Filter
    const matchesCategory = categoryFilter === 'all' || e.type === categoryFilter;
    
    // 2. Format Filter
    const matchesFormat = formatFilter === 'all' || 
                          (formatFilter === 'virtual' && e.isVirtual) || 
                          (formatFilter === 'in-person' && !e.isVirtual);
    
    // 3. Language Filter
    const matchesLanguage = languageFilter === 'All' || e.language === languageFilter;

    // 4. Distance Filter (Only applies to in-person events)
    let matchesDistance = true;
    if (!e.isVirtual && e.distanceMiles !== undefined) {
       const distanceInCurrentUnit = distanceUnit === 'mi' 
         ? e.distanceMiles 
         : e.distanceMiles * 1.60934;
       matchesDistance = distanceInCurrentUnit <= distanceFilter;
    }

    return matchesCategory && matchesFormat && matchesLanguage && matchesDistance;
  });

  const getMonthDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString(language === 'English' ? 'en-US' : 'de-DE', { month: 'short' }),
      day: date.getDate()
    };
  };
  
  const getTranslatedLanguage = (langKey: string) => {
    if (langKey === 'All') return t('allLanguages', language);
    // Dynamic lookup: t('langEnglish', language), t('langSpanish', language), etc.
    return t(`lang${langKey}`, language);
  };

  const uniqueLanguages = ['All', ...Array.from(new Set(MOCK_EVENTS.map(e => e.language)))];
  const maxDistance = distanceUnit === 'mi' ? 200 : 320;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('eventsTitle', language)}</h1>
          <p className="text-gray-500">{t('eventsSubtitle', language)}</p>
        </div>
        
        {/* Main Filters Container */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-gray-100 pb-4">
            {/* Category Tabs */}
            <div className="bg-gray-100 p-1 rounded-xl flex shadow-inner">
              <button 
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${categoryFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('allCategories', language)}
              </button>
              <button 
                onClick={() => setCategoryFilter('educational')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${categoryFilter === 'educational' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <GraduationCap size={16} /> {t('educational', language)}
              </button>
              <button 
                onClick={() => setCategoryFilter('community')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${categoryFilter === 'community' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Users size={16} /> {t('communityCat', language)}
              </button>
            </div>

            {/* Language Dropdown */}
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-gray-400" />
              <select 
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-matcha-500 focus:border-matcha-500 block p-2.5 outline-none"
              >
                {uniqueLanguages.map(lang => (
                  <option key={lang} value={lang}>{getTranslatedLanguage(lang)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Format Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Filter size={16} /> {t('format', language)}:
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFormatFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${formatFilter === 'all' ? 'bg-matcha-50 border-matcha-200 text-matcha-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Any
                </button>
                <button 
                  onClick={() => setFormatFilter('virtual')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${formatFilter === 'virtual' ? 'bg-matcha-50 border-matcha-200 text-matcha-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Video size={12} /> {t('virtual', language)}
                </button>
                <button 
                  onClick={() => setFormatFilter('in-person')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${formatFilter === 'in-person' ? 'bg-matcha-50 border-matcha-200 text-matcha-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <MapPin size={12} /> {t('inPerson', language)}
                </button>
              </div>
            </div>

            {/* Distance Slider (Only active if not specifically Virtual-only) */}
            {formatFilter !== 'virtual' && (
              <div className="flex items-center gap-4 flex-1 w-full md:w-auto pl-0 md:pl-4 md:border-l border-gray-100">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <SlidersHorizontal size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{t('distance', language)}</span>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <input 
                    type="range" 
                    min="1" 
                    max={maxDistance} 
                    value={distanceFilter} 
                    onChange={(e) => setDistanceFilter(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-matcha-600"
                  />
                  <button 
                    onClick={toggleUnit}
                    className="flex items-center justify-center gap-1 bg-matcha-50 px-2 py-1.5 rounded-lg border border-matcha-100 hover:bg-matcha-100 transition-colors min-w-[75px]"
                    title="Toggle Unit (Miles/KM)"
                  >
                    <span className="text-sm font-bold text-matcha-700">{distanceFilter}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{distanceUnit}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => {
          const { month, day } = getMonthDay(event.date);
          
          // Calculate display distance
          const displayDistance = event.distanceMiles 
            ? (distanceUnit === 'mi' ? event.distanceMiles : event.distanceMiles * 1.60934)
            : null;

          return (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all">
              {/* Image Header */}
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                   <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm uppercase tracking-wide">
                    {event.category}
                  </div>
                  {!event.isVirtual && displayDistance !== null && (
                    <div className="bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1">
                      <MapPin size={10} /> {displayDistance.toFixed(1)} {distanceUnit} away
                    </div>
                  )}
                </div>

                {event.registered && (
                  <div className="absolute top-3 right-3 bg-matcha-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                    {t('registered', language)}
                  </div>
                )}
                
                {/* Language Badge */}
                {event.language !== 'English' && (
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                    <Globe size={12} /> {event.language}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-3">
                  <div className="bg-gray-50 rounded-xl p-2 min-w-[60px] text-center border border-gray-100">
                    <span className="block text-xs font-bold text-red-500 uppercase">{month}</span>
                    <span className="block text-2xl font-bold text-gray-800">{day}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1">{event.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">By {event.host}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                <div className="mt-auto space-y-3">
                  <div className="flex flex-col gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      {event.isVirtual ? <Video size={14} /> : <MapPin size={14} />}
                      {event.isVirtual ? 'Virtual Event' : event.location}
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleRegister(event.id)}
                    className={`
                      w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                      ${event.registered 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                        : 'bg-matcha-600 text-white hover:bg-matcha-700 shadow-md shadow-matcha-100'}
                    `}
                  >
                    {event.registered ? t('cancelReg', language) : (
                      <>
                        {t('register', language)} <ExternalLink size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredEvents.length === 0 && (
        <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-gray-600">{t('noEvents', language)}</p>
          <button 
            onClick={() => {
                setCategoryFilter('all');
                setFormatFilter('all');
                setLanguageFilter('All');
                setDistanceUnit('mi');
                setDistanceFilter(200);
            }} 
            className="text-matcha-600 font-bold hover:underline"
          >
            {t('clearFilters', language)}
          </button>
        </div>
      )}
    </div>
  );
};

export default Events;
