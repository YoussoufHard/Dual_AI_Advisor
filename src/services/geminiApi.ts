import { UserProfile, GeminiResponse } from '../types';

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

// Nouvelle fonction pour le streaming des réponses de chat
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
    
    // Simuler le streaming en envoyant le texte par chunks
    const words = fullText.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      onChunk(currentText);
      
      // Délai entre les mots pour simuler la frappe
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }
    
    return fullText;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

export async function generateCareerRecommendation(profile: UserProfile): Promise<string> {
  const prompt = `
    As an expert career advisor, analyze this user profile and provide personalized career guidance:

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
      "jobTitle": "Recommended job title",
      "industry": "Best industry match",
      "explanation": "Detailed explanation of why this career fits their profile",
      "keySkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "actionPlan": {
        "month1": ["action1", "action2", "action3"],
        "month2": ["action1", "action2", "action3"],
        "month3": ["action1", "action2", "action3"]
      }
    }

    Keep explanations motivational and actionable. Focus on their strengths and growth potential.
    Return ONLY the JSON object, no additional text or markdown formatting.
  `;

  const response = await callGeminiApi(prompt);
  return extractJsonFromMarkdown(response);
}

export async function generateStartupRecommendation(profile: UserProfile): Promise<string> {
  const prompt = `
    As an expert startup advisor, analyze this user profile and suggest a tailored startup idea:

    Name: ${profile.name}
    Skills: ${profile.skills.join(', ')}
    Interests: ${profile.interests.join(', ')}
    Experience Level: ${profile.experienceLevel}
    Years of Experience: ${profile.yearsExperience}
    Preferred Industry: ${profile.industry}

    Please provide a structured response in JSON format with the following fields:
    {
      "idea": "Startup idea description",
      "elevatorPitch": "One compelling sentence pitch",
      "mvpFeatures": ["feature1", "feature2", "feature3", "feature4", "feature5"],
      "businessModel": "Recommended business model explanation",
      "goToMarket": ["strategy1", "strategy2", "strategy3", "strategy4"]
    }

    Focus on realistic, actionable startup ideas that leverage their existing skills and interests.
    Make the elevator pitch compelling and concise.
    Return ONLY the JSON object, no additional text or markdown formatting.
  `;

  const response = await callGeminiApi(prompt);
  return extractJsonFromMarkdown(response);
}

export async function generateFollowUpResponseStreaming(
  question: string, 
  context: string, 
  mode: 'career' | 'startup',
  onChunk: (chunk: string) => void
): Promise<string> {
  const prompt = `
    As an expert ${mode} advisor, answer this follow-up question based on the previous context:

    Previous Context: ${context}
    User Question: ${question}

    Provide a helpful, motivational, and actionable response. Keep it conversational and encouraging.
    If the question is about implementation steps, provide specific, practical advice.
    If it's about concerns or doubts, address them positively while being realistic.
    
    Format your response in plain text with proper markdown formatting for readability:
    - Use **bold** for emphasis
    - Use bullet points with - for lists
    - Use numbered lists when showing steps
    - Use line breaks for better readability
  `;

  return await callGeminiApiStreaming(prompt, onChunk);
}

export async function generateFollowUpResponse(question: string, context: string, mode: 'career' | 'startup'): Promise<string> {
  const prompt = `
    As an expert ${mode} advisor, answer this follow-up question based on the previous context:

    Previous Context: ${context}
    User Question: ${question}

    Provide a helpful, motivational, and actionable response. Keep it conversational and encouraging.
    If the question is about implementation steps, provide specific, practical advice.
    If it's about concerns or doubts, address them positively while being realistic.
    
    Format your response in plain text with proper markdown formatting for readability:
    - Use **bold** for emphasis
    - Use bullet points with - for lists
    - Use numbered lists when showing steps
    - Use line breaks for better readability
  `;

  return await callGeminiApi(prompt);
}