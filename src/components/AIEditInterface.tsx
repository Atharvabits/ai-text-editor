'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { getGeminiResponse } from '@/services/gemini';
import { Wand2, X, Loader2, AlertCircle } from 'lucide-react';

interface AIEditInterfaceProps {
  editor: Editor;
  show: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function AIEditInterface({ editor, show, position, onClose }: AIEditInterfaceProps) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);

  useEffect(() => {
    if (show && editor) {
      // Store the selection range and selected text when the interface is shown
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      setSelectionRange({ from, to });
      setOriginalText(selectedText);
      
      // Focus input on mount
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      // Reset state when closing
      setInstruction('');
      setError(null);
      setSelectionRange(null);
    }
  }, [show, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || loading) return;

    setLoading(true);
    setError(null);
    
    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
      }
      
      const result = await getGeminiResponse(instruction, originalText);
      
      if (!result || !selectionRange) {
        throw new Error('Failed to generate AI response');
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
      console.error('AI Edit Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  // Calculate position to ensure menu stays within viewport
  const menuStyle = {
    top: `${Math.min(position.y, window.innerHeight - 300)}px`,
    left: `${Math.min(position.x, window.innerWidth - 350)}px`,
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-[400px]"
      style={menuStyle}
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

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selected Text
          </label>
          <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 max-h-20 overflow-y-auto">
            {originalText}
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="instruction" className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
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
  );
} 