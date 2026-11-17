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
import ceoPortrait from '../WhatsApp Image 2026-11-16 at 6.08.12 PM.jpeg';

const initialProfile = {
  name: 'Rich Victor Jeremiah',
  title: 'Chief Executive Officer',
  bio: 'Rich Victor Jeremiah leads Greenfarm & Tech Ventures at the meeting point of agriculture and technology. His work is guided by practical innovation, sustainable growth and creating opportunity for people and communities.',
};

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
  { title: 'vegetable plant in progress', category: 'Fresh produce', image: harvest, alt: 'Recently harvested leafy greens laid out together' },
  { title: 'Pepper and okoro harvest', category: 'Vegetable crops', image: pepper, alt: 'Fresh yellow, orange and red peppers from the farm' },
  { title: 'Growing with care', category: 'Crop cultivation', image: vegetables, alt: 'Healthy vegetable plants growing in a small farm plot' },
  { title: 'vegetables harvest', category: 'Farm life', image: leaf, alt: 'Close view of leafy crops growing in the field' },
  { title: 'sweet potato in progress', category: 'potato  cultivation', image: potato, alt: 'Young green plants thriving in rich soil' },
  { title: 'From farm to table', category: 'saintleaf(adusirleaf)', image: greens, alt: 'Freshly gathered green leaves ready for market' },
  { title: 'vegetable plant', category: 'Farm spaces', image: fence, alt: 'Green crop rows beside a farm boundary' },
  { title: 'Pepper plants in progress', category: 'Vegetable crops', image: pep, alt: 'Pepper plants growing with young yellow fruit in the field' },
];

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/admin') return path;
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
          <Link
            href="/admin"
            className={`nav-admin${path === '/admin' ? ' nav-admin--active' : ''}`}
            aria-current={path === '/admin' ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Admin <Arrow />
          </Link>
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

function workPhotoUrl(work) {
  return `/api/work/${encodeURIComponent(work.id)}/photo?v=${encodeURIComponent(work.imageVersion)}`;
}

function usePublicWork() {
  const [work, setWork] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/work')
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Unable to load managed work.');
        if (!Array.isArray(result.work)) throw new Error('The managed work response was not valid.');
        return result.work;
      })
      .then((entries) => {
        if (active && Array.isArray(entries)) setWork(entries);
      })
      .catch(() => {
        if (active) setError('Managed work is temporarily unavailable; showing the published collection.');
      });
    return () => { active = false; };
  }, []);

  return { work, error };
}

function HomePage() {
  const { work } = usePublicWork();
  const recentWork = work.slice(0, 2);

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
            {recentWork.length ? recentWork.map((entry, index) => (
              <Link key={entry.id} href="/projects" className={index === 0 ? 'home-gallery__large' : 'home-gallery__small'}>
                <img src={workPhotoUrl(entry)} alt={entry.alt} loading="lazy" />
                <span className="gallery-label"><span>{String(index + 1).padStart(2, '0')} / {entry.category}</span><strong>{entry.title}</strong></span>
              </Link>
            )) : (
              <>
                <Link href="/projects" className="home-gallery__large">
                  <img src={cassava} alt="Cassava leaves thriving in a green field" loading="lazy" />
                  <span className="gallery-label"><span>01 / Root crops</span><strong>Good things take root.</strong></span>
                </Link>
                <Link href="/projects" className="home-gallery__small">
                  <img src={pepper} alt="Fresh peppers collected from the farm" loading="lazy" />
                  <span className="gallery-label"><span>02 / Harvest</span><strong>Fresh from the field.</strong></span>
                </Link>
              </>
            )}
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
      <CeoProfile />
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

function usePublicProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/profile')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load the CEO profile');
        return response.json();
      })
      .then((data) => {
        if (active) setProfile({ ...initialProfile, ...data });
      })
      .catch(() => {
        if (active) setError('Live profile updates are temporarily unavailable; showing the default profile.');
      });
    return () => { active = false; };
  }, []);

  return { profile, error };
}

