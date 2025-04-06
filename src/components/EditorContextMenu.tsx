'use client';

import { Editor } from '@tiptap/react';
import { useState } from 'react';
import { Wand2, AlertCircle, RefreshCw } from 'lucide-react';
import { getGeminiResponse } from '@/services/gemini';

interface EditorContextMenuProps {
  editor: Editor;
  show: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

const AI_ACTIONS = [
  { 
    label: 'Make it more professional',
    prompt: 'Rewrite this text to be more professional and formal, maintaining the same meaning but using more sophisticated language and business-appropriate tone.'
  },
  { 
    label: 'Make it more concise',
    prompt: 'Rewrite this text to be more concise and direct while preserving all key information. Remove any redundancy or unnecessary words.'
  },
  { 
    label: 'Fix grammar & spelling',
    prompt: 'Correct any grammar, spelling, or punctuation errors in this text while maintaining its original meaning and tone.'
  },
  { 
    label: 'Improve clarity',
    prompt: 'Rewrite this text to be clearer and easier to understand. Use simpler sentence structures if needed, but maintain all important information.'
  },
  { 
    label: 'Make it more engaging',
    prompt: 'Rewrite this text to be more engaging and interesting, using more dynamic language while keeping the same core message.'
  },
];

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

async function retryWithDelay<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithDelay(fn, retries - 1, delay);
    }
    throw error;
  }
}

export default function EditorContextMenu({ editor, show, position, onClose }: EditorContextMenuProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  if (!show) return null;

  const selectedText = editor.state.doc.textBetween(
    editor.state.selection.from,
    editor.state.selection.to
  );

  const handleAIAction = async (prompt: string, label: string) => {
    try {
      if (!selectedText.trim()) {
        setError('Please select some text first');
        return;
      }

      setLoading(label);
      setError(null);

      // Store the current selection range
      const { from, to } = editor.state.selection;
      
      console.log('Sending AI action request:', { prompt, selectedText });

      const result = await getGeminiResponse(prompt, selectedText);
      
      if (!result || !result.trim()) {
        throw new Error('No valid response from AI');
      }

      // Apply changes immediately
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .deleteSelection()
        .insertContent(result.trim())
        .run();

      onClose();
    } catch (error) {
      console.error('AI Action Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  // Calculate menu position to stay within viewport
  const menuStyle = {
    top: `${Math.min(position.y, window.innerHeight - 300)}px`,
    left: `${Math.min(position.x, window.innerWidth - 250)}px`,
    zIndex: 50
  };

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
    >
      <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b">
        <div className="flex items-center gap-2">
          <Wand2 size={16} />
          AI Actions
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 text-sm text-red-600 bg-red-50">
          <AlertCircle size={14} className="inline mr-2" />
          {error}
        </div>
      )}

      <div className="py-1">
        {AI_ACTIONS.map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => handleAIAction(prompt, label)}
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 flex items-center gap-2"
            disabled={loading !== null}
          >
            <Wand2 
              size={14} 
              className={loading === label ? 'animate-spin' : ''} 
            />
            {loading === label ? 'Processing...' : label}
          </button>
        ))}
      </div>
    </div>
  );
} 