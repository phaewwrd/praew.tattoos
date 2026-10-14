import { connection } from "next/server";
import { ServiceManager } from "./service-manager";
import { getTattooServices } from "@/lib/services";

export default async function AdminServicesPage() {
  await connection();
  const services = await getTattooServices();
  return <ServiceManager services={services} />;
}