function CeoProfile() {
  const { profile, error } = usePublicProfile();
  const portrait = profile.photoVersion
    ? `/api/profile/photo?v=${encodeURIComponent(profile.photoVersion)}`
    : ceoPortrait;

  return (
    <section className="ceo-section" aria-labelledby="ceo-heading">
      <div className="ceo-section__photo">
        <img src={portrait} alt={`Portrait of ${profile.name}`} loading="lazy" />
        <span className="ceo-section__photo-note">Leadership / Greenfarm</span>
      </div>
      <div className="ceo-section__content">
        <span className="eyebrow eyebrow--light">The person behind the vision</span>
        <h2 id="ceo-heading">{profile.name}</h2>
        <p className="ceo-section__title">{profile.title}</p>
        <p className="ceo-section__bio">{profile.bio}</p>
        {error && <p className="ceo-section__notice" role="status">{error}</p>}
        <span className="ceo-section__signature" aria-hidden="true">Rooted in possibility.</span>
      </div>
    </section>
  );
}

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [profile, setProfile] = useState(null);
  const [savedProfile, setSavedProfile] = useState(null);
  const [password, setPassword] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [managedWork, setManagedWork] = useState([]);
  const [workLoading, setWorkLoading] = useState(true);
  const [workBusy, setWorkBusy] = useState(false);
  const [workError, setWorkError] = useState('');
  const [workMessage, setWorkMessage] = useState('');
  const [editingWork, setEditingWork] = useState(null);
  const [workDraft, setWorkDraft] = useState({ title: '', category: '', alt: '' });
  const [workFile, setWorkFile] = useState(null);
  const [workPreview, setWorkPreview] = useState('');

  async function refreshManagedWork() {
    setWorkLoading(true);
    try {
      const response = await fetch('/api/work');
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Managed work could not be loaded.');
      if (!Array.isArray(result.work)) throw new Error('The managed work response was not valid.');
      setManagedWork(result.work);
      setWorkError('');
    } catch (cause) {
      setWorkError(cause.message || 'Managed work could not be loaded.');
    } finally {
      setWorkLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch('/api/admin/session')
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then(async (session) => {
        if (!active) return;
        if (!session?.authenticated) {
          setWorkLoading(false);
          return;
        }
        setAuthenticated(true);
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Your profile could not be loaded. Please try again.');
        const data = await response.json();
        if (active) {
          setProfile(data);
          setSavedProfile(data);
        }
        await refreshManagedWork();
      })
      .catch((cause) => {
        if (active) setError(cause.message || 'The profile service is unavailable.');
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  useEffect(() => () => {
    if (workPreview.startsWith('blob:')) URL.revokeObjectURL(workPreview);
  }, [workPreview]);

  const photoUrl = photoPreview || (profile?.photoVersion
    ? `/api/profile/photo?v=${encodeURIComponent(profile.photoVersion)}`
    : ceoPortrait);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sign in failed.');
      setAuthenticated(true);
      setPassword('');
      const profileResponse = await fetch('/api/profile');
      if (!profileResponse.ok) throw new Error('Your profile could not be loaded.');
      const data = await profileResponse.json();
      setProfile(data);
      setSavedProfile(data);
      await refreshManagedWork();
    } catch (cause) {
      setError(cause.message || 'The profile service is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG or WebP image.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('The portrait must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    event.target.value = '';
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!profile) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const payload = { name: profile.name, title: profile.title, bio: profile.bio };
      if (photoFile) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('The portrait could not be read.'));
          reader.readAsDataURL(photoFile);
        });
        payload.photo = dataUrl.split(',')[1];
        payload.photoType = photoFile.type;
      }
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your changes could not be saved.');
      setProfile(result.profile);
      setSavedProfile(result.profile);
      setPhotoFile(null);
      setPhotoPreview('');
      setMessage('Your profile has been saved.');
    } catch (cause) {
      setError(cause.message || 'Your changes could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    if (!savedProfile) return;
    setProfile(savedProfile);
    setPhotoFile(null);
    setPhotoPreview('');
    setError('');
    setMessage('Unsaved changes were discarded.');
  }

  function resetWorkForm() {
    setEditingWork(null);
    setWorkDraft({ title: '', category: '', alt: '' });
    setWorkFile(null);
    setWorkPreview('');
    setWorkError('');
    setWorkMessage('');
  }

  function handleWorkFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setWorkError('Choose a JPG, PNG or WebP image.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setWorkError('The work photo must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setWorkError('');
    setWorkMessage('');
    setWorkFile(file);
    setWorkPreview(URL.createObjectURL(file));
    event.target.value = '';
  }

  async function handleWorkSave(event) {
    event.preventDefault();
    setWorkBusy(true);
    setWorkError('');
    setWorkMessage('');
    try {
      const payload = { ...workDraft };
      if (workFile) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('The work photo could not be read.'));
          reader.readAsDataURL(workFile);
        });
        payload.photo = dataUrl.split(',')[1];
        payload.photoType = workFile.type;
      }
      const response = await fetch(editingWork ? `/api/admin/work/${encodeURIComponent(editingWork)}` : '/api/admin/work', {
        method: editingWork ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'The work entry could not be saved.');
      if (editingWork) {
        setManagedWork((entries) => entries.map((entry) => entry.id === editingWork ? result.work : entry)
          .sort((left, right) => right.createdAt - left.createdAt));
      } else {
        setManagedWork((entries) => [result.work, ...entries]);
      }
      resetWorkForm();
      setWorkMessage(editingWork ? 'Work entry updated.' : 'Work entry published.');
    } catch (cause) {
      setWorkError(cause.message || 'The work entry could not be saved.');
    } finally {
      setWorkBusy(false);
    }
  }

  function startWorkEdit(entry) {
    setEditingWork(entry.id);
    setWorkDraft({ title: entry.title, category: entry.category, alt: entry.alt });
    setWorkFile(null);
    setWorkPreview(workPhotoUrl(entry));
    setWorkError('');
    setWorkMessage('');
  }

  async function handleWorkDelete(entry) {
    if (!window.confirm(`Delete “${entry.title}” from the work gallery?`)) return;
    setWorkBusy(true);
    setWorkError('');
    setWorkMessage('');
    try {
      const response = await fetch(`/api/admin/work/${encodeURIComponent(entry.id)}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'The work entry could not be deleted.');
      setManagedWork((entries) => entries.filter((item) => item.id !== entry.id));
      if (editingWork === entry.id) resetWorkForm();
      setWorkMessage('Work entry deleted.');
    } catch (cause) {
      setWorkError(cause.message || 'The work entry could not be deleted.');
    } finally {
      setWorkBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (!response.ok) throw new Error('You could not be signed out. Please try again.');
      setAuthenticated(false);
      setProfile(null);
      setSavedProfile(null);
      setManagedWork([]);
      resetWorkForm();
      setMessage('You have signed out.');
    } catch (cause) {
      setError(cause.message || 'You could not be signed out. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-page__masthead">
        <span className="eyebrow">Greenfarm / Site management</span>
        <Link href="/" className="text-link">Return to website <Arrow /></Link>
      </div>
      <section className={`admin-panel${authenticated ? ' admin-panel--editor' : ''}`}>
        {checkingSession ? (
          <div className="admin-state" role="status">
            <span className="status-dot" /> Checking your session…
          </div>
        ) : !authenticated ? (
          <div className="admin-login">
            <div className="admin-login__intro">
              <span className="eyebrow eyebrow--light">Private access</span>
              <h1>A good profile<br /><em>starts with you.</em></h1>
              <p>Sign in to keep the leadership story current. Your edits are saved to the Greenfarm profile service.</p>
              <span className="admin-login__mark" aria-hidden="true">GF<span>+</span></span>
            </div>
            <form className="admin-form admin-form--login" onSubmit={handleLogin}>
              <div>
                <span className="eyebrow">Administrator</span>
                <h2>Welcome back.</h2>
                <p>Enter your administrator password to continue.</p>
              </div>
              <label className="admin-field">
                <span>Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error && <p className="admin-alert" role="alert">{error}</p>}
              {message && <p className="admin-success" role="status">{message}</p>}
              <button className="button button--lime admin-submit" type="submit" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'} <Arrow />
              </button>
              <p className="admin-form__note">Access is protected and available to authorised site administrators only.</p>
            </form>
          </div>
        ) : profile ? (
          <div className="admin-editor">
            <div className="admin-editor__heading">
              <div>
                <span className="eyebrow">Public profile</span>
                <h1>Leadership, <em>in your words.</em></h1>
                <p>Update how the Greenfarm community meets its CEO on the About page.</p>
              </div>
              <button className="admin-logout" type="button" onClick={handleLogout} disabled={busy}>Sign out</button>
            </div>
            <form className="admin-editor__grid" onSubmit={handleSave}>
              <div className="admin-photo">
                <img src={photoUrl} alt="Current CEO portrait preview" />
                <label className="admin-photo__button">
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
                  <span>Choose a portrait</span><Arrow />
                </label>
                <p>JPG, PNG or WebP · up to 5 MB</p>
              </div>
              <div className="admin-fields">
                <label className="admin-field">
                  <span>Name</span>
                  <input
                    type="text"
                    maxLength="100"
                    value={profile.name || ''}
                    onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Title</span>
                  <input
                    type="text"
                    maxLength="100"
                    value={profile.title || ''}
                    onChange={(event) => setProfile({ ...profile, title: event.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Introduction <small>{(profile.bio || '').length}/1000</small></span>
                  <textarea
                    rows="6"
                    maxLength="1000"
                    value={profile.bio || ''}
                    onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
                    required
                  />
                </label>
                {error && <p className="admin-alert" role="alert">{error}</p>}
                {message && <p className="admin-success" role="status">{message}</p>}
                <div className="admin-actions">
                  <button className="button button--green" type="submit" disabled={busy}>
                    {busy ? 'Saving…' : 'Save changes'} <Arrow />
                  </button>
                  <button className="admin-cancel" type="button" onClick={handleCancel} disabled={busy}>Cancel</button>
                </div>
              </div>
            </form>
            <section className="admin-work" aria-labelledby="admin-work-heading">
              <div className="admin-work__heading">
                <div>
                  <span className="eyebrow">Published gallery</span>
                  <h2 id="admin-work-heading">Work from the field.</h2>
                  <p>Add new work for the public gallery. Recent entries also appear on the home page.</p>
                </div>
                {editingWork && <span className="admin-work__editing">Editing entry</span>}
              </div>
              <form className="admin-work__form" onSubmit={handleWorkSave}>
                <div className="admin-work__form-fields">
                  <label className="admin-field">
                    <span>Title <small>{workDraft.title.length}/100</small></span>
                    <input
                      type="text"
                      maxLength="100"
                      value={workDraft.title}
                      onChange={(event) => setWorkDraft({ ...workDraft, title: event.target.value })}
                      required
                    />
                  </label>
                  <label className="admin-field">
                    <span>Category <small>{workDraft.category.length}/80</small></span>
                    <input
                      type="text"
                      maxLength="80"
                      value={workDraft.category}
                      onChange={(event) => setWorkDraft({ ...workDraft, category: event.target.value })}
                      required
                    />
                  </label>
                  <label className="admin-field admin-work__description">
                    <span>Accessible image description <small>{workDraft.alt.length}/240</small></span>
                    <textarea
                      rows="3"
                      maxLength="240"
                      value={workDraft.alt}
                      onChange={(event) => setWorkDraft({ ...workDraft, alt: event.target.value })}
                      required
                    />
                  </label>
                </div>
                <div className="admin-work__upload">
                  {workPreview ? (
                    <img src={workPreview} alt={workFile ? 'Selected work photo preview' : 'Current work photo'} />
                  ) : (
                    <div className="admin-work__placeholder" aria-hidden="true"><span>GF</span><small>Work photo preview</small></div>
                  )}
                  <label className="admin-photo__button">
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleWorkFileChange} required={!editingWork && !workFile} />
                    <span>{workFile ? 'Choose a different photo' : editingWork ? 'Replace photo (optional)' : 'Choose a work photo'}</span><Arrow />
                  </label>
                  <p>JPG, PNG or WebP · up to 5 MB</p>
                  {!editingWork && <p className="admin-work__required">A photo is required to publish.</p>}
                </div>
                <div className="admin-work__controls">
                  {workError && <p className="admin-alert" role="alert">{workError}</p>}
                  {workMessage && <p className="admin-success" role="status">{workMessage}</p>}
                  <div className="admin-actions">
                    <button className="button button--green" type="submit" disabled={workBusy}>
                      {workBusy ? 'Saving…' : editingWork ? 'Save work entry' : 'Publish work entry'} <Arrow />
                    </button>
                    {editingWork && <button className="admin-cancel" type="button" onClick={resetWorkForm} disabled={workBusy}>Cancel edit</button>}
                  </div>
                </div>
              </form>
              <div className="admin-work__list-heading">
                <h3>Managed entries <span>{managedWork.length}</span></h3>
                {workLoading && <span role="status">Loading work…</span>}
              </div>
              {!workLoading && !managedWork.length ? (
                <p className="admin-work__empty">No managed entries yet. The public gallery will continue to show its existing collection.</p>
              ) : (
                <div className="admin-work__list">
                  {managedWork.map((entry) => (
                    <article className="admin-work-item" key={entry.id}>
                      <img src={workPhotoUrl(entry)} alt="" />
                      <div className="admin-work-item__details">
                        <span>{entry.category}</span>
                        <h4>{entry.title}</h4>
                        <p>{entry.alt}</p>
                      </div>
                      <div className="admin-work-item__actions">
                        <button type="button" onClick={() => startWorkEdit(entry)} disabled={workBusy}>Edit</button>
                        <button type="button" onClick={() => handleWorkDelete(entry)} disabled={workBusy}>Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="admin-state">
            {error || 'The profile could not be loaded.'}
            <button type="button" className="admin-retry" onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}
      </section>
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
  const { work: managedWork, error } = usePublicWork();
  const galleryProjects = [
    ...projects,
    ...managedWork.map((entry) => ({
      id: entry.id,
      title: entry.title,
      category: entry.category,
      image: workPhotoUrl(entry),
      alt: entry.alt,
    })),
  ];

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
        {error && <p className="projects-notice" role="status">{error}</p>}
        <div className="projects-grid">
          {galleryProjects.map((project, index) => (
            <figure className={`project-tile project-tile--${index + 1}`} key={project.id || project.title}>
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
    document.title = path === '/admin'
      ? 'Admin | Greenfarm & Tech Ventures'
      : active && path !== '/'
      ? `${active.label === 'Our work' ? 'Our Work' : active.label} | Greenfarm & Tech Ventures`
      : 'Greenfarm & Tech Ventures | Growing Agriculture, Advancing Technology';
  }, [path]);

  const pages = {
    '/': <HomePage />,
    '/about': <AboutPage />,
    '/services': <ServicesPage />,
    '/projects': <ProjectsPage />,
    '/contact': <ContactPage />,
    '/admin': <AdminPage />,
    '/not-found': <NotFoundPage />,
  };

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header path={path} />
      <div id="main-content" tabIndex="-1">{pages[path] || <NotFoundPage />}</div>
      <Footer />
      {path !== '/admin' && (
        <a className="whatsapp-float" href="https://wa.me/2348060379022" target="_blank" rel="noreferrer" aria-label="Chat with Greenfarm on WhatsApp">
          <span aria-hidden="true">W</span><span>WhatsApp</span>
        </a>
      )}
    </>
  );
}
