import React from 'react';
import { useStreamingText } from '../hooks/useStreamingText';

interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  type: 'user' | 'ai';
  onStreamComplete?: () => void;
}

// Component to render markdown-formatted text
function MarkdownText({ content }: { content: string }) {
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/^\d+\. (.+)$/gm, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  );
}

export default function StreamingMessage({ 
  content, 
  isStreaming, 
  type, 
  onStreamComplete 
}: StreamingMessageProps) {
  const { displayedText, isComplete } = useStreamingText(content, isStreaming, {
    speed: 15, // Vitesse optimisée pour un effet fluide
    onComplete: onStreamComplete
  });

  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
          type === 'user'
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {type === 'ai' ? (
          <div className="relative">
            <MarkdownText content={displayedText} />
            {/* Curseur clignotant uniquement pendant la frappe */}
            {isStreaming && !isComplete && (
              <span className="inline-block w-0.5 h-4 bg-gray-600 ml-1 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="relative">
            {displayedText}
            {/* Curseur pour les messages utilisateur aussi si nécessaire */}
            {isStreaming && !isComplete && (
              <span className="inline-block w-0.5 h-4 bg-white ml-1 animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}