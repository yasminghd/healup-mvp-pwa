


import React, { useState } from 'react';
import { UserProfile, Group, Friend } from '../types';
import { 
  Search, 
  MapPin, 
  UserPlus, 
  Tent, 
  Users, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import { t } from '../translations';

interface DiscoverProps {
  userProfile: UserProfile;
}

const PEOPLE: Friend[] = [];
const DISCOVER_GROUPS: Group[] = [];

const Discover: React.FC<DiscoverProps> = ({ userProfile }) => {
  const language = userProfile.language || 'English';
  const [activeTab, setActiveTab] = useState<'people' | 'groups'>('people');
  
  // Filters State
  const [filterCondition, setFilterCondition] = useState(true);
  const [filterAge, setFilterAge] = useState(false);
  const [filterGender, setFilterGender] = useState(false);
  const [filterLocation, setFilterLocation] = useState(false);
  const [filterRole, setFilterRole] = useState(false);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const handleConnect = (id: string) => {
    setConnectedIds(prev => new Set(prev).add(id));
  };

  const filteredPeople = PEOPLE.filter(person => {
    let match = true;

    // 1. Same Condition
    if (filterCondition && userProfile.condition) {
       
       const pCondition = person.condition || '';
       if (!pCondition.includes(userProfile.condition.split(' ')[0])) {
         
         const pLower = pCondition.toLowerCase();
         const uLower = userProfile.condition.toLowerCase();
         if (!pLower.includes('sjögren') || !uLower.includes('sjögren')) {
             // If strict matching required, match = false. 
             // But let's allow "Sjögren's Warrior" to match "RA & Sjögren's"
             if (!pLower.includes(uLower.split(' ')[0]) && !uLower.includes(pLower.split(' ')[0])) {
                 match = false;
             }
         }
       }
    }

    // 2. Similar Age (+/- 5 years)
    if (filterAge && userProfile.age) {
      const userAge = parseInt(userProfile.age);
      const personAge = person.age ? parseInt(person.age) : 0;
      if (!person.age || personAge < userAge - 5 || personAge > userAge + 5) {
        match = false;
      }
    }

    // 3. Same Gender
    if (filterGender && userProfile.gender) {
      if (!person.gender || person.gender !== userProfile.gender) {
        match = false;
      }
    }

    // 4. Location (City match)
    if (filterLocation && userProfile.location) {
        // Simple string includes
        const pLoc = person.location || '';
        const uLoc = userProfile.location;
        if (!pLoc || (!uLoc.includes(pLoc) && !pLoc.includes(uLoc))) {
            match = false;
        }
    }

    // 5. Role Match
    if (filterRole) {
      if (person.role !== userProfile.role) {
        match = false;
      }
    }

    return match;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{t('discoverTitle', language)}</h1>
        <p className="text-gray-500">{t('discoverSubtitle', language)}</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
        <button
          onClick={() => setActiveTab('people')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'people' 
              ? 'bg-matcha-100 text-matcha-800 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <UserPlus size={18} />
          {t('findPeople', language)}
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'groups' 
              ? 'bg-matcha-100 text-matcha-800 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Tent size={18} />
          {t('findGroups', language)}
        </button>
      </div>

      {activeTab === 'people' && (
        <div className="grid lg:grid-cols-4 gap-6 items-start">
          
          {/* Filters Sidebar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold border-b border-gray-100 pb-2">
              <Filter size={18} /> {t('matchProfile', language)}
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-gray-600 group-hover:text-matcha-700">{t('sameCondition', language)}</span>
                <input 
                  type="checkbox" 
                  checked={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-matcha-600 focus:ring-matcha-500" 
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-gray-600 group-hover:text-matcha-700">{t('similarAge', language)}</span>
                <input 
                  type="checkbox" 
                  checked={filterAge}
                  onChange={(e) => setFilterAge(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-matcha-600 focus:ring-matcha-500" 
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-gray-600 group-hover:text-matcha-700">{t('sameGender', language)}</span>
                <input 
                  type="checkbox" 
                  checked={filterGender}
                  onChange={(e) => setFilterGender(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-matcha-600 focus:ring-matcha-500" 
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-gray-600 group-hover:text-matcha-700">{t('nearby', language)}</span>
                <input 
                  type="checkbox" 
                  checked={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-matcha-600 focus:ring-matcha-500" 
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-gray-600 group-hover:text-matcha-700">{t('sameRole', language)}</span>
                <input 
                  type="checkbox" 
                  checked={filterRole}
                  onChange={(e) => setFilterRole(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-matcha-600 focus:ring-matcha-500" 
                />
              </label>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
               {filteredPeople.length} {t('potentialMatchesFound', language)}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
             {filteredPeople.map(person => {
               const isConnected = connectedIds.has(person.id);
               return (
                 <div key={person.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex gap-3">
                          <img src={person.avatarUrl} alt={person.name} className="w-12 h-12 rounded-full bg-gray-50" />
                          <div>
                             <h3 className="font-bold text-gray-900 flex items-center gap-1">
                               {person.name}
                               {person.role === 'Caregiver' && <span title="Caregiver"><HeartHandshake size={14} className="text-lavender-500" /></span>}
                             </h3>
                             <p className="text-xs text-matcha-600 font-semibold">{person.condition}</p>
                             <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                <MapPin size={10} /> {person.location || 'Unknown'}
                             </div>
                          </div>
                       </div>
                       <div className="flex flex-col items-end">
                          <div className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                             <Sparkles size={10} /> {person.matchScore || 0}%
                          </div>
                       </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{person.bio}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                       {(person.interests || []).map((i: string) => (
                         <span key={i} className="bg-gray-50 text-gray-500 px-2 py-1 rounded text-xs">{i}</span>
                       ))}
                    </div>

                    <button 
                      onClick={() => handleConnect(person.id)}
                      disabled={isConnected}
                      className={`
                        w-full mt-auto py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                        ${isConnected 
                          ? 'bg-gray-100 text-gray-500 cursor-default' 
                          : 'bg-matcha-600 text-white hover:bg-matcha-700 shadow-md shadow-matcha-100'}
                      `}
                    >
                      {isConnected ? (
                        <>{t('pending', language)} <CheckCircle2 size={16}/></>
                      ) : (
                        <>{t('connect', language)} <UserPlus size={16}/></>
                      )}
                    </button>
                 </div>
               );
             })}
             {filteredPeople.length === 0 && (
               <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <Search size={48} className="mx-auto mb-2 opacity-20" />
                  <p className="font-medium text-gray-600">{t('noEntriesYet', language)}</p>
                  <p className="mt-1 text-sm">{t('peopleWillAppear', language)}</p>
               </div>
             )}
          </div>

        </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-2">
           {DISCOVER_GROUPS.map(group => (
              <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div className="h-32 bg-gray-100 relative">
                      <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Users size={12} /> {group.memberCount}
                      </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2">{group.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{group.description}</p>
                    <button className="w-full bg-white border-2 border-matcha-100 text-matcha-700 font-bold py-2 rounded-xl hover:bg-matcha-50 transition-colors flex items-center justify-center gap-1">
                      {t('join', language)} <ArrowRight size={16} />
                    </button>
                  </div>
              </div>
           ))}
           {DISCOVER_GROUPS.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <Tent size={48} className="mx-auto mb-2 opacity-20" />
                <p className="font-medium text-gray-600">{t('noEntriesYet', language)}</p>
                <p className="mt-1 text-sm">{t('groupsWillAppear', language)}</p>
              </div>
           )}
        </div>
      )}

    </div>
  );
};

export default Discover;
