"use client";

import { useEffect, useState } from "react";

type InstagramPost = {
	id: string;
	caption?: string;
	media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
	media_url?: string;
	thumbnail_url?: string;
	permalink: string;
};

export default function InstagramFeed() {
	const [posts, setPosts] = useState<InstagramPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		async function loadPosts() {
			try {
				const response = await fetch("/api/instagram");
				if (!response.ok) {
					throw new Error("Failed to load Instagram posts");
				}

				const result = await response.json();
				setPosts(result.posts ?? []);
			} catch (err) {
				console.error("Error loading Instagram feed", err);
				setError(true);
			} finally {
				setLoading(false);
			}
		}

		loadPosts();
	}, []);

	return (
		<section className="instagram-feed" aria-label="Recent Instagram posts">
			<div className="instagram-feed-heading">
				<p className="eyebrow">Instagram</p>
				<h3>Recent work</h3>
			</div>
			{loading ? (
				<div className="instagram-feed-grid" aria-busy="true">
					{Array.from({ length: 4 }, (_, index) => (
						<div className="instagram-feed-skeleton" key={index} />
					))}
				</div>
			) : error ? (
				<p className="instagram-feed-status" role="status">
					Unable to load posts right now.
				</p>
			) : posts.length === 0 ? (
				<p className="instagram-feed-status">No posts available yet.</p>
			) : (
				<div className="instagram-feed-grid">
					{posts.map((post) => {
						const image =
							post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;

						if (!image) return null;

						return (
							<a
								key={post.id}
								href={post.permalink}
								target="_blank"
								rel="noreferrer"
								aria-label={post.caption || "View Instagram post"}
								className="instagram-feed-post"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={image}
									alt={post.caption || "Instagram post"}
									loading="lazy"
									className="instagram-feed-image"
								/>
							</a>
						);
					})}
				</div>
			)}
		</section>
	);
}
