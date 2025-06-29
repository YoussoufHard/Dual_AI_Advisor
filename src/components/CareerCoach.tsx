import React, { useState } from 'react';
import { CareerRecommendation, UserProfile } from '../types';
import { generateCareerRecommendation, generateFollowUpResponseStreaming } from '../services/geminiApi';
import { Briefcase, Target, Calendar, MessageCircle, Send, Loader } from 'lucide-react';
import StreamingMessage from './StreamingMessage';

interface CareerCoachProps {
  profile: UserProfile;
}

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

export default function CareerCoach({ profile }: CareerCoachProps) {
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const generateRecommendation = async () => {
    setLoading(true);
    try {
      const response = await generateCareerRecommendation(profile);
      // Parse the JSON response
      const parsed = JSON.parse(response);
      setRecommendation(parsed);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      // Fallback recommendation
      setRecommendation({
        jobTitle: 'Full Stack Developer',
        industry: 'Technology',
        explanation: `Based on your skills in ${profile.skills.slice(0, 3).join(', ')} and interests in ${profile.interests.slice(0, 2).join(', ')}, a career as a Full Stack Developer would be an excellent fit. This role combines technical skills with creative problem-solving.`,
        keySkills: ['React', 'Node.js', 'Database Design', 'API Development', 'Problem Solving'],
        actionPlan: {
          month1: ['Build a portfolio website', 'Complete React fundamentals course', 'Start daily coding practice'],
          month2: ['Learn backend development', 'Build 2-3 full-stack projects', 'Join developer communities'],
          month3: ['Apply to 10+ positions', 'Prepare for technical interviews', 'Network with industry professionals']
        }
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
      const context = recommendation ? `Career recommendation: ${JSON.stringify(recommendation)}` : 'No specific recommendation yet';
      
      let fullResponse = '';
      await generateFollowUpResponseStreaming(
        userMessage, 
        context, 
        'career',
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
          content: 'I apologize, but I encountered an error. Please try asking your question again.',
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
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Career Coach</h2>
        <p className="text-gray-600">Get personalized career guidance based on your profile</p>
      </div>

      {/* Generate Recommendation */}
      {!recommendation && (
        <div className="text-center">
          <button
            onClick={generateRecommendation}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Generating Your Career Plan...
              </>
            ) : (
              <>
                <Target className="w-5 h-5 mr-2" />
                Get My Career Recommendation
              </>
            )}
          </button>
        </div>
      )}

      {/* Recommendation Display */}
      {recommendation && (
        <div className="space-y-6">
          {/* Career Match */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">
              {recommendation.jobTitle}
            </h3>
            <p className="text-blue-600 font-medium mb-4">in {recommendation.industry}</p>
            <p className="text-gray-700 leading-relaxed">{recommendation.explanation}</p>
          </div>

          {/* Key Skills */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2 text-indigo-600" />
              Key Skills to Develop
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {recommendation.keySkills.map((skill, index) => (
                <div key={index} className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-medium text-center">
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-green-600" />
              3-Month Action Plan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(recommendation.actionPlan).map(([month, actions], index) => (
                <div key={month} className="space-y-3">
                  <h5 className="font-bold text-lg text-gray-800 capitalize">
                    Month {index + 1}
                  </h5>
                  <ul className="space-y-2">
                    {actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
              <h4 className="text-lg font-semibold flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Ask Your Career Coach
              </h4>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  Ask me anything about your career path, skill development, or job search strategies!
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
                    <span className="text-sm">Thinking...</span>
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
                  placeholder="Ask about career development, skills, or job search..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
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