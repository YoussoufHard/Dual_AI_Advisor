import React, { useState } from 'react';
import { StartupRecommendation, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { generateStartupRecommendation, generateFollowUpResponseStreaming } from '../services/geminiApi';
import { Lightbulb, Rocket, DollarSign, TrendingUp, MessageCircle, Send, Loader } from 'lucide-react';
import StreamingMessage from './StreamingMessage';

interface StartupCoachProps {
  profile: UserProfile;
}

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

export default function StartupCoach({ profile }: StartupCoachProps) {
  const { t, language } = useLanguage();
  const [recommendation, setRecommendation] = useState<StartupRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const generateRecommendation = async () => {
    setLoading(true);
    try {
      const response = await generateStartupRecommendation(profile, language);
      // Parse the JSON response
      const parsed = JSON.parse(response);
      setRecommendation(parsed);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      // Fallback recommendation
      setRecommendation({
        idea: `A platform that combines ${profile.interests[0]} with ${profile.skills[0]} to solve real-world problems in the ${profile.industry} industry.`,
        elevatorPitch: `We're revolutionizing ${profile.industry} by leveraging ${profile.skills[0]} to make ${profile.interests[0]} more accessible and efficient.`,
        mvpFeatures: ['User registration and profiles', 'Core functionality dashboard', 'Basic analytics', 'Payment integration', 'Mobile responsive design'],
        businessModel: 'Freemium model with subscription tiers - offer basic features for free and charge for premium features, advanced analytics, and enterprise solutions.',
        goToMarket: ['Build a landing page and collect email signups', 'Create content around your niche', 'Launch on Product Hunt', 'Partner with industry influencers']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setChatInput('');
    setChatLoading(true);

    // Ajouter un message AI vide qui va être rempli progressivement
    const aiMessageIndex = chatMessages.length + 1;
    setChatMessages(prev => [...prev, { type: 'ai', content: '', isStreaming: true }]);

    try {
      const context = recommendation ? `Startup recommendation: ${JSON.stringify(recommendation)}` : 'No specific recommendation yet';
      
      let fullResponse = '';
      await generateFollowUpResponseStreaming(
        userMessage, 
        context, 
        'startup',
        language,
        (chunk: string) => {
          fullResponse = chunk;
          setChatMessages(prev => {
            const newMessages = [...prev];
            newMessages[aiMessageIndex] = { 
              type: 'ai', 
              content: chunk, 
              isStreaming: true 
            };
            return newMessages;
          });
        }
      );

      // Marquer le message comme terminé
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages[aiMessageIndex] = { 
          type: 'ai', 
          content: fullResponse, 
          isStreaming: false 
        };
        return newMessages;
      });

    } catch (error) {
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages[aiMessageIndex] = { 
          type: 'ai', 
          content: t('common.error'),
          isStreaming: false
        };
        return newMessages;
      });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('startup.title')}</h2>
        <p className="text-gray-600">{t('startup.subtitle')}</p>
      </div>

      {/* Generate Recommendation */}
      {!recommendation && (
        <div className="text-center">
          <button
            onClick={generateRecommendation}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                {t('startup.generating')}
              </>
            ) : (
              <>
                <Lightbulb className="w-5 h-5 mr-2" />
                {t('startup.generate')}
              </>
            )}
          </button>
        </div>
      )}

      {/* Recommendation Display */}
      {recommendation && (
        <div className="space-y-6">
          {/* Startup Idea */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-200">
            <h3 className="text-2xl font-bold text-orange-800 mb-4 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2" />
              {t('startup.idea')}
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">{recommendation.idea}</p>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">{t('startup.elevatorPitch')}</h4>
              <p className="text-gray-700 italic">"{recommendation.elevatorPitch}"</p>
            </div>
          </div>

          {/* MVP Features */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Rocket className="w-6 h-6 mr-2 text-purple-600" />
              {t('startup.mvpFeatures')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendation.mvpFeatures.map((feature, index) => (
                <div key={index} className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Business Model */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-green-600" />
              {t('startup.businessModel')}
            </h4>
            <p className="text-gray-700 leading-relaxed">{recommendation.businessModel}</p>
          </div>

          {/* Go-to-Market Strategy */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              {t('startup.goToMarket')}
            </h4>
            <div className="space-y-3">
              {recommendation.goToMarket.map((strategy, index) => (
                <div key={index} className="flex items-start">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-1">{strategy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white p-4">
              <h4 className="text-lg font-semibold flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                {t('startup.chat.title')}
              </h4>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  {t('startup.chat.empty')}
                </div>
              )}
              
              {chatMessages.map((message, index) => (
                <StreamingMessage
                  key={index}
                  content={message.content}
                  isStreaming={message.isStreaming || false}
                  type={message.type}
                />
              ))}
              
              {chatLoading && chatMessages[chatMessages.length - 1]?.type !== 'ai' && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">{t('common.thinking')}</span>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleChatSubmit} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t('startup.chat.placeholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  title={t('common.send')}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}