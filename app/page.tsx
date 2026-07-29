/* eslint-disable @next/next/no-img-element -- responsive local derivatives are selected explicitly */
import HeroVideo from "./HeroVideo";

const facts = [
  ["Built", "1835"],
  ["Bedrooms", "5"],
  ["Bathrooms", "4"],
  ["Total measured", "6,553 sq. ft."],
  ["Covered porches", "5"],
  ["Natural pools", "2"],
];

const galleryGroups = [
  {
    title: "The setting",
    slug: "setting",
    images: [
      { name: "setting-rural-context", alt: "Aerial view of the property within the Wellesley landscape" },
      { name: "setting-aerial-overview", alt: "Aerial view of the house and surrounding grounds" },
      { name: "setting-rear-elevation", alt: "Rear elevation with covered porches and upper balcony" },
      { name: "setting-house-lawn-aerial", alt: "Raised aerial view of the house and lawn" },
      { name: "setting-full-property", alt: "Wide aerial view of the house, grounds and water features" },
      { name: "setting-stone-porch-bench", alt: "Wagon-wheel bench against a stone porch wall" },
    ],
  },
  {
    title: "The grounds",
    slug: "grounds",
    images: [
      { name: "grounds-natural-pool-aerial", alt: "Aerial view of a natural pool, deck and lawn" },
      { name: "grounds-pond-deck", alt: "Landscaped pond, deck and mature grounds" },
      { name: "grounds-rear-across-pond", alt: "Rear exterior viewed across the pond garden" },
      { name: "grounds-lawn-fountain", alt: "Broad lawn leading toward the pond and fountain" },
      { name: "grounds-lawn-deck-pond", alt: "Wide view across the lawn, deck and pond" },
      { name: "grounds-opposite-aerial", alt: "Aerial view across the residence, lawn and water features" },
    ],
  },
  {
    title: "Living & kitchen",
    slug: "living",
    images: [
      { name: "living-fireplace", alt: "Living room with exposed beams and stone fireplace" },
      { name: "living-dining-room", alt: "Dining room with hardwood floors and a garden-facing window" },
      { name: "living-kitchen-island", alt: "Wood-topped kitchen island with seating" },
      { name: "living-kitchen-island-vertical", alt: "Vertical view across the kitchen island", portrait: true },
      { name: "living-copper-sink-edge", alt: "Carved copper sink edge and custom metalwork", portrait: true },
      { name: "living-kitchen-piano-connection", alt: "Kitchen island looking toward the adjoining piano room", feature: true },
    ],
  },
  {
    title: "Craft",
    slug: "craft",
    images: [
      { name: "craft-range-stone", alt: "Kitchen cooking area with timber, stone and dark cabinetry" },
      { name: "craft-range-detail", alt: "Professional-style range and metal control detail" },
      { name: "craft-leaded-glass-nook", alt: "Service nook with a round leaded-glass window" },
      { name: "craft-window-stair", alt: "Round leaded-glass window beside the timber staircase", portrait: true },
      { name: "craft-brick-stair-detail", alt: "Curved brick steps and timber wall detail", portrait: true },
      { name: "craft-brick-steps-timber-door", alt: "Curved brick steps leading to a custom timber door", feature: true },
    ],
  },
  {
    title: "Rooms",
    slug: "rooms",
    images: [
      { name: "rooms-timber-entry", alt: "Warm-toned entry with timber posts and front door" },
      { name: "rooms-office-library", alt: "Home office with built-in book wall and dark wood desk" },
      { name: "rooms-sitting-room", alt: "Quiet sitting room with two antique-style chairs" },
      { name: "rooms-balcony-cafe", alt: "Upper balcony with a small café table", portrait: true },
      { name: "rooms-willow-tree", alt: "Mature willow tree on the lawn", portrait: true },
      { name: "rooms-bedroom", alt: "Softly furnished bedroom with timber window trim", feature: true },
    ],
  },
  {
    title: "Quiet views",
    slug: "quiet",
    images: [
      { name: "quiet-timber-hall", alt: "Long hall with timber trim and terracotta-toned walls" },
      { name: "quiet-double-vanity", alt: "Double vanity with a dark stone counter" },
      { name: "quiet-pond-window-view", alt: "Pond and grounds viewed through an upstairs window" },
      { name: "quiet-stone-waterfall", alt: "Stone waterfall and layered garden planting", portrait: true },
      { name: "quiet-lily-pads", alt: "Lily pads beneath clear pond water", portrait: true },
      { name: "quiet-pond-fountain", alt: "Fountain across the pond with a small outbuilding beyond", feature: true },
    ],
  },
];

