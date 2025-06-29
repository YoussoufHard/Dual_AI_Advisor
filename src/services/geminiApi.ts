import { UserProfile, GeminiResponse } from '../types';
import { Language } from '../contexts/LanguageContext';

const GEMINI_API_KEY = "AIzaSyAtLKzD_wSVGBK8yF5OaWXWTO3M-LMxftg";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function extractJsonFromMarkdown(text: string): string {
  // Check if the text contains JSON wrapped in markdown code blocks
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  
  // Check for generic code blocks that might contain JSON
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    const content = codeBlockMatch[1].trim();
    // Try to detect if it's JSON by checking if it starts with { or [
    if (content.startsWith('{') || content.startsWith('[')) {
      return content;
    }
  }
  
  // If no code blocks found, return the original text (might already be clean JSON)
  return text.trim();
}

export async function callGeminiApi(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

// Fonction améliorée pour le streaming avec effet d'écriture fluide
export async function callGeminiApiStreaming(
  prompt: string, 
  onChunk: (chunk: string) => void
): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const fullText = data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
    
    // Simuler le streaming caractère par caractère pour un effet plus fluide
    let currentText = '';
    
    for (let i = 0; i < fullText.length; i++) {
      currentText += fullText[i];
      onChunk(currentText);
      
      // Délai variable pour un effet plus naturel
      const char = fullText[i];
      let delay = 20; // Délai de base
      
      // Pauses plus longues après la ponctuation
      if (char === '.' || char === '!' || char === '?') {
        delay = 200;
      } else if (char === ',' || char === ';') {
        delay = 100;
      } else if (char === ' ') {
        delay = 30;
      } else if (char === '\n') {
        delay = 150;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 20));
    }
    
    return fullText;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

export async function generateCareerRecommendation(profile: UserProfile, language: Language = 'fr'): Promise<string> {
  const isEnglish = language === 'en';
  
  const prompt = `
    As an expert career advisor, analyze this user profile and provide personalized career guidance in ${isEnglish ? 'English' : 'French'}:

    Name: ${profile.name}
    Skills: ${profile.skills.join(', ')}
    Interests: ${profile.interests.join(', ')}
    Experience Level: ${profile.experienceLevel}
    Years of Experience: ${profile.yearsExperience}
    Current Role: ${profile.currentRole || 'Not specified'}
    Preferred Industry: ${profile.industry}
    Goals: ${profile.goals}

    Please provide a structured response in JSON format with the following fields:
    {
      "jobTitle": "${isEnglish ? 'Recommended job title' : 'Titre de poste recommandé'}",
      "industry": "${isEnglish ? 'Best industry match' : 'Meilleur secteur correspondant'}",
      "explanation": "${isEnglish ? 'Detailed explanation of why this career fits their profile' : 'Explication détaillée de pourquoi cette carrière correspond à leur profil'}",
      "keySkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "actionPlan": {
        "month1": ["action1", "action2", "action3"],
        "month2": ["action1", "action2", "action3"],
        "month3": ["action1", "action2", "action3"]
      }
    }

    ${isEnglish ? 
      'Keep explanations motivational and actionable. Focus on their strengths and growth potential.' :
      'Gardez les explications motivantes et concrètes. Concentrez-vous sur leurs forces et leur potentiel de croissance.'
    }
    
    Respond entirely in ${isEnglish ? 'English' : 'French'}.
    Return ONLY the JSON object, no additional text or markdown formatting.
  `;

  const response = await callGeminiApi(prompt);
  return extractJsonFromMarkdown(response);
}

export async function generateStartupRecommendation(profile: UserProfile, language: Language = 'fr'): Promise<string> {
  const isEnglish = language === 'en';
  
  const prompt = `
    As an expert startup advisor, analyze this user profile and suggest a tailored startup idea in ${isEnglish ? 'English' : 'French'}:

    Name: ${profile.name}
    Skills: ${profile.skills.join(', ')}
    Interests: ${profile.interests.join(', ')}
    Experience Level: ${profile.experienceLevel}
    Years of Experience: ${profile.yearsExperience}
    Preferred Industry: ${profile.industry}

    Please provide a structured response in JSON format with the following fields:
    {
      "idea": "${isEnglish ? 'Startup idea description' : 'Description de l\'idée de startup'}",
      "elevatorPitch": "${isEnglish ? 'One compelling sentence pitch' : 'Un pitch d\'une phrase convaincante'}",
      "mvpFeatures": ["feature1", "feature2", "feature3", "feature4", "feature5"],
      "businessModel": "${isEnglish ? 'Recommended business model explanation' : 'Explication du modèle économique recommandé'}",
      "goToMarket": ["strategy1", "strategy2", "strategy3", "strategy4"]
    }

    ${isEnglish ? 
      'Focus on realistic, actionable startup ideas that leverage their existing skills and interests. Make the elevator pitch compelling and concise.' :
      'Concentrez-vous sur des idées de startup réalistes et concrètes qui tirent parti de leurs compétences et intérêts existants. Rendez le pitch d\'ascenseur convaincant et concis.'
    }
    
    Respond entirely in ${isEnglish ? 'English' : 'French'}.
    Return ONLY the JSON object, no additional text or markdown formatting.
  `;

  const response = await callGeminiApi(prompt);
  return extractJsonFromMarkdown(response);
}

export async function generateFollowUpResponseStreaming(
  question: string, 
  context: string, 
  mode: 'career' | 'startup',
  language: Language = 'fr',
  onChunk: (chunk: string) => void
): Promise<string> {
  const isEnglish = language === 'en';
  
  const prompt = `
    As an expert ${mode} advisor, answer this follow-up question based on the previous context in ${isEnglish ? 'English' : 'French'}:

    Previous Context: ${context}
    User Question: ${question}

    ${isEnglish ? 
      'Provide a helpful, motivational, and actionable response. Keep it conversational and encouraging. If the question is about implementation steps, provide specific, practical advice. If it\'s about concerns or doubts, address them positively while being realistic.' :
      'Fournissez une réponse utile, motivante et concrète. Gardez un ton conversationnel et encourageant. Si la question porte sur les étapes de mise en œuvre, donnez des conseils spécifiques et pratiques. Si elle concerne des préoccupations ou des doutes, abordez-les positivement tout en restant réaliste.'
    }
    
    Format your response in plain text with proper markdown formatting for readability:
    - Use **bold** for emphasis
    - Use bullet points with - for lists
    - Use numbered lists when showing steps
    - Use line breaks for better readability
    
    Respond entirely in ${isEnglish ? 'English' : 'French'}.
  `;

  return await callGeminiApiStreaming(prompt, onChunk);
}