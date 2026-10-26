"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** Native <dialog>: focus is trapped, Esc closes, focus returns to the trigger. */
export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a mouse convenience; Esc closes natively.
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[min(92vw,28rem)] -rotate-1 border-2 border-ink bg-paper p-0 text-ink shadow-[8px_8px_0_var(--color-ink)]"
    >
      <div className="p-6 sm:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="font-black text-2xl text-brand uppercase tracking-wide"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center border-2 border-ink font-bold text-xl hover:bg-butter"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