function StoryImage({
  name,
  alt,
  className,
}: {
  name: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={`/property/story/${name}-1920.webp`}
      srcSet={`/property/story/${name}-960.webp 960w, /property/story/${name}-1920.webp 1920w`}
      sizes="(max-width: 900px) 100vw, 66vw"
      alt={alt}
      width="1920"
      height="1440"
      loading="lazy"
      decoding="async"
    />
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="1309 Queens Bush Road, top of page">
          <span>1309</span> Queens Bush Road
        </a>
        <nav aria-label="Main navigation">
          <a href="#story">The property</a>
          <a href="#gallery">Gallery</a>
          <a className="nav-inquire" href="#inquire">Private preview</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="property-title">
          <HeroVideo />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">Wellesley, Ontario</p>
            <h1 id="property-title">1309 Queens<br />Bush Road</h1>
            <p className="hero-line">Historic character. Generous scale. A home shaped for life indoors and out.</p>
            <a className="text-link light" href="#story">Discover the property <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className="facts" aria-label="Property facts">
          {facts.map(([label, value]) => (
            <div key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </section>

        <section id="story" className="story section" aria-labelledby="story-title">
          <div className="section-intro">
            <p className="eyebrow copper">A house with presence</p>
            <h2 id="story-title">Made over time,<br />made for living</h2>
            <p>Built in 1835, this substantial residence pairs enduring architectural character with 6,553 square feet of measured interior space. Warm timber, stone and generous windows give each room its own quiet identity.</p>
          </div>
          <figure className="story-image story-aerial">
            <StoryImage name="property-plan" alt="Top-down aerial view of the residence and grounds" />
            <figcaption>The residence sits within a broad, mature landscape.</figcaption>
          </figure>
          <figure className="story-image story-approach">
            <StoryImage name="front-arrival" alt="Front elevation and three-car garage viewed from above" />
          </figure>
        </section>

        <section className="grounds section dark" aria-labelledby="grounds-title">
          <div className="grounds-copy">
            <p className="eyebrow gold">The grounds</p>
            <h2 id="grounds-title">Room to step outside</h2>
            <p>Five covered porches extend the home into its setting. Two natural swimming pools, broad lawns and established trees create a sequence of outdoor spaces from morning through evening.</p>
          </div>
          <StoryImage className="grounds-main" name="rear-pond" alt="Rear of the house beside the pond-edge deck" />
          <StoryImage className="grounds-secondary" name="covered-porch" alt="Covered porch furnished for outdoor sitting" />
          <p className="grounds-note">Two natural swimming pools<br />Five covered porches</p>
        </section>

        <section className="interior section" aria-labelledby="interior-title">
          <div className="interior-lead">
            <p className="eyebrow copper">Inside</p>
            <h2 id="interior-title">Craft, warmth<br />and scale</h2>
          </div>
          <StoryImage className="interior-main" name="kitchen" alt="Custom kitchen island, professional-style range and timber hood" />
          <div className="interior-copy">
            <p>The chef&apos;s kitchen centres on a granite island and commercial range with double ovens and warming drawers. Multiple sinks, a pantry and beverage bar support both everyday routines and larger gatherings.</p>
            <a className="text-link" href="#gallery">View the gallery <span aria-hidden="true">→</span></a>
          </div>
          <StoryImage className="interior-detail" name="copper-sink" alt="Hammered copper sink and dark countertop" />
        </section>

        <section className="suite-band" aria-label="Primary suite">
          <StoryImage name="primary-bedroom" alt="Bedroom with stone fireplace, garden door and burgundy bedding" />
          <div>
            <p className="eyebrow gold">The primary suite</p>
            <h2>A private room<br />within the home</h2>
            <p>The primary suite includes a fireplace, walk-in closet, ensuite and its own covered porch.</p>
          </div>
        </section>

        <section id="gallery" className="gallery section" aria-labelledby="gallery-title">
          <div className="gallery-heading">
            <p className="eyebrow copper">Selected rooms &amp; views</p>
            <h2 id="gallery-title">The property,<br />in detail</h2>
          </div>
          {galleryGroups.map((group) => (
            <section className="gallery-group" aria-labelledby={`${group.slug}-gallery-title`} key={group.slug}>
              <h3 id={`${group.slug}-gallery-title`}>{group.title}</h3>
              <div className="gallery-group-grid">
                {group.images.map((image) => {
                  const portrait = image.portrait === true;
                  return (
                    <figure
                      key={image.name}
                      className={`gallery-item ${portrait ? "portrait" : "landscape"}${image.feature ? " feature" : ""}`}
                    >
                      <img
                        src={`/property/gallery/${image.name}-1440.webp`}
                        srcSet={`/property/gallery/${image.name}-720.webp ${portrait ? "480w" : "720w"}, /property/gallery/${image.name}-1440.webp ${portrait ? "960w" : "1440w"}`}
                        sizes={portrait ? "(max-width: 640px) 50vw, (max-width: 900px) 50vw, 25vw" : "(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"}
                        alt={image.alt}
                        width={portrait ? "960" : "1440"}
                        height={portrait ? "1440" : "1080"}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                  );
                })}
              </div>
            </section>
          ))}
        </section>

        <section id="features" className="features section" aria-labelledby="features-title">
          <div>
            <p className="eyebrow gold">At a glance</p>
            <h2 id="features-title">Details that<br />define the home</h2>
          </div>
          <div className="feature-columns">
            <ul>
              <li>4,490.75 sq. ft. above grade</li>
              <li>2,062.57 sq. ft. below grade</li>
              <li>Five bedrooms and four bathrooms</li>
              <li>Two fireplaces</li>
              <li>Five covered porches</li>
            </ul>
            <ul>
              <li>Two natural swimming pools</li>
              <li>Pool-side three-piece bathroom</li>
              <li>Heated triple garage</li>
              <li>Primary suite with covered porch</li>
              <li>Chef&apos;s kitchen with commercial range</li>
            </ul>
          </div>
        </section>

        <section id="inquire" className="inquire" aria-labelledby="inquire-title">
          <StoryImage name="pond-garden" alt="Pond and deck framed by mature planting" />
          <div className="inquire-shade" />
          <div className="inquire-content">
            <p className="eyebrow gold">Private preview</p>
            <h2 id="inquire-title">Experience<br />1309 Queens Bush Road</h2>
            <p>This page is a private preview. Contact details coming soon.</p>
          </div>
        </section>
      </main>

      <footer>
        <p>1309 Queens Bush Road · Wellesley, Ontario</p>
        <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  );
}
