'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { getGeminiResponse } from '@/services/gemini';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';

interface AIEditInterfaceProps {
  editor: Editor;
  show: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

// Predefined AI actions
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

export default function AIEditInterface({ editor, show, position, onClose }: AIEditInterfaceProps) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (show && editor) {
      // Store the selection range and selected text when the interface is shown
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      setSelectionRange({ from, to });
      setSelectedText(text);
      
      // Focus input on mount
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      // Reset state when closing
      setInstruction('');
      setError(null);
      setSelectionRange(null);
      setSelectedText('');
    }
  }, [show, editor]);

  const handleAIAction = async (prompt: string) => {
    if (!selectionRange || !selectedText.trim()) {
      setError('Please select some text first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending AI action request:', { prompt, selectedText });
      
      const result = await getGeminiResponse(prompt, selectedText);
      
      if (!result || !result.trim()) {
        throw new Error('No valid response from AI');
      }

      // Apply changes immediately
      editor
        .chain()
        .focus()
        .setTextSelection(selectionRange)
        .deleteSelection()
        .insertContent(result.trim())
        .run();

      onClose();
    } catch (error) {
      console.error('AI Action Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || loading) return;
    
    await handleAIAction(instruction);
  };

  if (!show) return null;

  // Calculate position to ensure menu stays within viewport
  const menuStyle = {
    top: `${Math.min(position.y, window.innerHeight - 300)}px`,
    left: `${Math.min(position.x, window.innerWidth - 350)}px`,
    zIndex: 50
  };

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-[400px]"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Wand2 size={16} />
          AI Edit
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 text-sm text-red-600 bg-red-50 rounded flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Selected Text
        </label>
        <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 max-h-20 overflow-y-auto">
          {selectedText}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quick Actions
        </label>
        <div className="grid grid-cols-1 gap-1">
          {AI_ACTIONS.map(({ label, prompt }) => (
            <button
              key={label}
              onClick={() => handleAIAction(prompt)}
              className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 flex items-center gap-2 rounded"
              disabled={loading}
            >
              <Wand2 
                size={14} 
                className={loading ? 'animate-spin' : ''} 
              />
              {loading ? 'Processing...' : label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-3">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="instruction" className="block text-sm font-medium text-gray-700 mb-1">
              Custom Instruction
            </label>
            <input
              ref={inputRef}
              id="instruction"
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Make it more concise, Fix grammar, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            disabled={loading || !instruction.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Generate Edit
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 