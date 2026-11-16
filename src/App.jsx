import React, { useEffect, useState, useSyncExternalStore } from 'react';
import cassava from '../cassava.jpeg';
import eaga from '../eaga.jpeg';
import fence from '../fence.jpeg';
import leaf from '../leaf.jpeg';
import pep from '../pep.jpeg';
import pepper from '../pepper.jpeg';
import potato from '../pota plant.jpeg';
import brandPoster from '../sample.jpeg';
import vegetables from '../vege.jpeg';
import brandLogo from '../WhatsApp logo.jpeg';
import harvest from '../WhatsApp Image 2026-11-15 at 1.32.26 PM.jpeg';
import greens from '../WhatsApp Image 2026-11-15 at 1.32.27 PM.jpeg';

const routes = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/projects', label: 'Our work' },
  { path: '/contact', label: 'Contact' },
];

const socialLinks = [
  { name: 'YouTube', href: 'https://youtube.com/@richjeremiah5590?si=shS1aZbA-12VCCOA' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@richypvj5?_r=1&_t=ZS-9BQlbsszK0v' },
  { name: 'Instagram', href: 'https://www.instagram.com/imo_owo_?vrfl=MXAzdXV0eWx2cHc2Yg==' },
  { name: 'X', href: 'https://x.com/rich_jerem5384' },
  { name: 'Telegram', href: 'https://t.me/Richypvj' },
  { name: 'Facebook', href: 'https://www.facebook.com/share/19dAVJ1UY6/' },
];

const serviceItems = [
  {
    number: '01',
    title: 'Smart agriculture',
    text: 'Practical farming and agribusiness support, rooted in sustainable growing and local opportunity.',
    tag: 'Farming & agribusiness',
  },
  {
    number: '02',
    title: 'Digital services',
    text: 'Thoughtful technology services, software, apps and online tools that help ideas move forward.',
    tag: 'Technology & tools',
  },
  {
    number: '03',
    title: 'Training & advisory',
    text: 'Accessible training, consulting and guidance for people building skills across the agriculture value chain.',
    tag: 'Learning & support',
  },
  {
    number: '04',
    title: 'Business development',
    text: 'Investment, venture and partnership support to help promising ideas create lasting value.',
    tag: 'Ventures & partnerships',
  },
];

const projects = [
  { title: 'Cassava in the field', category: 'Root crops', image: cassava, alt: 'Young cassava plants growing among lush green leaves' },
  { title: 'A harvest of greens', category: 'Fresh produce', image: harvest, alt: 'Recently harvested leafy greens laid out together' },
  { title: 'Pepper harvest', category: 'Vegetable crops', image: pepper, alt: 'Fresh yellow, orange and red peppers from the farm' },
  { title: 'Growing with care', category: 'Crop cultivation', image: vegetables, alt: 'Healthy vegetable plants growing in a small farm plot' },
  { title: 'Leaf by leaf', category: 'Farm life', image: leaf, alt: 'Close view of leafy crops growing in the field' },
  { title: 'Plants with potential', category: 'Crop cultivation', image: potato, alt: 'Young green plants thriving in rich soil' },
  { title: 'From farm to table', category: 'Fresh produce', image: greens, alt: 'Freshly gathered green leaves ready for market' },
  { title: 'A growing landscape', category: 'Farm spaces', image: fence, alt: 'Green crop rows beside a farm boundary' },
  { title: 'Pepper plants in progress', category: 'Vegetable crops', image: pep, alt: 'Pepper plants growing with young yellow fruit in the field' },
];

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return routes.some((route) => route.path === path) ? path : '/not-found';
}

function subscribe(callback) {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

function Link({ href, children, className = '', onClick, ...rest }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) return;
        event.preventDefault();
        window.history.pushState({}, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'auto' });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

