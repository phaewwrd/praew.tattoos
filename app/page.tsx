import { PortfolioImage } from "./portfolio-image";
import { AvailabilityBooking } from "./availability-booking";
import { getAvailableDatesAction } from "./actions/availability";
import { portfolioItems, type PortfolioCategory } from "@/lib/portfolio";
import { getTattooServices } from "@/lib/services";
import { TattooMap } from "@/components/map/tattoo-map";

const portfolioCategories: PortfolioCategory[] = ["Realistic Color Tattoos", "Realistic Black & Gray Tattoos", "Fine line Tattoos"];

export default async function Home() {
  const [initialAvailableDates, tattooServices] = await Promise.all([
    getAvailableDatesAction(),
    getTattooServices({ onlyActive: true }),
  ]);
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Praew Tattoos home">praew tattoos</a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#availability">available slots</a><a href="#location">location</a><a href="#contact">contact us</a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
        </nav>
      </header>
      <main id="top">
        <section className="hero section-frame" aria-labelledby="hero-title">
          <p className="eyebrow">Bangkok, Thailand</p><h1 id="hero-title">A quiet mark, made to stay.</h1>
          <p className="hero-copy">Fine line and ornamental tattooing by Praew. Thoughtful pieces for skin, memory, and the space between.</p>
          <a className="text-link" href="#availability">View available slots <span aria-hidden="true">&#8595;</span></a>
        </section>

        <section id="gallery" className="gallery section-frame" aria-labelledby="gallery-title">
          <div className="section-heading"><p className="eyebrow">Selected work</p><h2 id="gallery-title">Portfolio</h2></div>
          {portfolioItems.some((item) => item.isPublished) ? portfolioCategories.map((category, categoryIndex) => {
            const items = portfolioItems.filter((item) => item.isPublished && item.category === category).sort((first, second) => first.sortOrder - second.sortOrder);
            if (!items.length) return null;
            const [featuredItem, ...remainingItems] = items;
            return <section className="portfolio-category" key={category} aria-labelledby={`${featuredItem.id}-category`}>
              <p className="portfolio-category-label" id={`${featuredItem.id}-category`}>{category}</p>
              {categoryIndex === 0 && <div className="portfolio-feature"><figure><PortfolioImage alt={featuredItem.altText} priority src={featuredItem.imageUrl} /><figcaption>{featuredItem.title}</figcaption></figure><div className="portfolio-feature-copy"><p>{featuredItem.description}</p><p className="eyebrow">Featured work</p></div></div>}
              <div className="portfolio-row">{(categoryIndex === 0 ? remainingItems : items).map((item) => <figure key={item.id}><PortfolioImage alt={item.altText} src={item.imageUrl} /><figcaption>{item.title}</figcaption></figure>)}</div>
            </section>;
          }) :
            <p className="gallery-empty">New work is being prepared for the portfolio. Please check back soon.</p>}
        </section>

        <section id="location" className="location section-frame" aria-labelledby="location-title">
          <div>
            <p className="eyebrow">The studio</p>
            <h2 id="location-title">A private space for unhurried work.</h2>
            <p className="body-copy">Appointments take place in a calm studio in Bangkok. Every session is one-to-one, with time to settle in before the needle starts.</p>
          </div>
          {/* Maps */}
          <TattooMap />
          <a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Praew.Tattoos" target="_blank" rel="noreferrer">Open in Google Maps <span aria-hidden="true">&#8599;</span></a>
          <div className="location-details">
            <address>Bangkok, Thailand<br />Full studio details are shared with confirmed appointments.</address>
            <p>Nearest MRT: Bangson (Purple line and Red line) exit 5</p>
            <p>walk approximately 10 minutes to the studio.</p>
          </div>
        </section>
        <section id="services" className="services section-frame" aria-labelledby="services-title">
          <div className="services-heading"><p className="eyebrow">How we work</p><h2 id="services-title">Services</h2><p className="body-copy">Every piece is priced for its scale, detail, and placement. A deposit holds your appointment and is deducted from the final price.</p></div>
          <div className="service-list">
            {tattooServices.sort((first, second) => first.sortOrder - second.sortOrder).map((service) => <article className="service-item" key={service.id}>
              <div>
                <h3>{service.name}</h3><p>{service.description}</p>
              </div>
              <dl className="service-details"><div><dt>From</dt><dd>{service.priceFrom.toLocaleString("en-US")} THB</dd></div><div><dt>Deposit</dt><dd>{service.depositAmount.toLocaleString("en-US")} THB</dd></div>{service.durationMinutes && <div><dt>Estimated time</dt><dd>Approx. {service.durationMinutes / 60} hr</dd></div>}</dl>
              <a className="text-link" href="#availability">Check available slots <span aria-hidden="true">&#8595;</span></a>
            </article>)}
          </div>
        </section>
        <section id="availability" className="availability section-frame" aria-labelledby="availability-title">
          <div className="section-heading"><p className="eyebrow">Appointments</p><h2 id="availability-title">Available slots</h2></div>
          <AvailabilityBooking initialAvailableDates={initialAvailableDates} services={tattooServices} />
        </section>
        <section id="contact" className="contact section-frame" aria-labelledby="contact-title"><p className="eyebrow">Contact</p><h2 id="contact-title">Start with a conversation.</h2><a className="contact-email" href="mailto:praew.tattoos@gmail.com">praew.tattoos@gmail.com</a><p className="body-copy">For custom work, include your idea, preferred placement, and size.</p></section>
      </main>
      <footer className="site-footer"><span>Praew Tattoos</span><span>Bangkok, Thailand</span><span>&copy; 2026</span></footer>
    </div>
  );
}
