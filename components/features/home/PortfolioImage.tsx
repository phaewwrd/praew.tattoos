"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type PortfolioImageProps = {
  alt: string;
  priority?: boolean;
  src: string;
};

export function PortfolioImage({
  alt,
  priority = false,
  src,
}: PortfolioImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      <button
        aria-label={`View larger: ${alt}`}
        className={`portfolio-image ${isLoaded ? "is-loaded" : ""} ${hasError ? "has-error" : ""}`}
        disabled={hasError}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {hasError ? (
          <span className="image-status">Image unavailable</span>
        ) : (
          <Image
            alt={alt}
            fill
            onError={() => setHasError(true)}
            onLoad={() => setIsLoaded(true)}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={src}
          />
        )}
        {!isLoaded && !hasError && (
          <span className="image-status">Loading image</span>
        )}
      </button>
      {isOpen && (
        <dialog aria-label={alt} className="lightbox" open>
          <button
            aria-label="Close"
            className="lightbox-backdrop"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <button
            aria-label="Close"
            className="lightbox-close"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            &times;
          </button>
          <img alt={alt} src={src} />
        </dialog>
      )}
    </>
  );
}