function Brand({ inverse = false }) {
  return (
    <Link href="/" className={`brand${inverse ? ' brand--inverse' : ''}`} aria-label="Greenfarm & Tech Ventures — home">
      <img className="brand__logo" src={brandLogo} alt="" />
    </Link>
  );
}

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true" className={`arrow${diagonal ? ' arrow--diagonal' : ''}`}>↗</span>;
}

function Header({ path }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [path]);

  return (
    <header className="site-header">
      <div className="topline">
        <span>Grow green. Think digital. Create value.</span>
        <Link href="/contact">Let’s build something together <Arrow /></Link>
      </div>
      <div className="nav-wrap">
        <Brand />
        <button
          className={`menu-toggle${menuOpen ? ' is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
        <nav id="primary-navigation" className={`primary-nav${menuOpen ? ' primary-nav--open' : ''}`} aria-label="Main navigation">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={`nav-link${path === route.path ? ' nav-link--active' : ''}`}
              aria-current={path === route.path ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {route.label}
            </Link>
          ))}
          <Link href="/contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
            Get in touch <Arrow />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Brand inverse />
          <p>Growing agriculture, advancing technology, creating opportunities.</p>
        </div>
        <div className="footer-nav">
          <span className="eyebrow eyebrow--light">Explore</span>
          {routes.slice(1).map((route) => <Link key={route.path} href={route.path}>{route.label}</Link>)}
        </div>
        <div className="footer-connect">
          <span className="eyebrow eyebrow--light">Start a conversation</span>
          <a href="https://wa.me/2348060379022" target="_blank" rel="noreferrer">WhatsApp us <Arrow /></a>
          <p>Let’s grow a smarter, greener future—together.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Greenfarm &amp; Tech Ventures</span>
        <span>Rooted in agriculture. Open to what’s next.</span>
      </div>
    </footer>
  );
}

function PageIntro({ label, title, copy, image }) {
  return (
    <section className={`page-intro${image ? ' page-intro--image' : ''}`} style={image ? { '--intro-image': `url("${image}")` } : undefined}>
      <div className="page-intro__inner">
        <span className="eyebrow eyebrow--light">{label}</span>
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      <span className="page-intro__index" aria-hidden="true">GF / 2026</span>
    </section>
  );
}

function SectionHeading({ eyebrow, title, copy, light = false }) {
  return (
    <div className={`section-heading${light ? ' section-heading--light' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function ServiceRows({ compact = false }) {
  return (
    <div className={`service-list${compact ? ' service-list--compact' : ''}`}>
      {serviceItems.map((service) => (
        <article className="service-row" key={service.number}>
          <span className="service-row__number">{service.number}</span>
          <div className="service-row__content">
            <h3>{service.title}</h3>
            <p>{service.text}</p>
          </div>
          <span className="service-row__tag">{service.tag}</span>
          <Arrow />
        </article>
      ))}
    </div>
  );
}

function HomePage() {
  return (
    <>
      <main>
        <section className="home-hero">
          <div className="home-hero__photo" role="img" aria-label="A green farm plot filled with growing crops" style={{ backgroundImage: `url("${eaga}")` }} />
          <div className="home-hero__shade" />
          <div className="home-hero__content">
            <span className="hero-kicker"><span className="status-dot" /> Agribusiness, with a forward view</span>
            <h1>Growing agriculture.<br />Advancing <em>technology.</em><br />Creating opportunities.</h1>
            <div className="home-hero__bottom">
              <p>We bring people, practical innovation and the promise of the land together to grow a more sustainable future.</p>
              <Link href="/contact" className="button button--lime">Let’s grow together <Arrow /></Link>
            </div>
          </div>
          <div className="home-hero__caption"><span>01 — The work begins with the soil</span><span>Nigeria · Agriculture × Technology</span></div>
          <div className="hero-mark" aria-hidden="true">G<span>+</span></div>
        </section>

        <section className="mission-band">
          <span className="mission-band__label">Our north star</span>
          <p>Better farming. Useful technology.<br /><strong>More room for people to thrive.</strong></p>
          <Link href="/about" className="text-link">Get to know us <Arrow /></Link>
        </section>

        <section className="section services-preview section-pad">
          <div className="section-topline">
            <SectionHeading
              eyebrow="What we do"
              title={<>Grounded in the field.<br /><em>Ready for what’s next.</em></>}
              copy="From the first idea to a thriving enterprise, we connect agricultural know-how with the tools and support to make progress possible."
            />
            <Link href="/services" className="round-link" aria-label="Explore all services"><Arrow diagonal /></Link>
          </div>
          <ServiceRows compact />
        </section>

        <section className="field-note">
          <div className="field-note__image">
            <img src={greens} alt="Harvested leafy vegetables gathered after a day in the field" loading="lazy" />
            <span className="image-note">Grown with intention <span>↗</span></span>
          </div>
          <div className="field-note__copy">
            <span className="eyebrow eyebrow--light">The Greenfarm approach</span>
            <h2>Progress that<br /><em>starts where we are.</em></h2>
            <p>We believe the future of agriculture is built by listening, learning and making useful things accessible. Our work starts with local context—and keeps people at the centre.</p>
            <Link href="/about" className="button button--outline-light">Our story <Arrow /></Link>
            <span className="field-note__scribble" aria-hidden="true">grow<br />together</span>
          </div>
        </section>

        <section className="section work-preview section-pad">
          <div className="section-topline">
            <SectionHeading
              eyebrow="On the ground"
              title={<>Small moments.<br /><em>Meaningful growth.</em></>}
              copy="A glimpse of the crops, care and everyday work that inspire what we do."
            />
            <Link href="/projects" className="text-link">See our work <Arrow /></Link>
          </div>
          <div className="home-gallery">
            <Link href="/projects" className="home-gallery__large">
              <img src={cassava} alt="Cassava leaves thriving in a green field" loading="lazy" />
              <span className="gallery-label"><span>01 / Root crops</span><strong>Good things take root.</strong></span>
            </Link>
            <Link href="/projects" className="home-gallery__small">
              <img src={pepper} alt="Fresh peppers collected from the farm" loading="lazy" />
              <span className="gallery-label"><span>02 / Harvest</span><strong>Fresh from the field.</strong></span>
            </Link>
          </div>
        </section>

        <section className="closing-cta">
          <div className="closing-cta__orb" aria-hidden="true">GF<br /><span>+</span></div>
          <span className="eyebrow eyebrow--light">There’s room to grow</span>
          <h2>Have an idea<br />taking <em>root?</em></h2>
          <Link href="/contact" className="button button--lime">Let’s talk about it <Arrow /></Link>
        </section>
      </main>
    </>
  );
}

function AboutPage() {
  return (
    <main>
      <PageIntro
        label="About Greenfarm"
        title={<>Rooted in possibility.<br /><em>Growing with purpose.</em></>}
        copy="We’re an African agribusiness and agri-technology venture connecting sustainable agriculture, practical digital innovation and accessible opportunity."
        image={harvest}
      />
      <section className="about-story section-pad">
        <div className="about-story__lead">
          <span className="eyebrow">Our story</span>
          <h2>We see potential<br />in <em>every seed.</em></h2>
        </div>
        <div className="about-story__body">
          <p className="lead-copy">Greenfarm &amp; Tech Ventures exists at the meeting point of agriculture and technology—where a better way of growing can open doors for people and communities.</p>
          <p>Our work is shaped by the belief that innovation should be useful, inclusive and grounded in real needs. We bring together farming, digital services, learning and business development to help ideas take shape and grow.</p>
          <Link href="/services" className="text-link">Explore what we do <Arrow /></Link>
        </div>
      </section>
      <section className="purpose-section">
        <div className="purpose-section__poster">
          <img src={brandPoster} alt="Greenfarm & Tech Ventures brand poster showing its vision, mission and service areas" loading="lazy" />
          <span className="poster-caption">A greener, smarter and more prosperous tomorrow.</span>
        </div>
        <div className="purpose-section__content">
          <span className="eyebrow eyebrow--light">What guides us</span>
          <h2>Grow green.<br /><em>Think digital.</em><br />Create value.</h2>
          <div className="purpose-rows">
            <article><span>Our vision</span><p>To be a leading integrated agritech enterprise in Africa and beyond.</p></article>
            <article><span>Our mission</span><p>To promote sustainable agriculture through innovative technology, creating lasting value for our people.</p></article>
            <article><span>Our objectives</span><p>Boost agricultural productivity, drive digital innovation, create opportunity and contribute to food security and economic growth.</p></article>
          </div>
        </div>
      </section>
      <section className="values-strip section-pad">
        <SectionHeading eyebrow="Our point of view" title={<>Good growth is<br /><em>growth we share.</em></>} />
        <div className="values-list">
          <div><span>01</span><h3>Rooted</h3><p>We begin with people, place and the realities of the field.</p></div>
          <div><span>02</span><h3>Resourceful</h3><p>We look for practical ways to turn challenges into possibility.</p></div>
          <div><span>03</span><h3>Open-minded</h3><p>We connect agriculture with technology and ideas with action.</p></div>
        </div>
      </section>
      <CtaStrip />
    </main>
  );
}

function ServicesPage() {
  return (
    <main>
      <PageIntro
        label="Our services"
        title={<>From fieldwork to<br /><em>future-ready ideas.</em></>}
        copy="A connected set of services for people, farms and businesses ready to grow with purpose."
      />
      <section className="services-page section-pad">
        <div className="services-page__intro">
          <span className="eyebrow">Ways we can work together</span>
          <p>Our work spans the whole journey: growing sustainably, using technology with intention, building skills and developing lasting ventures.</p>
        </div>
        <ServiceRows />
      </section>
      <section className="service-detail-band">
        <div className="service-detail-band__image">
          <img src={eaga} alt="Rows of crops flourishing in a farm space" loading="lazy" />
          <span className="image-note">The future is cultivated <span>↗</span></span>
        </div>
        <div className="service-detail-band__content">
          <span className="eyebrow eyebrow--light">A connected approach</span>
          <h2>One idea can<br />grow into <em>many.</em></h2>
          <p>Whether you’re exploring a farm project, a digital solution, a training opportunity or a new partnership, we’re here to help you find a thoughtful next step.</p>
          <Link href="/contact" className="button button--lime">Talk with our team <Arrow /></Link>
        </div>
      </section>
      <CtaStrip />
    </main>
  );
}

function ProjectsPage() {
  return (
    <main>
      <PageIntro
        label="Our work"
        title={<>A closer look at<br /><em>what’s growing.</em></>}
        copy="A visual journal of the crops, harvests and farm spaces that keep us inspired. Every image is from our supplied local collection."
      />
      <section className="projects-section section-pad">
        <div className="projects-intro">
          <span className="eyebrow">Field notes / 2026</span>
          <p>Real glimpses of growing and gathering—shared without the noise, and without the numbers.</p>
        </div>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <figure className={`project-tile project-tile--${index + 1}`} key={project.title}>
              <div className="project-tile__image">
                <img src={project.image} alt={project.alt} loading="lazy" />
                <span className="project-tile__number">0{index + 1}</span>
              </div>
              <figcaption><span>{project.category}</span><strong>{project.title}</strong></figcaption>
            </figure>
          ))}
        </div>
      </section>
      <CtaStrip />
    </main>
  );
}

