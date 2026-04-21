
import React from 'react';
import { ExpertProfile } from '../types';
import { Star, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { t } from '../translations';

interface ExpertsProps {
    language: string;
}

const MOCK_EXPERTS: ExpertProfile[] = [
  {
    id: '1',
    name: 'Dr. Emily Chen',
    specialty: 'Rheumatologist • Sjögren’s Specialist',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/200/200?random=1',
    available: true
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    specialty: 'Autoimmune Nutritionist',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/200/200?random=2',
    available: true
  },
  {
    id: '3',
    name: 'Sarah Miller, PhD',
    specialty: 'Clinical Psychologist',
    rating: 5.0,
    imageUrl: 'https://picsum.photos/200/200?random=3',
    available: false
  },
  {
    id: '4',
    name: 'Dr. Ayesha Patel',
    specialty: 'Ophthalmologist (Dry Eye Expert)',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/200/200?random=4',
    available: true
  }
];

const Experts: React.FC<ExpertsProps> = ({ language }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{t('expertTitle', language)}</h1>
        <p className="text-gray-500">{t('expertSubtitle', language)}</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {MOCK_EXPERTS.map((expert) => (
          <div key={expert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex gap-4 transition-all hover:shadow-md">
            <img 
              src={expert.imageUrl} 
              alt={expert.name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-matcha-50"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{expert.name}</h3>
                  <p className="text-sm text-matcha-600 font-medium mb-1">{expert.specialty}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded text-amber-700 text-xs font-bold">
                  <Star size={12} fill="currentColor" /> {expert.rating}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <MapPin size={12} />
                <span>Virtual & In-Person (NY)</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-matcha-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-matcha-700 transition-colors flex items-center justify-center gap-1">
                  <Calendar size={14} /> {t('book', language)}
                </button>
                <button className="flex-1 bg-gray-50 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  {t('profile', language)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-matcha-900 text-white rounded-2xl p-8 mt-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Are you a healthcare professional?</h2>
          <p className="text-matcha-200 mb-4 max-w-md">Join HealUp's network to access real-world patient data (with consent) and provide better care.</p>
          <button className="flex items-center gap-2 bg-white text-matcha-900 px-4 py-2 rounded-lg font-bold hover:bg-matcha-50 transition-colors">
            Partner with us <ArrowRight size={16} />
          </button>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-matcha-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
      </div>
    </div>
  );
};

export default Experts;
