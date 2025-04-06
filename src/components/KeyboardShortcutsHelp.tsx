'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

export default function KeyboardShortcutsHelp() {
  const [showHelp, setShowHelp] = useState(false);

  if (!showHelp) {
    return (
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="Keyboard Shortcuts"
      >
        <Keyboard size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
        <button
          onClick={() => setShowHelp(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-700">AI Edit</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Alt+I</kbd>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-700">Info Callout</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Alt+C</kbd>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-700">Best Practice Callout</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Alt+B</kbd>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-700">Warning Callout</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Alt+D</kbd>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-700">Error Callout</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Alt+E</kbd>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Select text first, then use these shortcuts
      </div>
    </div>
  );
} 