'use client';

import React from 'react';
import { User, Bot, AlertCircle } from 'lucide-react';
import styles from './ChatMessage.module.scss';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  isError?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  isLoading,
  isError,
}) => {
  const isUser = role === 'user';

  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant} ${isError ? styles.error : ''}`}>
      <div className={styles.avatar}>
        {isUser ? <User size={16} /> : isError ? <AlertCircle size={16} /> : <Bot size={16} />}
      </div>
      <div className={styles.bubble}>
        {isLoading ? (
          <div className={styles.typing}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <p className={styles.text}>{content}</p>
        )}
      </div>
    </div>
  );
};