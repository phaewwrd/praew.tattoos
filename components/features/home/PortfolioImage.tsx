"use client";

import Image from "next/image";
import { useState } from "react";

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

	return (
		<div
			className={`portfolio-image ${isLoaded ? "is-loaded" : ""} ${hasError ? "has-error" : ""}`}
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
		</div>
	);
}
