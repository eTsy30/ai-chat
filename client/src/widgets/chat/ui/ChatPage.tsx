'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Message, ChatApiResponse, ChatApiError } from '../../../entities/message/model/types';
import { WelcomeHeader } from '../../welcome-header/ui/WelcomeHeader';
import { ChatMessages } from '../../chat-messages/ui/ChatMessages';
import { ChatInput } from '../../chat-input/ui/ChatInput';
import styles from './ChatPage.module.scss';

const API_URL = 'https://ai-chat-server-six.vercel.app/chat';
const MAX_RETRIES = 2;

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hasMessages = messages.length > 0;
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sendMessageRef = useRef<(content: string, retryCount?: number) => Promise<void>>(async () => {});

  const sendMessage = useCallback(async (content: string, retryCount = 0) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const loadingMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData: ChatApiError = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data: ChatApiResponse = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: data.reply,       
                timestamp: data.timestamp,  
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);

      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';

      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.toLowerCase().includes('network')) {
        setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));
        setTimeout(() => sendMessageRef.current(content, retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? { ...msg, content: errorMessage, isLoading: false, isError: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!hasMessages && <WelcomeHeader />}
        {hasMessages && <ChatMessages messages={messages} />}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputSection}>
        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};