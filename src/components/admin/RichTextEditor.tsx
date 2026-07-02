"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Link2, Heading2, Heading3, Pilcrow, Eraser } from "lucide-react";

// Leichtgewichtiger WYSIWYG-Editor auf contentEditable-Basis (keine Fremd-Lib).
// Uncontrolled: initiales HTML wird EINMAL gesetzt, danach liest der Editor sein innerHTML
// bei Änderungen aus und meldet es via onChange (kein Cursor-Sprung durch Re-Render).
export function RichTextEditor({ initialHtml, onChange }: { initialHtml: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml || "<p></p>";
    // Absichtlich nur einmal (beim Tab-Wechsel bekommt der Editor via key= eine neue Instanz).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => onChange(ref.current?.innerHTML ?? "");

  function cmd(command: string, value?: string) {
    ref.current?.focus();
    document.execCommand(command, false, value);
    emit();
  }

  function addLink() {
    const url = window.prompt("Link-Adresse (URL):", "https://");
    if (url) cmd("createLink", url);
  }

  const Btn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-100 bg-neutral-50 px-2 py-1.5">
        <Btn onClick={() => cmd("formatBlock", "H2")} title="Überschrift"><Heading2 size={16} /></Btn>
        <Btn onClick={() => cmd("formatBlock", "H3")} title="Unterüberschrift"><Heading3 size={16} /></Btn>
        <Btn onClick={() => cmd("formatBlock", "P")} title="Absatz"><Pilcrow size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-neutral-200" />
        <Btn onClick={() => cmd("bold")} title="Fett"><Bold size={16} /></Btn>
        <Btn onClick={() => cmd("italic")} title="Kursiv"><Italic size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-neutral-200" />
        <Btn onClick={() => cmd("insertUnorderedList")} title="Aufzählung"><List size={16} /></Btn>
        <Btn onClick={() => cmd("insertOrderedList")} title="Nummerierte Liste"><ListOrdered size={16} /></Btn>
        <Btn onClick={addLink} title="Link einfügen"><Link2 size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-neutral-200" />
        <Btn onClick={() => cmd("removeFormat")} title="Formatierung entfernen"><Eraser size={16} /></Btn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        className="legal-editor min-h-[320px] max-h-[60vh] overflow-y-auto px-4 py-3 text-sm leading-relaxed text-neutral-800 outline-none"
      />
    </div>
  );
}