function ContactPage() {
  return (
    <main>
      <PageIntro
        label="Get in touch"
        title={<>Good things grow<br /><em>when we connect.</em></>}
        copy="Have a question, a project in mind or an idea you’d like to explore? We’d love to hear from you."
        image={eaga}
      />
      <section className="contact-section section-pad">
        <div className="contact-copy">
          <span className="eyebrow">Let’s start here</span>
          <h2>Tell us what<br />you’re <em>growing.</em></h2>
          <p>Reach out on WhatsApp for a direct conversation. Or find us across the social channels below.</p>
          <a className="contact-method" href="https://wa.me/2348060379022" target="_blank" rel="noreferrer">
            <span className="contact-method__icon" aria-hidden="true">W</span>
            <span><small>Message us on WhatsApp</small><strong>+234 806 037 9022</strong></span>
            <Arrow />
          </a>
          <a className="contact-method contact-method--email" href="mailto:greenfarmtechv@gmail.com">
            <span className="contact-method__icon" aria-hidden="true">@</span>
            <span><small>Email us</small><strong>greenfarmtechv@gmail.com</strong></span>
            <Arrow />
          </a>
          <div className="contact-note"><span className="contact-note__dot" /> We’re always open to a thoughtful conversation.</div>
        </div>
        <div className="social-panel">
          <span className="eyebrow eyebrow--light">Find your way to us</span>
          <h3>Follow along<br /><em>as we grow.</em></h3>
          <p>Updates, ideas and a closer look at life across agriculture and technology.</p>
          <div className="social-list">
            {socialLinks.map((social, index) => (
              <a key={social.name} href={social.href} target="_blank" rel="noreferrer">
                <span>0{index + 1}</span><strong>{social.name}</strong><Arrow diagonal />
              </a>
            ))}
            <a href="https://wa.me/2348060379022" target="_blank" rel="noreferrer">
              <span>07</span><strong>WhatsApp</strong><Arrow diagonal />
            </a>
          </div>
        </div>
      </section>
      <section className="contact-bottom">
        <span className="eyebrow">Greenfarm &amp; Tech Ventures</span>
        <p>Growing agriculture, advancing technology, creating opportunities.</p>
        <Link href="/" className="text-link">Back to home <Arrow /></Link>
      </section>
    </main>
  );
}

