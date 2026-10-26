"use client";

import Image from "next/image";
import { PortfolioUploadFields } from "@/components/features/admin/PortfolioUploadFields";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { usePortfolioManager } from "@/hooks/usePortfolioManager";
import type { Artist } from "@/services/artists";
import type { PortfolioCategory } from "@/services/portfolio";

export function PortfolioManager({
  artists,
  categories,
}: {
  artists: Artist[];
  categories: PortfolioCategory[];
}) {
  const {
    addCategory,
    artistId,
    busy,
    changeCategory,
    formRef,
    message,
    newCategory,
    removeCategory,
    removeImage,
    selectedArtist,
    setArtistId,
    setNewCategory,
    uploadImage,
  } = usePortfolioManager(artists);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-semibold text-2xl text-neutral-900">Portfolio</h1>
        <p className="mt-1 text-neutral-600 text-sm">
          Upload and manage portfolio images by artist.
        </p>
      </section>

      {artists.length === 0 ? (
        <p className="rounded-lg border border-neutral-200 p-4 text-neutral-600 text-sm">
          Add an artist before uploading portfolio images.
        </p>
      ) : (
        <>
          <label className="block max-w-sm font-medium text-neutral-700 text-sm">
            Artist
            <Select
              value={artistId}
              onChange={(event) => setArtistId(event.target.value)}
              className="mt-1 bg-white"
            >
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </Select>
          </label>

          <section className="space-y-3 rounded-lg border border-neutral-200 p-4">
            <h2 className="font-semibold text-neutral-900 text-sm">
              Categories
            </h2>
            <form onSubmit={addCategory} className="flex max-w-sm gap-2">
              <Input
                required
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                maxLength={80}
                placeholder="New category"
                aria-label="New category name"
                className="text-sm"
              />
              <Button type="submit" disabled={busy}>
                Add
              </Button>
            </form>
            {categories.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 text-sm"
                  >
                    {category.name}
                    <button
                      type="button"
                      disabled={busy}
                      aria-label={`Delete ${category.name}`}
                      onClick={() => void removeCategory(category.id)}
                      className="text-red-700 disabled:opacity-50"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <form
            ref={formRef}
            onSubmit={uploadImage}
            className="grid gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2"
          >
            <input type="hidden" name="artistId" value={artistId} />
            <label className="text-neutral-700 text-sm">
              Category
              <Select
                name="categoryId"
                defaultValue=""
                className="mt-1 bg-white"
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </label>
            <PortfolioUploadFields />
            <div className="flex items-center gap-3 sm:col-span-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Uploading..." : "Upload image"}
              </Button>
              {message && (
                <p role="status" className="text-neutral-600 text-sm">
                  {message}
                </p>
              )}
            </div>
          </form>

          <section>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-semibold text-lg text-neutral-900">
                {selectedArtist?.name}'s work
              </h2>
              <p className="text-neutral-500 text-sm">
                {selectedArtist?.portfolios.length ?? 0} images
              </p>
            </div>
            {!selectedArtist?.portfolios.length ? (
              <p className="rounded-lg border border-neutral-200 p-4 text-neutral-600 text-sm">
                No portfolio images for this artist yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {selectedArtist.portfolios.map((image) => (
                  <article
                    key={image.id}
                    className="overflow-hidden rounded-md border border-neutral-200"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={image.imageUrl}
                        alt={image.title}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-neutral-900 text-sm">
                        {image.title}
                      </h3>
                      {image.details && (
                        <p className="mt-1 text-neutral-500 text-xs">
                          {image.details}
                        </p>
                      )}
                      <Select
                        aria-label={`Category for ${image.title}`}
                        value={image.categoryId?.toString() ?? ""}
                        disabled={busy}
                        onChange={(event) =>
                          void changeCategory(image.id, event.target.value)
                        }
                        className="mt-2 bg-white px-2 py-1 text-xs"
                      >
                        <option value="">Uncategorized</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                      <Button
                        variant="link"
                        disabled={busy}
                        onClick={() => void removeImage(image.id)}
                        className="mt-3 text-red-700 text-xs"
                      >
                        Delete image
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
