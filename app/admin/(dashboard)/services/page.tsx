import { PageHeader } from "@/components/admin/ui";
import { listServices } from "@/server/services";
import { ServicesManager } from "./services-manager";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await listServices();
  return (
    <>
      <PageHeader
        title="Services"
        description="Shown as cards and in the record-player carousel. Photos appear on the vinyl."
      />
      <ServicesManager services={services} />
    </>
  );
}
