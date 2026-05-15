'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  onTranscriptChange?: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error: string | null;
}

export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {

  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(() => 
    isSupported ? null : 'Speech recognition not supported in this browser'
  );
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptBufferRef = useRef('');
  const optionsRef = useRef(options);

 
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !isSupported) return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      transcriptBufferRef.current = '';
      optionsRef.current.onListeningChange?.(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      optionsRef.current.onListeningChange?.(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      transcriptBufferRef.current += finalTranscript;
      const fullTranscript = transcriptBufferRef.current + interimTranscript;
      
      optionsRef.current.onTranscriptChange?.(fullTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      optionsRef.current.onListeningChange?.(false);
      
      switch (event.error) {
        case 'no-speech':
          setError('No speech detected');
          break;
        case 'audio-capture':
          setError('No microphone found');
          break;
        case 'not-allowed':
          setError('Microphone permission denied');
          break;
        case 'network':
          setError('Network error');
          break;
        default:
          setError(`Error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    
    transcriptBufferRef.current = '';
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      } catch {
        // ничего
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    isSupported,
    error,
  };
};