import InstagramFeed from "@/components/InstagramFeed";
import {
  INSTAGRAM_PROFILE_URL,
  SITE_EMAIL,
  WHATSAPP_NUMBER,
  WHATSAPP_URL,
} from "@/constants/site";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="contact section-frame"
      aria-labelledby="contact-title"
    >
      <p className="eyebrow">Contact</p>
      <h2 id="contact-title">Start with a conversation.</h2>
      <a className="contact-email" href={`mailto:${SITE_EMAIL}`}>
        {SITE_EMAIL}
      </a>
      <p className="body-copy">
        For custom work, include your idea, preferred placement, and size.
      </p>
      <div className="instagram-profile">
        <div className="instagram-avatar" aria-hidden="true">
          P
        </div>
        <div className="instagram-profile-copy">
          <p className="eyebrow">Instagram profile</p>
          <h3>@praew.tattoos</h3>
          <p>Fine-line tattoo artist in Bangkok, Thailand.</p>
        </div>
        <div className="instagram-profile-actions">
          <a
            className="instagram-profile-link"
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
          >
            View profile <span aria-hidden="true">&#8599;</span>
          </a>
          <a
            className="instagram-profile-link"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp {WHATSAPP_NUMBER} <span aria-hidden="true">&#8599;</span>
          </a>
        </div>
      </div>
      <div className="contact-divider">
        <InstagramFeed />
      </div>
    </section>
  );
}
