import { PageHeader } from "@/components/admin/ui";
import { listFallbackImages } from "@/server/content";
import { getInstagramTokenStatus, getPublicSettings } from "@/server/settings";
import { SettingsManager } from "./settings-manager";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [settings, token, fallbackImages] = await Promise.all([
    getPublicSettings(),
    getInstagramTokenStatus(),
    listFallbackImages(),
  ]);
  const { heartImageUrl: _heart, ...studio } = settings;
  return (
    <>
      <PageHeader title="Settings" />
      <SettingsManager
        studio={studio}
        token={{
          hasToken: token.hasToken,
          storedInDb: token.storedInDb,
          expiresAt: token.expiresAt?.toISOString() ?? null,
          refreshedAt: token.refreshedAt?.toISOString() ?? null,
        }}
        fallbackImages={fallbackImages.map(({ id, url }) => ({ id, url }))}
      />
    </>
  );
}
