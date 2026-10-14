import { connection } from "next/server";
import { getTattooServices } from "@/lib/services";
import { ServiceManager } from "./service-manager";

export default async function AdminServicesPage() {
	await connection();
	const services = await getTattooServices();
	return <ServiceManager services={services} />;
}
