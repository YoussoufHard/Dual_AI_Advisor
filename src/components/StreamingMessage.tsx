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
    speed: 20, // Plus rapide pour une meilleure UX
    onComplete: onStreamComplete
  });

  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
          type === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        {type === 'ai' ? (
          <MarkdownText content={displayedText} />
        ) : (
          displayedText
        )}
        
        {/* Curseur clignotant pendant la frappe */}
        {isStreaming && !isComplete && (
          <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
}