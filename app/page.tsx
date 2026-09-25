import { PortfolioImage } from "./portfolio-image";
import { portfolioItems, type PortfolioCategory } from "@/lib/portfolio";

const calendarDays = ["", "", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];
const portfolioCategories: PortfolioCategory[] = ["Realistic Color Tattoos", "Realistic Black & Gray Tattoos"];

export default function Home() {
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
          }) : <p className="gallery-empty">New work is being prepared for the portfolio. Please check back soon.</p>}
        </section>
        <section id="location" className="location section-frame" aria-labelledby="location-title">
          <div><p className="eyebrow">The studio</p><h2 id="location-title">A private space for unhurried work.</h2><p className="body-copy">Appointments take place in a calm studio in Bangkok. Every session is one-to-one, with time to settle in before the needle starts.</p></div>
          <div className="location-details"><address>Bangkok, Thailand<br />Full studio details are shared with confirmed appointments.</address><p>Nearest BTS: to be confirmed</p><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Bangkok%2C%20Thailand" target="_blank" rel="noreferrer">Open in Google Maps <span aria-hidden="true">&#8599;</span></a></div>
        </section>
        <section id="availability" className="availability section-frame" aria-labelledby="availability-title">
          <div className="section-heading"><p className="eyebrow">Appointments</p><h2 id="availability-title">Available slots</h2></div>
          <div className="availability-layout">
            <div className="calendar" aria-label="Availability preview"><div className="calendar-head"><span>September 2026</span><span>Slots coming soon</span></div><div className="calendar-week" aria-hidden="true"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div><div className="calendar-days" aria-hidden="true">{calendarDays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div></div>
            <div className="availability-note"><p>New appointment dates will be announced here.</p><p className="body-copy">To discuss a custom piece before the calendar opens, get in touch by email or Instagram.</p><a className="text-link" href="#contact">Contact Praew <span aria-hidden="true">&#8595;</span></a></div>
          </div>
        </section>
        <section id="contact" className="contact section-frame" aria-labelledby="contact-title"><p className="eyebrow">Contact</p><h2 id="contact-title">Start with a conversation.</h2><a className="contact-email" href="mailto:hello@praew.tattoos">hello@praew.tattoos</a><p className="body-copy">For custom work, include your idea, preferred placement, and size.</p></section>
      </main>
      <footer className="site-footer"><span>Praew Tattoos</span><span>Bangkok, Thailand</span><span>&copy; 2026</span></footer>
    </div>
  );
}
