
import React from 'react';
import { Group } from '../types';
import { Users, Plus, Shield, ChevronRight } from 'lucide-react';
import { t } from '../translations';

interface GroupsProps {
  language: string;
}

const GROUPS: Group[] = [];

const Groups: React.FC<GroupsProps> = ({ language }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('groupsTitle', language)}</h1>
          <p className="text-gray-500">{t('groupsSubtitle', language)}</p>
        </div>
        <button className="flex items-center gap-2 bg-matcha-600 hover:bg-matcha-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm font-medium">
          <Plus size={18} /> {t('createGroup', language)}
        </button>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GROUPS.map((group) => (
          <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="h-32 bg-gray-100 relative">
               <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
               <div className="absolute top-3 right-3">
                 {group.role === 'Admin' ? (
                   <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                     <Shield size={10} fill="currentColor" /> {t('admin', language)}
                   </span>
                 ) : (
                   <span className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
                     {t('members', language)}
                   </span>
                 )}
               </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-matcha-700 transition-colors">{group.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{group.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Users size={14} className="text-gray-400" />
                  {group.memberCount} {t('members', language)}
                </div>
                <button className="text-matcha-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  {t('enterGroup', language)} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {GROUPS.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-gray-500">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-700">No entries yet.</p>
            <p className="mt-1 text-sm">Groups will appear here once live community data is received.</p>
          </div>
        )}

        <button className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-matcha-400 hover:bg-matcha-50/30 transition-all group">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-matcha-100 transition-colors">
             <Plus size={32} className="text-gray-400 group-hover:text-matcha-600" />
           </div>
           <div>
             <h3 className="font-bold text-gray-800">{t('createGroup', language)}</h3>
             <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Start a new community for a specific topic or region.</p>
           </div>
        </button>
      </div>
    </div>
  );
};

export default Groups;

