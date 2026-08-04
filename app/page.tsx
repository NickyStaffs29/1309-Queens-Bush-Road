/* eslint-disable @next/next/no-img-element -- responsive local derivatives are selected explicitly */
import HeroVideo from "./HeroVideo";
import PropertyVideo from "./PropertyVideo";
import { getSiteUrl, propertyGraphFor } from "./site-url";

const inquiryEmail = "cmchiarello@gmail.com";
const inquiryHref = `mailto:${inquiryEmail}?subject=Casa%20Marrone%20private%20viewing%20request`;

const facts = [
  ["Private sale", "CAD $1,895,000"],
  ["Bedrooms", "5"],
  ["Bathrooms", "4"],
  ["Measured interior", "6,553.32 sq. ft."],
  ["Covered porches", "5"],
  ["Natural water features", "2"],
];

type GalleryImage = {
  name: string;
  alt: string;
  portrait?: boolean;
  feature?: boolean;
  video?: boolean;
  staggerMs?: number;
};

const galleryGroups: { title: string; slug: string; images: GalleryImage[] }[] = [
  {
    title: "The setting",
    slug: "setting",
    images: [
      { name: "setting-rural-context", alt: "Aerial view of the property within the Wellesley landscape" },
      { name: "setting-aerial-overview", alt: "Aerial view of the house and surrounding grounds" },
      { name: "setting-rear-elevation", alt: "Rear elevation with covered porches and upper balcony" },
      { name: "setting-house-lawn-aerial", alt: "Raised aerial view of the house and lawn", feature: true },
      { name: "setting-full-property", alt: "Wide aerial view of the house, grounds and water features", feature: true },
      { name: "setting-wide-context", alt: "Aerial view sweeping across the lawn and tree line", video: true, staggerMs: 0, feature: true },
      { name: "setting-facade-flyby", alt: "Low aerial pass along the roofline and facade", video: true, staggerMs: 180, feature: true },
      { name: "setting-high-establishing", alt: "Elevated aerial view of the house and natural pool", video: true, staggerMs: 360, feature: true },
      { name: "setting-street-approach", alt: "Aerial view along the street toward the property, with neighboring rooftops beyond.", video: true, staggerMs: 540, feature: true },
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
      { name: "grounds-willow-tree", alt: "Mature willow tree on the lawn", portrait: true },
      { name: "grounds-pool-natural", alt: "Rock-edged natural pool with a stepping stone, grasses and a red maple", portrait: true },
      { name: "grounds-pool-deck-view", alt: "Natural pool and its rock border seen from the timber deck", feature: true },
    ],
  },
  {
    title: "Living & kitchen",
    slug: "living",
    images: [
      { name: "living-fireplace", alt: "Living room with exposed beams and stone fireplace" },
      { name: "living-dining-room", alt: "Dining room with hardwood floors and a bay window onto the lawn" },
      { name: "living-kitchen-island", alt: "Kitchen island with a dark stone counter and wooden bar stools" },
      { name: "living-piano-room", alt: "Grand piano on wide-plank oak beneath an iron chandelier", feature: true },
      { name: "living-kitchen-piano-connection", alt: "Kitchen island looking toward the adjoining piano room", feature: true },
    ],
  },
  {
    title: "Craft",
    slug: "craft",
    images: [
      { name: "craft-range-stone", alt: "Range and hood beneath timber beams, beside a brick column and granite counter" },
      { name: "craft-range-detail", alt: "Professional-style range and metal control detail" },
      { name: "craft-leaded-glass-nook", alt: "Service nook with a round leaded-glass window" },
      { name: "craft-window-stair", alt: "Round leaded-glass window beside the timber staircase", portrait: true },
      { name: "craft-brick-stair-detail", alt: "Curved brick steps and timber wall detail", portrait: true },
      { name: "craft-copper-sink-edge", alt: "Carved copper sink edge and custom metalwork", portrait: true },
      { name: "craft-timber-stair-barrel", alt: "Timber staircase and a wrought-iron-strapped barrel table.", portrait: true },
      { name: "craft-stone-porch-bench", alt: "Wagon-wheel bench against a stone porch wall", feature: true },
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
      { name: "rooms-double-vanity", alt: "Double vanity with a dark stone counter" },
      { name: "rooms-powder-room", alt: "Powder room with a granite-top vanity and glass shower door" },
      { name: "rooms-bedroom", alt: "Softly furnished bedroom with timber window trim" },
    ],
  },
  {
    title: "Serene Corners",
    slug: "quiet",
    images: [
      { name: "quiet-pool-clearing", alt: "Natural pool and lawn clearing viewed from the deck, framed by maples and evergreens." },
      { name: "quiet-willow-balcony", alt: "Willow branches draped beside an upper balcony railing." },
      { name: "quiet-stone-waterfall", alt: "Stone waterfall and layered garden planting", portrait: true },
      { name: "quiet-lily-pads", alt: "Lily pads beneath clear pond water", portrait: true },
      { name: "quiet-balcony-cafe", alt: "Upper balcony with a small caf\u00e9 table", portrait: true },
      { name: "quiet-pond-fountain", alt: "Fountain across the pond with a small outbuilding beyond", feature: true },
    ],
  },
];

