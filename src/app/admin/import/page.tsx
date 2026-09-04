'use client';

import React from 'react';
import ChatGPTImporter from '@/components/import/ChatGPTImporter';
import { Sparkles } from 'lucide-react';

export default function AdminImportPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <ChatGPTImporter />
    </div>
  );
}
