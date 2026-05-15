'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

import styles from './WelcomeHeader.module.scss';

export const WelcomeHeader: React.FC = () => {
  return (
    <section className={styles.container}>
      <div className={styles.iconWrapper}>
        <MessageCircle size={22} strokeWidth={2} />
      </div>

      <span className={styles.greeting}>
        Hi there
      </span>

      <h1 className={styles.title}>
        What would you like to know?
      </h1>

      <p className={styles.subtitle}>
        Use one of the suggested prompts below
        or ask your own question.
      </p>
    </section>
  );
};