function StoryImage({
  name,
  alt,
  className,
  sizes = "(max-width: 900px) 100vw, 66vw",
}: {
  name: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <img
      className={className}
      src={`/property/story/${name}-1920.webp`}
      srcSet={`/property/story/${name}-960.webp 960w, /property/story/${name}-1920.webp 1920w`}
      sizes={sizes}
      alt={alt}
      width="1920"
      height="1440"
      loading="lazy"
      decoding="async"
    />
  );
}

function PropertyJsonLd({ siteUrl }: { siteUrl: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(propertyGraphFor(siteUrl)).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function Home() {
  const siteUrl = getSiteUrl();

  return (
    <>
      {siteUrl ? <PropertyJsonLd siteUrl={siteUrl} /> : null}

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Casa Marrone, top of page">
          <span>Casa</span> Marrone
        </a>
        <nav aria-label="Main navigation">
          <a href="#story">The house</a>
          <a href="#gallery">Gallery</a>
          <a href="#details">Details</a>
          <a className="nav-inquire" href="#inquire">Arrange a viewing</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="property-title">
          <HeroVideo />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">Wellesley, Ontario</p>
            <h1 id="property-title">1309 Queens<br />Bush Road</h1>
            <p className="hero-price">Private sale · CAD $1,895,000</p>
            <p className="hero-line">An 1835 house of timber and stone, set among water, lawn and five covered porches.</p>
            <a className="text-link light" href="#story">Read the house <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className="facts" aria-label="Property facts">
          {facts.map(([label, value]) => (
            <div key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </section>

        <section id="story" className="story section" aria-labelledby="story-title">
          <div className="section-intro">
            <p className="eyebrow copper">The house and the arrival</p>
            <h2 id="story-title">Standing here<br />since 1835</h2>
            <p>The drive turns in past mature trees and settles in front of a house that has held this ground for nearly two centuries. Inside there is 6,553.32 sq. ft. measured in total, and the plan spends it well: rooms wide enough to take a crowd, quiet enough to sit in alone, and windows that keep the grounds in view from most of them.</p>
          </div>
          <figure className="story-image story-aerial">
            <StoryImage name="property-plan" alt="Top-down aerial view of the residence and grounds" />
            <figcaption>The residence sits within a broad, mature landscape.</figcaption>
          </figure>
          <div className="story-arrival-row">
            <figure className="story-image">
              <PropertyVideo name="front-driveway-arrival" alt="Aerial view along the driveway approaching the house and garage" />
            </figure>
            <figure className="story-image">
              <StoryImage name="front-porch-daylight" alt="Front porch and entry door in daylight." sizes="(max-width: 900px) 100vw, 30vw" />
            </figure>
            <figure className="story-image">
              <StoryImage name="front-through-trees" alt="Front of the house seen through mature trees, with the oval window over the porch." sizes="(max-width: 900px) 100vw, 30vw" />
            </figure>
          </div>
        </section>

        <section id="grounds" className="grounds section dark" aria-labelledby="grounds-title">
          <div className="grounds-copy">
            <p className="eyebrow gold">The grounds</p>
            <h2 id="grounds-title">Water, lawn<br />and five porches</h2>
            <p>The grounds include one natural swimming pool/pond, plus a separate natural pond. The lawn runs past a fountain and the deck at its edge. Five covered porches follow the sun around the house, so there is always somewhere shaded to sit and somewhere to watch the light go.</p>
          </div>
          <PropertyVideo className="grounds-main" name="grounds-pool-pond" alt="Aerial view descending toward the natural pool and rear deck" />
          <StoryImage className="grounds-secondary" name="covered-porch" alt="Covered porch furnished for outdoor sitting" />
          <p className="grounds-note">Water features: one natural swimming pool/pond, plus a separate natural pond<br />Five covered porches</p>
        </section>

        <section id="interior" className="interior section" aria-labelledby="interior-title">
          <div className="interior-lead">
            <p className="eyebrow copper">Inside</p>
            <h2 id="interior-title">Timber, copper<br />and stone</h2>
          </div>
          <StoryImage className="interior-main" name="kitchen" alt="Kitchen island and range viewed from across the room, with the oval leaded-glass window and stairwell visible beyond." />
          <div className="interior-copy">
            <p>The chef&apos;s kitchen is the working centre of the house: a granite island, a commercial range with double ovens and warming drawers, multiple sinks, a pantry and a beverage bar. It is built to cook properly in, not to be looked at.</p>
            <p>What surrounds it is the kind of detail that has to be made rather than ordered — hammered copper sinks, leaded glass beside the stair, curved brick steps rising to a custom timber door.</p>
            <a className="text-link" href="#gallery">View the gallery <span aria-hidden="true">→</span></a>
          </div>
          <StoryImage className="interior-detail" name="copper-sink" alt="Hammered copper sink and dark countertop" />
        </section>

        <section className="suite-band" aria-label="Primary suite">
          <div className="suite-gallery">
            <figure className="story-image">
              <StoryImage name="primary-bedroom-wide" alt="Primary bedroom viewed from the fireplace across to the bed and the open French door to the porch." sizes="(max-width: 900px) 66vw, 32vw" />
            </figure>
            <figure className="story-image">
              <StoryImage name="primary-bedroom" alt="Bedroom with stone fireplace, television and windows" sizes="(max-width: 900px) 33vw, 20vw" />
            </figure>
            <figure className="story-image">
              <StoryImage name="primary-bedroom-porch-view" alt="Bed pillows in the foreground beside the open French door to a screened porch." sizes="(max-width: 900px) 33vw, 20vw" />
            </figure>
          </div>
          <div>
            <p className="eyebrow gold">The primary suite</p>
            <h2>A house within<br />the house</h2>
            <p>A fireplace, a walk-in closet, an ensuite and a covered porch, all of them belonging to this room alone.</p>
          </div>
        </section>

        <section id="details" className="features section" aria-labelledby="details-title">
          <div>
            <p className="eyebrow gold">Practical detail</p>
            <h2 id="details-title">What the house<br />is made of</h2>
          </div>
          <div className="feature-columns">
            <div>
              <h3>Space and rooms</h3>
              <ul>
                <li>6,553.32 sq. ft. measured in total</li>
                <li>4,490.75 sq. ft. above grade</li>
                <li>2,062.57 sq. ft. below grade</li>
                <li>Five bedrooms and four bathrooms</li>
                <li>Two fireplaces</li>
                <li>Pool-side three-piece bathroom</li>
              </ul>
            </div>
            <div>
              <h3>Grounds and services</h3>
              <ul>
                <li>Five covered porches</li>
                <li>Water features: one natural swimming pool/pond, plus a separate natural pond</li>
                <li>Heated triple garage</li>
                <li>Municipal services remain current</li>
                <li>Chimneys and flues reconstructed in May 2019</li>
                <li>Driveway rated for 60,000 lb</li>
                <li>50-amp service in the driveway area</li>
                <li>Hard- and soft-water connections available</li>
              </ul>
            </div>
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
                      {image.video === true ? (
                        <PropertyVideo name={image.name} alt={image.alt} staggerMs={image.staggerMs} />
                      ) : (
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
                      )}
                    </figure>
                  );
                })}
              </div>
            </section>
          ))}
        </section>

        <section id="inquire" className="inquire" aria-labelledby="inquire-title">
          <StoryImage name="pond-garden" alt="Pond and deck framed by mature planting" />
          <div className="inquire-shade" />
          <div className="inquire-content">
            <p className="eyebrow gold">Private sale</p>
            <h2 id="inquire-title">Arrange a private viewing</h2>
            <p className="inquire-lead">Casa Marrone is offered privately at CAD $1,895,000. Viewings are available by confirmed appointment, arranged by email.</p>
            <p className="inquire-lead">Please include your name, preferred day and time windows, and how many people will attend.</p>
            <a className="cta-button" href={inquiryHref}>Email to request a private viewing</a>
            <p className="inquire-email">
              <a href={inquiryHref}>{inquiryEmail}</a>
            </p>
          </div>
        </section>
      </main>

      <footer>
        <p>Casa Marrone · 1309 Queens Bush Road · Wellesley, Ontario</p>
        <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  );
}