function CtaStrip() {
  return (
    <section className="cta-strip">
      <div><span className="eyebrow eyebrow--light">Make the next move</span><h2>Let’s make room<br />for <em>good growth.</em></h2></div>
      <Link href="/contact" className="button button--lime">Get in touch <Arrow /></Link>
    </section>
  );
}

function NotFoundPage() {
  return (
    <main className="not-found section-pad">
      <span className="eyebrow">404 / Off the path</span>
      <h1>This page hasn’t<br />taken <em>root.</em></h1>
      <p>The page you’re looking for may have moved. Let’s get you back to familiar ground.</p>
      <Link href="/" className="button button--green">Back to home <Arrow /></Link>
    </main>
  );
}

export default function App() {
  const path = useSyncExternalStore(subscribe, currentPath, () => '/');

  useEffect(() => {
    const active = routes.find((route) => route.path === path);
    document.title = active && path !== '/'
      ? `${active.label === 'Our work' ? 'Our Work' : active.label} | Greenfarm & Tech Ventures`
      : 'Greenfarm & Tech Ventures | Growing Agriculture, Advancing Technology';
  }, [path]);

  const pages = {
    '/': <HomePage />,
    '/about': <AboutPage />,
    '/services': <ServicesPage />,
    '/projects': <ProjectsPage />,
    '/contact': <ContactPage />,
    '/not-found': <NotFoundPage />,
  };

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header path={path} />
      <div id="main-content" tabIndex="-1">{pages[path] || <NotFoundPage />}</div>
      <Footer />
      <a className="whatsapp-float" href="https://wa.me/2348060379022" target="_blank" rel="noreferrer" aria-label="Chat with Greenfarm on WhatsApp">
        <span aria-hidden="true">W</span><span>WhatsApp</span>
      </a>
    </>
  );
}
