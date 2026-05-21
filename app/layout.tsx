/* app/layout.tsx */

import React from 'react';
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Battleship RL Command Center',
  description: 'Play Battleship in real-time against state-of-the-art Deep Q-Learning Reinforcement Learning agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
