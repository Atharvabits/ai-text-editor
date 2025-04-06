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

export type CalloutType = 'info' | 'best-practice' | 'warning' | 'error';

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
}

interface AIEditState {
  show: boolean;
  x: number;
  y: number;
}

const TiptapEditor = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
  });

  const [aiEdit, setAIEdit] = useState<AIEditState>({
    show: false,
    x: 0,
    y: 0,
  });

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

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Alt+C to add info callout
    if (e.altKey && e.key === 'c') {
      e.preventDefault();
      editor?.chain().focus().setCallout({ type: 'info' }).run();
    }
    
    // Alt+B to add best practice callout
    if (e.altKey && e.key === 'b') {
      e.preventDefault();
      editor?.chain().focus().setCallout({ type: 'best-practice' }).run();
    }
    
    // Alt+D to add warning callout
    if (e.altKey && e.key === 'd') {
      e.preventDefault();
      editor?.chain().focus().setCallout({ type: 'warning' }).run();
    }
    
    // Alt+E to add error callout
    if (e.altKey && e.key === 'e') {
      e.preventDefault();
      editor?.chain().focus().setCallout({ type: 'error' }).run();
    }
    
    // Alt+I to trigger AI edit
    if (e.altKey && e.key === 'i') {
      e.preventDefault();
      
      // Check if there's a selection
      if (editor && !editor.state.selection.empty) {
        const { from, to } = editor.state.selection;
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        
        // Position the AI edit interface above the selection
        setAIEdit({
          show: true,
          x: start.left,
          y: start.top - 10,
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
      if (aiEdit.show) {
        setAIEdit({ show: false, x: 0, y: 0 });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.show, aiEdit.show]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div 
          className="bg-white border rounded-lg shadow-sm overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          <Toolbar editor={editor} />
          <div className="p-4">
            <EditorContent editor={editor} />
          </div>
          {editor && (
            <>
              <EditorContextMenu
                editor={editor}
                show={contextMenu.show}
                position={{ x: contextMenu.x, y: contextMenu.y }}
                onClose={() => setContextMenu({ show: false, x: 0, y: 0 })}
              />
              <AIEditInterface
                editor={editor}
                show={aiEdit.show}
                position={{ x: aiEdit.x, y: aiEdit.y }}
                onClose={() => setAIEdit({ show: false, x: 0, y: 0 })}
              />
            </>
          )}
        </div>
      </div>
      <KeyboardShortcutsHelp />
    </div>
  );
};

export default TiptapEditor; 