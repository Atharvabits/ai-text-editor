'use client';

import { Editor } from '@tiptap/react';
import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { getGeminiResponse } from '@/services/gemini';

interface AIFloatingMenuProps {
  editor: Editor;
}

const AI_ACTIONS = [
  {
    icon: '✨',
    label: 'Professional',
    prompt: 'Make this more professional'
  },
  {
    icon: '✂️',
    label: 'Concise',
    prompt: 'Make this more concise'
  },
  {
    icon: '📝',
    label: 'Grammar',
    prompt: 'Fix grammar'
  },
  {
    icon: '💡',
    label: 'Clear',
    prompt: 'Make this clearer'
  }
];

export default function AIFloatingMenu({ editor }: AIFloatingMenuProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!editor.isActive) return null;

  const handleAIAction = async (prompt: string, label: string) => {
    try {
      // Get selected text
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);

      if (!selectedText.trim()) return;

      setLoading(label);

      const result = await getGeminiResponse(prompt, selectedText);
      
      if (result?.trim()) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .deleteSelection()
          .insertContent(result.trim())
          .run();
      }
    } catch (error) {
      console.error('AI Action Error:', error);
    } finally {
      setLoading(null);
    }
  };

  // Only show when text is selected
  if (editor.state.selection.empty) return null;

  // Get selection coordinates
  const { from } = editor.state.selection;
  const coords = editor.view.coordsAtPos(from);

  return (
    <div
      className="fixed flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1"
      style={{
        top: `${coords.top - 50}px`,
        left: `${coords.left}px`,
      }}
    >
      {AI_ACTIONS.map(({ icon, label, prompt }) => (
        <button
          key={label}
          onClick={() => handleAIAction(prompt, label)}
          className="p-2 hover:bg-gray-100 rounded-md flex items-center gap-2 text-sm"
          disabled={loading !== null}
          title={label}
        >
          {loading === label ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <span className="text-lg">{icon}</span>
          )}
        </button>
      ))}
    </div>
  );
} 