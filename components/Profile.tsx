

import React, { useState } from 'react';
import { UserProfile, Friend, UserRole } from '../types';
import { generateAvatar } from '../services/geminiService';
import { 
  Sparkles, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  MapPin, 
  Calendar, 
  User, 
  Plus,
  X,
  MessageCircle,
  HeartHandshake
} from 'lucide-react';
import { t } from '../translations';

interface ProfileProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  friends: Friend[];
}

const Profile: React.FC<ProfileProps> = ({ userProfile, onUpdateProfile, friends }) => {
  const [isEditing, setIsEditing] = useState(false);
  const language = userProfile.language || 'English';
  
  // Form State
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [newInterest, setNewInterest] = useState('');
  
  // Avatar Gen State
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    const imageUrl = await generateAvatar(description);
    
    if (imageUrl) {
      setGeneratedImage(imageUrl);
      setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
    } else {
      setError(t('unableGenerateAvatar', language));
    }
    
    setIsGenerating(false);
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
    setGeneratedImage(null); // Clear temp state
    setDescription('');
  };

  const togglePrivacy = (field: keyof typeof formData.privacySettings) => {
    setFormData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [field]: !prev.privacySettings[field]
      }
    }));
  };

  const addInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      e.preventDefault();
      if (!formData.interests.includes(newInterest.trim())) {
        setFormData(prev => ({
          ...prev,
          interests: [...prev.interests, newInterest.trim()]
        }));
      }
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header / Top Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-matcha-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-matcha-200 to-matcha-100 z-0"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start pt-12">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
             <div className="relative group">
                <div className="w-40 h-40 rounded-full border-8 border-white shadow-xl overflow-hidden bg-white">
                  {generatedImage || formData.avatarUrl ? (
                    <img
                      src={generatedImage || formData.avatarUrl}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-matcha-50 text-4xl font-bold text-matcha-700">
                      {(formData.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 max-w-[250px]">
                    <p className="text-xs font-semibold text-gray-500 mb-2 px-1">{t('generateNewLook', language)}</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('avatarDescPlaceholder', language)}
                        className="text-xs border border-gray-200 rounded-lg p-2 w-32 focus:outline-none focus:ring-1 focus:ring-matcha-500"
                      />
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !description}
                        className="bg-matcha-500 text-white p-2 rounded-lg hover:bg-matcha-600 disabled:opacity-50"
                      >
                        {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      </button>
                    </div>
                  </div>
                )}
             </div>
             {error && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">{error}</span>}
          </div>

          {/* Basic Info */}
          <div className="flex-1 pt-4 space-y-4 w-full">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-matcha-200 focus:border-matcha-500 outline-none w-full"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">{formData.name || t('yourProfile', language)}</h1>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">@</span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="text-gray-500 font-medium bg-transparent border-b border-gray-200 focus:border-matcha-500 outline-none"
                    />
                  ) : (
                    <span className="text-gray-500 font-medium">{formData.username || t('addUsername', language)}</span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-6 py-2 rounded-xl font-bold transition-all shadow-sm ${
                  isEditing 
                  ? 'bg-matcha-600 text-white hover:bg-matcha-700' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isEditing ? t('saveProfile', language) : t('editProfile', language)}
              </button>
            </div>

            {/* Role & Condition Tag */}
            {isEditing && (
               <div className="flex items-center gap-2 mb-2">
                 <span className="text-sm font-semibold text-gray-600">{t('roleLabel', language)}:</span>
                 <select 
                   value={formData.role || 'Patient'}
                   onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                   className="bg-white border border-gray-200 rounded-lg text-sm p-1.5 focus:ring-matcha-500 outline-none"
                 >
                   <option value="Patient">{t('rolePatient', language)}</option>
                   <option value="Caregiver">{t('roleCaregiver', language)}</option>
                 </select>
               </div>
            )}

            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                formData.role === 'Caregiver' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                  : 'bg-gradient-to-r from-matcha-500 to-matcha-600 text-white'
            }`}>
              {formData.role === 'Caregiver' ? <HeartHandshake size={14} /> : <Sparkles size={14} />}
              {isEditing ? (
                 <div className="flex items-center gap-1">
                   {formData.role === 'Caregiver' && <span className="opacity-80 font-normal">{t('caringFor', language)}: </span>}
                   <input
                    type="text"
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="bg-transparent border-none outline-none text-white font-bold placeholder-white/70 w-40"
                    placeholder={t('conditionPlaceholder', language)}
                  />
                 </div>
              ) : (
                <span>
                   {formData.role === 'Caregiver' && <span className="font-normal opacity-90">{t('roleCaregiver', language)} • {t('caringFor', language)} </span>}
                   {formData.condition || t('addCondition', language)}
                </span>
              )}
            </div>

            {/* Bio */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-transparent border-none outline-none text-gray-600 resize-none h-20"
                  placeholder={t('bioPlaceholder', language)}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {formData.bio || t('noBioYet', language)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* About / Demographics */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">{t('aboutMe', language)}</h3>
          
          <div className="space-y-4">
            {/* Location */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={12}/> {t('location', language)}</span>
                {isEditing && (
                  <button onClick={() => togglePrivacy('showLocation')}>
                    {formData.privacySettings.showLocation ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                )}
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full p-2 bg-gray-50 rounded-lg text-sm border border-gray-100"
                />
              ) : (
                <p className={`text-sm font-medium ${!formData.privacySettings.showLocation ? 'text-gray-300 italic' : 'text-gray-700'}`}>
                  {formData.privacySettings.showLocation ? (formData.location || t('notAddedYet', language)) : t('hiddenLabel', language)}
                </p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-1">
               <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar size={12}/> {t('age', language)}</span>
                {isEditing && (
                  <button onClick={() => togglePrivacy('showAge')}>
                    {formData.privacySettings.showAge ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                )}
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.age} 
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full p-2 bg-gray-50 rounded-lg text-sm border border-gray-100"
                />
              ) : (
                <p className={`text-sm font-medium ${!formData.privacySettings.showAge ? 'text-gray-300 italic' : 'text-gray-700'}`}>
                  {formData.privacySettings.showAge ? (formData.age || t('notAddedYet', language)) : t('hiddenLabel', language)}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1">
               <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><User size={12}/> {t('gender', language)}</span>
                {isEditing && (
                  <button onClick={() => togglePrivacy('showGender')}>
                    {formData.privacySettings.showGender ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                )}
              </div>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full p-2 bg-gray-50 rounded-lg text-sm border border-gray-100 outline-none"
                >
                  <option value="">{t('selectGender', language)}</option>
                  <option value="Female">{t('genderFemale', language)}</option>
                  <option value="Male">{t('genderMale', language)}</option>
                  <option value="Non-binary">{t('genderNonBinary', language)}</option>
                  <option value="Other">{t('genderOther', language)}</option>
                  <option value="Prefer not to say">{t('genderPreferNotSay', language)}</option>
                </select>
              ) : (
                <p className={`text-sm font-medium ${!formData.privacySettings.showGender ? 'text-gray-300 italic' : 'text-gray-700'}`}>
                  {formData.privacySettings.showGender ? (formData.gender || t('notAddedYet', language)) : t('hiddenLabel', language)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interests & Friends */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Interests */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">{t('interests', language)}</h3>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {formData.interests.map((interest, idx) => (
                <span 
                  key={idx} 
                  className="bg-matcha-50 text-matcha-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {interest}
                  {isEditing && (
                    <button onClick={() => removeInterest(interest)} className="text-matcha-400 hover:text-matcha-700">
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
              {formData.interests.length === 0 && !isEditing && (
                <span className="text-gray-400 text-sm italic">{t('noInterestsYet', language)}</span>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={addInterest}
                  placeholder={t('addInterestPlaceholder', language)}
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-matcha-400 outline-none transition-all"
                />
                <button 
                  onClick={(e: any) => addInterest({ key: 'Enter', preventDefault: () => {} } as any)}
                  className="bg-matcha-100 text-matcha-600 p-3 rounded-xl hover:bg-matcha-200"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
            
            {isEditing && (
              <p className="text-xs text-gray-400 mt-2">
                {t('addOnlyVisible', language)}
              </p>
            )}
          </div>

          {/* Friends Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
               <h3 className="font-bold text-gray-900">{t('myFriends', language)}</h3>
               <span className="bg-matcha-50 text-matcha-700 text-xs font-bold px-2 py-0.5 rounded-full">{friends.length}</span>
             </div>
             
             {friends.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {friends.map(friend => (
                   <div key={friend.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 hover:border-gray-100 transition-all cursor-pointer">
                     <div className="relative">
                        <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full bg-gray-100" />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : friend.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                     </div>
                     <div className="overflow-hidden">
                       <p className="text-sm font-semibold text-gray-800 truncate">{friend.name}</p>
                       <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                         {friend.language}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-6 text-gray-400">
                 <p className="text-sm font-medium text-gray-600">{t('noEntriesYet', language)}</p>
                 <p className="mt-1 text-sm">{t('friendsWillAppear', language)}</p>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
