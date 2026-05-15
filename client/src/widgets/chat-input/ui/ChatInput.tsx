'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Mic, ChevronRight, Square } from 'lucide-react';

import styles from './ChatInput.module.scss';
import { useSpeechRecognition } from '@/utils/useSpeechRecognition';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = 'Ask whatever you want',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTranscriptChange = useCallback((transcript: string) => {
    setMessage(transcript);
  }, []);

  const {
    isListening,
    startListening,
    stopListening,
    isSupported,
  } = useSpeechRecognition({
    onTranscriptChange: handleTranscriptChange,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleMicClick = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      setMessage('');
      startListening();
    }
  };

  const isEmpty = message.trim().length === 0;

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <div className={`${styles.inputWrapper} ${isListening ? styles.listening : ''}`}>
        <button
          type="button"
          className={`${styles.micButton} ${isListening ? styles.micActive : ''}`}
          onClick={handleMicClick}
          disabled={disabled}
                  aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
        >
          {isListening ? <Square size={16} /> : <Mic size={20} strokeWidth={1.5} />}
        </button>

        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isListening ? 'Listening...' : placeholder}
          disabled={disabled}
          aria-label="Message input"
        />

        <button
          type="submit"
          className={styles.sendButton}
          disabled={isEmpty || disabled}
          aria-label="Send message"
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      </div>
      
      {isListening && (
        <div className={styles.listeningIndicator}>
          <span className={styles.pulse}></span>
          Listening...
        </div>
      )}
    </form>
  );
};