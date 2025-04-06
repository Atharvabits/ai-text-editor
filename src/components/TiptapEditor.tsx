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
import { 
  Wand2, 
  Loader2, 
  Sparkles, 
  Zap, 
  Stars, 
  Brain,
  Type,
  Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] text-gray-100',
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      
      if (editor && !editor.state.selection.empty) {
        const { from } = editor.state.selection;
        const coords = editor.view.coordsAtPos(from);
        
        setAIPrompt({
          show: true,
          position: {
            x: Math.min(coords.left, window.innerWidth - 400), // Prevent overflow
            y: Math.min(coords.top - 100, window.innerHeight - 300)
          }
        });
      }
    }
  };

  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom;
      editorElement.addEventListener('keydown', handleKeyDown);

      return () => {
        editorElement.removeEventListener('keydown', handleKeyDown);
      };
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 mb-2">
                AI Editor
              </h1>
              <p className="text-gray-400 text-lg">
                Transform your writing with AI-powered intelligence
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-all"
            >
              <Settings size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Editor Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden"
        >
          {/* Toolbar */}
          <div className="border-b border-gray-700/50 bg-gray-800/30 p-3">
            <Toolbar editor={editor} />
          </div>

          {/* Editor Area */}
          <div className="p-8 relative">
            {/* File name header */}
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <Type size={14} />
              <span>untitled.md</span>
            </div>

            {/* Editor Content */}
            <div className="relative rounded-xl bg-gray-800/20 p-6 backdrop-blur-sm border border-gray-700/30">
              <EditorContent editor={editor} />
            </div>

            {/* AI Floating Menu */}
            <AnimatePresence>
              {editor && !editor.state.selection.empty && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute flex items-center gap-1 bg-gray-800/95 backdrop-blur-lg rounded-lg p-1.5 shadow-2xl border border-gray-700/50"
                  style={{
                    top: editor.view.coordsAtPos(editor.state.selection.from).top - 60,
                    left: editor.view.coordsAtPos(editor.state.selection.from).left,
                  }}
                >
                  {[
                    { icon: <Sparkles size={16} />, label: 'Enhance', color: 'indigo' },
                    { icon: <Zap size={16} />, label: 'Concise', color: 'violet' },
                    { icon: <Brain size={16} />, label: 'Rephrase', color: 'purple' },
                    { icon: <Stars size={16} />, label: 'Fix', color: 'fuchsia' },
                  ].map(({ icon, label, color }) => (
                    <motion.button
                      key={label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        p-2.5 rounded-md flex items-center gap-2 text-sm font-medium
                        transition-all duration-200 relative group
                        hover:bg-${color}-500/20 text-${color}-400 hover:text-${color}-300
                      `}
                      onClick={() => handleAIAction(`${label} this text`)}
                    >
                      {icon}
                      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                        bg-gray-800 text-gray-200 px-2 py-1 rounded text-xs opacity-0 
                        group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Prompt Popup */}
            <AnimatePresence>
              {aiPrompt.show && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700/50 p-5 shadow-2xl z-50 w-[400px]"
                  style={{
                    top: aiPrompt.position.y,
                    left: aiPrompt.position.x,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-violet-500/20">
                        <Wand2 className="text-violet-400" size={18} />
                      </div>
                      <span className="font-semibold text-gray-200">AI Magic</span>
                    </div>
                    <button
                      onClick={() => setAIPrompt({ show: false, position: { x: 0, y: 0 } })}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                    if (input.value.trim()) {
                      handleAIAction(input.value);
                    }
                  }}>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="What would you like AI to do?"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg
                          text-gray-200 placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                          transition-all duration-200"
                        autoFocus
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 rounded-lg pointer-events-none" />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        w-full px-4 py-3 rounded-lg font-medium
                        bg-gradient-to-r from-violet-500 to-fuchsia-500
                        text-white shadow-lg shadow-violet-500/25
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        hover:shadow-violet-500/40
                        flex items-center justify-center gap-2
                      `}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Apply AI Magic
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 text-sm">
            Press <kbd className="px-2 py-1 bg-gray-800 rounded-md text-gray-400">Alt</kbd> + 
            <kbd className="px-2 py-1 bg-gray-800 rounded-md text-gray-400 ml-1">I</kbd> 
            for AI suggestions or select text to see quick actions
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TiptapEditor; 