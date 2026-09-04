'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, ExternalLink, HeartHandshake, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = React.useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sol-praise-worship.vercel.app';

  const copyUrl = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-church-dark-900 rounded-2xl shadow-2xl max-w-md w-full border border-church-sky-200 dark:border-church-dark-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-church-sky-600 to-church-sky-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <HeartHandshake className="w-5 h-5 text-church-gold-300" />
            <div>
              <h3 className="font-bold text-base">Sanctuary of Love Noticeboard QR</h3>
              <p className="text-xs text-church-sky-100">Scan to view Praise & Worship Treasury</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-6">
          <div className="bg-slate-50 dark:bg-church-dark-950 p-6 rounded-2xl border border-dashed border-church-sky-300 inline-block shadow-inner" ref={qrRef}>
            <QRCodeSVG
              value={currentUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230284c7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/></svg>",
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>

          <div className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-church-dark-900 dark:text-white">
              Scan with any phone camera
            </p>
            <p className="text-xs text-slate-500">
              Instant access to contribution records, expenses, and live balance.
            </p>
          </div>

          {/* Quick Copy Link */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-church-dark-800 p-2 rounded-xl text-xs">
            <span className="truncate flex-1 text-slate-600 dark:text-slate-300 px-2 select-all font-mono">
              {currentUrl}
            </span>
            <button
              onClick={copyUrl}
              className="px-3 py-1.5 bg-church-sky-600 hover:bg-church-sky-700 text-white rounded-lg font-medium flex items-center space-x-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-church-dark-800 dark:hover:bg-church-dark-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Flyer</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-church-sky-600 hover:bg-church-sky-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
