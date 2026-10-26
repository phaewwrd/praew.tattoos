import { AvailabilitySection } from "@/components/features/home/AvailabilitySection";
import { ContactSection } from "@/components/features/home/ContactSection";
import { HeroSection } from "@/components/features/home/HeroSection";
import { LocationSection } from "@/components/features/home/LocationSection";
import { PortfolioSection } from "@/components/features/home/PortfolioSection";
import { ServicesSection } from "@/components/features/home/ServicesSection";
import { SiteFooter } from "@/components/layouts/SiteFooter";
import { SiteHeader } from "@/components/layouts/SiteHeader";
import { getPortfolioGallery } from "@/services/portfolio";
import { getTattooServices } from "@/services/services";
import { getAvailableDatesAction } from "./actions/availability";

export default async function Home() {
  const [initialAvailableDates, tattooServices, portfolioGroups] =
    await Promise.all([
      getAvailableDatesAction(),
      getTattooServices({ onlyActive: true }),
      getPortfolioGallery(),
    ]);
  tattooServices.sort((first, second) => first.sortOrder - second.sortOrder);

  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="top">
        <HeroSection />
        <PortfolioSection groups={portfolioGroups} />
        <LocationSection />
        <ServicesSection services={tattooServices} />
        <AvailabilitySection
          initialAvailableDates={initialAvailableDates}
          services={tattooServices}
        />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
