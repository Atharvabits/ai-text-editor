'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, 
  Image as ImageIcon,
  Link, 
  Code,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="flex flex-wrap gap-2 p-3">
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''
            }`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''
            }`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-100' : ''
            }`}
          >
            H3
          </button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('bold') ? 'bg-gray-100' : ''
            }`}
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('italic') ? 'bg-gray-100' : ''
            }`}
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('underline') ? 'bg-gray-100' : ''
            }`}
          >
            <Underline size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('strike') ? 'bg-gray-100' : ''
            }`}
          >
            <Strikethrough size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''
            }`}
          >
            <AlignLeft size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''
            }`}
          >
            <AlignCenter size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''
            }`}
          >
            <AlignRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('bulletList') ? 'bg-gray-100' : ''
            }`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('orderedList') ? 'bg-gray-100' : ''
            }`}
          >
            <ListOrdered size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={addImage}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ImageIcon size={18} />
          </button>
          <button
            onClick={addLink}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('link') ? 'bg-gray-100' : ''
            }`}
          >
            <Link size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1 rounded hover:bg-gray-100 ${
              editor.isActive('codeBlock') ? 'bg-gray-100' : ''
            }`}
          >
            <Code size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().setCallout({ type: 'info' }).run()}
            className="p-1 rounded hover:bg-blue-100 text-blue-600"
          >
            <Info size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setCallout({ type: 'best-practice' }).run()}
            className="p-1 rounded hover:bg-green-100 text-green-600"
          >
            <CheckCircle2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setCallout({ type: 'warning' }).run()}
            className="p-1 rounded hover:bg-yellow-100 text-yellow-600"
          >
            <AlertTriangle size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setCallout({ type: 'error' }).run()}
            className="p-1 rounded hover:bg-red-100 text-red-600"
          >
            <XCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar; 