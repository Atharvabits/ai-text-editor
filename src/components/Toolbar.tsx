'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, 
  Code, Quote, Undo, Redo,
  Heading1, Heading2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) return null;

  const tools = [
    {
      icon: <Heading1 size={16} />,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      tooltip: 'Heading 1'
    },
    {
      icon: <Heading2 size={16} />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      tooltip: 'Heading 2'
    },
    {
      icon: <Bold size={16} />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      tooltip: 'Bold'
    },
    {
      icon: <Italic size={16} />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      tooltip: 'Italic'
    },
    {
      icon: <Underline size={16} />,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      tooltip: 'Underline'
    },
    { type: 'divider' },
    {
      icon: <List size={16} />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      tooltip: 'Bullet List'
    },
    {
      icon: <ListOrdered size={16} />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      tooltip: 'Numbered List'
    },
    { type: 'divider' },
    {
      icon: <AlignLeft size={16} />,
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
      tooltip: 'Align Left'
    },
    {
      icon: <AlignCenter size={16} />,
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
      tooltip: 'Align Center'
    },
    {
      icon: <AlignRight size={16} />,
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
      tooltip: 'Align Right'
    },
    { type: 'divider' },
    {
      icon: <Code size={16} />,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      tooltip: 'Code'
    },
    {
      icon: <Quote size={16} />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      tooltip: 'Quote'
    },
    { type: 'divider' },
    {
      icon: <Undo size={16} />,
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
      tooltip: 'Undo'
    },
    {
      icon: <Redo size={16} />,
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
      tooltip: 'Redo'
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {tools.map((tool, index) => {
        if (tool.type === 'divider') {
          return <div key={index} className="w-px h-6 bg-gray-800 mx-1" />;
        }

        return (
          <motion.button
            key={tool.tooltip}
            onClick={tool.action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-2 rounded-md transition-colors duration-200
              ${tool.isActive ? 'bg-gray-800 text-violet-400' : 'text-gray-400 hover:text-gray-200'}
              ${tool.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}
            `}
            disabled={tool.disabled}
            title={tool.tooltip}
          >
            {tool.icon}
          </motion.button>
        );
      })}
    </div>
  );
};

export default Toolbar; 