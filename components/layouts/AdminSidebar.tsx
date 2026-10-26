"use client";

import { useEffect, useId, useRef } from "react";
import { AdminNav } from "@/components/layouts/AdminNav";
import { ADMIN_TITLE } from "@/constants/admin";
import { useDisclosure } from "@/hooks/useDisclosure";

const titleClass =
  "text-xs font-semibold uppercase tracking-wide text-neutral-500";
const FOCUSABLE = "a[href], button:not([disabled])";

export function AdminSidebar() {
  const { isOpen, close, open } = useDisclosure();
  const drawerId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    } else if (wasOpen.current) {
      toggleRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  return (
    <>
      <aside className="hidden rounded-xl border border-neutral-200 bg-white p-4 lg:block lg:p-5">
        <p className={`mb-4 ${titleClass}`}>{ADMIN_TITLE}</p>
        <AdminNav />
      </aside>

      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-2 pl-4 lg:hidden">
        <p className={titleClass}>{ADMIN_TITLE}</p>
        <button
          ref={toggleRef}
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls={drawerId}
          onClick={open}
          className="min-h-11 rounded-md border border-neutral-300 px-4 font-medium text-neutral-700 text-sm hover:bg-neutral-100"
        >
          Menu
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close navigation menu"
            onClick={close}
            className="absolute inset-0 bg-neutral-900/40"
          />
          <div
            id={drawerId}
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={ADMIN_TITLE}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto bg-white p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <p className={titleClass}>{ADMIN_TITLE}</p>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={close}
                className="min-h-11 min-w-11 rounded-md border border-neutral-300 text-neutral-700 text-sm hover:bg-neutral-100"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <AdminNav
              onNavigate={close}
              linkClassName="flex min-h-11 items-center"
            />
          </div>
        </div>
      )}
    </>
  );
}
