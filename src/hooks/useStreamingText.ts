import { useState, useEffect, useRef } from 'react';

interface UseStreamingTextOptions {
  speed?: number; // Vitesse de frappe en ms par caractère
  onComplete?: () => void;
}

export function useStreamingText(
  text: string, 
  isStreaming: boolean,
  options: UseStreamingTextOptions = {}
) {
  const { speed = 30, onComplete } = options;
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isStreaming || !text) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    // Reset pour nouveau texte
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    // Effet de frappe
    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setIsComplete(true);
        onComplete?.();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, isStreaming, speed, onComplete]);

  return { displayedText, isComplete };
}