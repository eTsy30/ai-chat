'use client';

import React from 'react';
import { Message } from '../../../entities/message/model/types';
import { ChatMessage } from '../../../entities/message/ui/ChatMessage';
import styles from './ChatMessages.module.scss';

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  return (
    <div className={styles.container}>
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          role={msg.role}
          content={msg.content}
          isLoading={msg.isLoading}
          isError={msg.isError}
        />
      ))}
    </div>
  );
};