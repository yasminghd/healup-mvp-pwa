
import React, { useState, useRef, useEffect } from 'react';
import { Friend, ChatMessage, UserProfile } from '../types';
import { Send, Search, Globe, MoreVertical, Phone, Video, Mic, Languages, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import { translateText } from '../services/geminiService';
import { t } from '../translations';

interface CommunityProps {
  userProfile: UserProfile;
  friends: Friend[];
}

// Initial messages
const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'f1': [
    { id: '1', senderId: 'f1', text: '¡Hola! ¿Cómo te sientes hoy?', translatedText: 'Hello! How are you feeling today?', timestamp: new Date(Date.now() - 3600000), role: 'model', originalLanguage: 'Spanish' },
  ]
};

const Community: React.FC<CommunityProps> = ({ userProfile, friends }) => {
  const language = userProfile.language || 'English';
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(friends[0]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Split friends into Active Chats and Others
  const activeChatFriends = friends.filter(f => chats[f.id] && chats[f.id].length > 0);
  const otherFriends = friends.filter(f => !chats[f.id] || chats[f.id].length === 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedFriend, chats, isTranslating]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedFriend) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: input,
      timestamp: new Date(),
      role: 'user',
      originalLanguage: userProfile.language || 'English'
    };

    // 1. Add User Message
    setChats(prev => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newMessage]
    }));
    setInput('');

    // 2. Simulate Reply from Friend (Mocking functionality)
    setTimeout(async () => {
      setIsTranslating(true);
      
      // Simulating a reply in the friend's native language
      let friendReplyText = "";
      if (selectedFriend.language === 'Spanish') friendReplyText = "¡Eso suena genial! Me alegro mucho por ti. ¿Has probado los nuevos ejercicios?";
      else if (selectedFriend.language === 'Japanese') friendReplyText = "それは素晴らしいですね！私も試してみます。";
      else if (selectedFriend.language === 'French') friendReplyText = "C'est merveilleux ! Je suis content pour toi.";
      else if (selectedFriend.language === 'German') friendReplyText = "Das ist großartig! Ich freue mich für dich.";
      else friendReplyText = "That sounds great! I'm happy for you.";

      // 3. Translate Friend's Reply to User's Language
      let translated = "";
      if (selectedFriend.language !== (userProfile.language || 'English')) {
         translated = await translateText(friendReplyText, userProfile.language || 'English');
      }

      const replyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: selectedFriend.id,
        text: friendReplyText,
        translatedText: translated,
        timestamp: new Date(),
        role: 'model',
        originalLanguage: selectedFriend.language
      };

      setChats(prev => ({
        ...prev,
        [selectedFriend.id]: [...(prev[selectedFriend.id] || []), replyMessage]
      }));
      setIsTranslating(false);

    }, 1500); // Delay to simulate typing
  };

  const currentMessages = selectedFriend ? (chats[selectedFriend.id] || []) : [];

  const FriendListItem = ({ friend, label }: { friend: Friend, label?: string }) => (
    <button
      onClick={() => setSelectedFriend(friend)}
      className={`
        w-full p-3 rounded-xl flex items-center gap-3 transition-all
        ${selectedFriend?.id === friend.id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-gray-100/50'}
      `}
    >
      <div className="relative">
        <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full bg-gray-200" />
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : friend.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
      </div>
      <div className="flex-1 text-left overflow-hidden">
        <div className="flex justify-between items-center mb-0.5">
          <span className="font-semibold text-sm text-gray-900 truncate">{friend.name}</span>
          {label && <span className="text-[10px] text-gray-400">{label}</span>}
        </div>
        <div className="flex items-center gap-1">
          <Languages size={10} className="text-matcha-600 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{friend.language}</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
      
      {/* Sidebar - Friends List */}
      <div className="w-full md:w-80 bg-gray-50 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('community', language)}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={t('searchFriends', language)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Active Chats Section */}
          {activeChatFriends.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1">
                <MessageCircle size={12}/> {t('recentChats', language)}
              </h3>
              <div className="space-y-1">
                {activeChatFriends.map(friend => (
                  <FriendListItem key={friend.id} friend={friend} label="12m" />
                ))}
              </div>
            </div>
          )}

          {/* All Friends Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1">
              <Sparkles size={12}/> {t('allFriends', language)}
            </h3>
            <div className="space-y-1">
              {otherFriends.map(friend => (
                <FriendListItem key={friend.id} friend={friend} />
              ))}
              {otherFriends.length === 0 && activeChatFriends.length === 0 && (
                <p className="text-sm text-gray-500 px-3">{t('noFriends', language)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      {selectedFriend ? (
        <div className="flex-1 flex flex-col bg-white">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
            <div className="flex items-center gap-3">
              <img src={selectedFriend.avatarUrl} alt={selectedFriend.name} className="w-10 h-10 rounded-full bg-gray-100" />
              <div>
                <h3 className="font-bold text-gray-900">{selectedFriend.name}</h3>
                <p className="text-xs text-matcha-600 flex items-center gap-1">
                   {selectedFriend.language} Speaker 
                   {selectedFriend.language !== userProfile.language && <span className="bg-matcha-100 px-1.5 py-0.5 rounded text-[10px] font-bold">Translation On</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
               <button className="hover:text-matcha-600"><Phone size={20} /></button>
               <button className="hover:text-matcha-600"><Video size={20} /></button>
               <button className="hover:text-matcha-600"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-matcha-50/30">
            {currentMessages.map((msg) => {
              const isMe = msg.senderId === 'me';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    <div className={`
                      p-4 rounded-2xl shadow-sm text-sm relative
                      ${isMe 
                        ? 'bg-matcha-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}
                    `}>
                      <p>{msg.text}</p>
                      
                      {/* Translation Block */}
                      {msg.translatedText && !isMe && (
                        <div className="mt-2 pt-2 border-t border-gray-100/50">
                           <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                             <Sparkles size={10} className="text-matcha-500" /> Translated to {userProfile.language}
                           </p>
                           <p className="text-matcha-800 font-medium">{msg.translatedText}</p>
                        </div>
                      )}
                    </div>
                    
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {!isMe && msg.originalLanguage && ` • ${msg.originalLanguage}`}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {isTranslating && (
              <div className="flex justify-start">
                 <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                   <Loader2 size={14} className="animate-spin text-matcha-600" />
                   <span className="text-xs text-gray-500">Translating incoming message...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-matcha-500 focus-within:border-transparent transition-all shadow-sm">
               <button className="text-gray-400 hover:text-matcha-600"><Mic size={20}/></button>
               <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                 placeholder={t('typeMessage', language)}
                 className="flex-1 bg-transparent border-none focus:ring-0 outline-none py-2 text-sm text-gray-800"
               />
               <button 
                 onClick={handleSendMessage}
                 disabled={!input.trim()}
                 className="text-matcha-600 hover:text-matcha-700 disabled:opacity-50"
               >
                 <Send size={20} />
               </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
               <Globe size={10} /> Auto-translation active
            </p>
          </div>
          
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
             <Languages size={32} className="text-matcha-300" />
          </div>
          <p className="font-medium">{t('selectFriend', language)}</p>
        </div>
      )}

    </div>
  );
};

export default Community;
