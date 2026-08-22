"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useRef, useCallback } from "react";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Link2, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Code,
} from "lucide-react";

function Btn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`grid h-7 w-7 place-items-center rounded text-xs transition-colors ${active ? "bg-red-600/20 text-brand" : "text-slate-500 hover:bg-slate-100 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-5 w-px bg-slate-100" />;
}

export default function RichEditor({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploading = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageExt.configure({ inline: false, allowBase64: false }),
      LinkExt.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing…" }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose-blog min-h-[420px] outline-none px-1 py-2" },
    },
  });

  // Sync external value changes (e.g. AI fill)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const uploadImage = useCallback(async (file: File) => {
    if (uploading.current) return;
    uploading.current = true;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/blog/upload", { method: "POST", body: fd });
    uploading.current = false;
    if (!res.ok) { alert("Image upload failed"); return; }
    const { url } = await res.json();
    editor?.chain().focus().setImage({ src: url, alt: file.name }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    const url = window.prompt("URL", editor?.getAttributes("link").href ?? "");
    if (url === null) return;
    if (!url) { editor?.chain().focus().unsetLink().run(); return; }
    editor?.chain().focus().setLink({ href: url, target: "_blank" }).run();
  }, [editor]);

  if (!editor) return null;

  const wc = editor.storage.characterCount?.words() ?? 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-white px-3 py-2">
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo size={13} /></Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo size={13} /></Btn>
        <Divider />
        <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={13} /></Btn>
        <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={13} /></Btn>
        <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={13} /></Btn>
        <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={13} /></Btn>
        <Btn title="Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={13} /></Btn>
        <Divider />
        <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={13} /></Btn>
        <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={13} /></Btn>
        <Divider />
        <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={13} /></Btn>
        <Btn title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={13} /></Btn>
        <Btn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={13} /></Btn>
        <Btn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={13} /></Btn>
        <Divider />
        <Btn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={13} /></Btn>
        <Btn title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={13} /></Btn>
        <Btn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={13} /></Btn>
        <Divider />
        <Btn title="Link" active={editor.isActive("link")} onClick={setLink}><Link2 size={13} /></Btn>
        <Btn title="Upload image" onClick={() => fileRef.current?.click()}><ImageIcon size={13} /></Btn>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
      </div>

      {/* Editor area */}
      <div className="px-5 py-4">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-5 py-2 text-right text-xs text-slate-300">
        {wc} words
      </div>
    </div>
  );
}
