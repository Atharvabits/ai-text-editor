'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlock from '@tiptap/extension-code-block';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useCallback, useState, useEffect } from 'react';
import { CalloutExtension } from './extensions/Callout';
import Toolbar from './EditorToolbar';
import EditorContextMenu from './EditorContextMenu';
import AIEditInterface from './AIEditInterface';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import AIFloatingMenu from './AIFloatingMenu';
import { Wand2, Loader2 } from 'lucide-react';
import { getGeminiResponse } from '@/services/gemini';

export type CalloutType = 'info' | 'best-practice' | 'warning' | 'error';

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
}

interface AIPromptState {
  show: boolean;
  position: {
    x: number;
    y: number;
  };
}

const TiptapEditor = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
  });

  const [aiPrompt, setAIPrompt] = useState<AIPromptState>({
    show: false,
    position: { x: 0, y: 0 }
  });

  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CalloutExtension.configure({
        HTMLAttributes: {
          class: 'callout',
        },
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      CodeBlock,
      TaskList,
      TaskItem,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
      handleDOMEvents: {
        mouseup: (view, event) => {
          if (event.button === 2) { // Right click
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
              event.preventDefault();
              // Get selected text
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              
              // Position the context menu at the mouse position
              setContextMenu({
                show: true,
                x: event.clientX,
                y: event.clientY
              });
            }
          } else {
            setContextMenu({ show: false, x: 0, y: 0 });
          }
          return false;
        },
        contextmenu: (view, event) => {
          // Prevent default context menu if we have a selection
          if (!view.state.selection.empty) {
            event.preventDefault();
          }
          return false;
        }
      },
    },
  });

  const handleAIAction = async (prompt: string) => {
    if (!editor || editor.state.selection.empty) return;

    try {
      setLoading(true);
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);

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
      setLoading(false);
      setAIPrompt({ show: false, position: { x: 0, y: 0 } });
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.altKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      
      if (editor && !editor.state.selection.empty) {
        const { from } = editor.state.selection;
        const coords = editor.view.coordsAtPos(from);
        
        setAIPrompt({
          show: true,
          position: {
            x: coords.left,
            y: coords.top - 60
          }
        });
      }
    }
  }, [editor]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0 });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.show]);

  // AI Prompt popup component
  const AIPromptPopup = () => {
    if (!aiPrompt.show) return null;

    return (
      <div
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
        style={{
          top: aiPrompt.position.y,
          left: aiPrompt.position.x,
          minWidth: '300px'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wand2 size={16} />
            <span className="text-sm font-medium">AI Edit</span>
          </div>
          <button
            onClick={() => setAIPrompt({ show: false, position: { x: 0, y: 0 } })}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector('input') as HTMLInputElement;
            if (input.value.trim()) {
              handleAIAction(input.value);
            }
          }}
        >
          <input
            type="text"
            placeholder="Enter your instruction..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Apply AI Edit
              </>
            )}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <Toolbar editor={editor} />
          <div className="p-4 relative">
            <EditorContent editor={editor} />
            {editor && <AIFloatingMenu editor={editor} />}
            <AIPromptPopup />
          </div>
        </div>
      </div>
      <KeyboardShortcutsHelp />
    </div>
  );
};

export default TiptapEditor; 