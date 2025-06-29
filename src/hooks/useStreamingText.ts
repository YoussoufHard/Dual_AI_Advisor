import { useState, useEffect, useRef, useCallback } from 'react';

interface UseStreamingTextOptions {
  speed?: number; // Vitesse de frappe en ms par caractère
  onComplete?: () => void;
}

export function useStreamingText(
  text: string, 
  isStreaming: boolean,
  options: UseStreamingTextOptions = {}
) {
  const { speed = 15, onComplete } = options; // Plus rapide pour un effet plus fluide
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);
  const lastTextRef = useRef('');

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Si le texte n'a pas changé, ne pas redémarrer l'animation
    if (text === lastTextRef.current) {
      return;
    }

    lastTextRef.current = text;
    cleanup();

    if (!isStreaming || !text) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    // Reset pour nouveau texte
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    // Effet de frappe caractère par caractère (plus fluide)
    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setIsComplete(true);
        onComplete?.();
        cleanup();
      }
    }, speed);

    return cleanup;
  }, [text, isStreaming, speed, onComplete, cleanup]);

  // Cleanup à la destruction du composant
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { displayedText, isComplete };
}