
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { sendMessageStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from '@google/genai';
import { t } from '../translations';

interface AiAssistantProps {
  language: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ language }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello, I'm your HealUp Assistant. I can help you understand your symptoms, suggest lifestyle adjustments for Sjögren’s, or just listen if you're having a tough day. How are you feeling?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass language to service to instruct Gemini to reply in that language
      const stream = await sendMessageStream(userMsg.text, language);
      
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: modelMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      let fullText = '';
      for await (const chunk of stream) {
        const content = chunk as GenerateContentResponse;
        const textChunk = content.text;
        if (textChunk) {
          fullText += textChunk;
          setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, text: fullText } : msg
          ));
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting to the service right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-matcha-50 flex items-center gap-3">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <Sparkles size={20} className="text-matcha-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{t('assistant', language)}</h3>
          <p className="text-xs text-matcha-600">{t('assistantSubtitle', language)}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-matcha-600 text-white'}
            `}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`
              max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-gray-800 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}
            `}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>{line || ' '}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1].role === 'user' && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-matcha-600 text-white flex items-center justify-center">
               <Bot size={16} />
             </div>
             <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
               <Loader2 className="animate-spin text-matcha-600" size={16} />
               <span className="text-xs text-gray-500">Thinking...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-end relative">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('typeMessage', language)}
            className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-matcha-500 focus:border-transparent outline-none scrollbar-hide"
            rows={1}
            style={{ minHeight: '50px', maxHeight: '120px' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-matcha-600 text-white rounded-xl hover:bg-matcha-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-matcha-100"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">
          {t('aiDisclaimer', language)}
        </p>
      </div>
    </div>
  );
};

export default AiAssistant;
