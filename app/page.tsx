/* eslint-disable @next/next/no-img-element -- responsive local derivatives are selected explicitly */
import HeroVideo from "./HeroVideo";
import PropertyVideo from "./PropertyVideo";
import { getSiteUrl, propertyGraphFor } from "./site-url";

const inquiryEmail = "cmchiarello@gmail.com";
const inquiryHref = `mailto:${inquiryEmail}?subject=Casa%20Serenita%20private%20viewing%20request`;

const facts = [
  ["Private sale", "CAD $1,895,000"],
  ["Bedrooms", "6"],
  ["Bathrooms", "5"],
  ["Finished interior", "4,956 sq. ft."],
  ["Grounds", "3.05 acres"],
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
      { name: "craft-stone-porch-bench", alt: "Stained wagon-wheel bench against the stone wall of a covered porch, with a fern beside it on composite decking.", portrait: true },
      { name: "craft-hearth-bellows", alt: "Riveted leather-and-brass bellows against the fieldstone hearth, beside a hand-carved candlestick.", portrait: true },
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
    title: "Serene corners",
    slug: "quiet",
    images: [
      { name: "quiet-pool-clearing", alt: "Natural pool and lawn clearing viewed from the deck, framed by maples and evergreens." },
      { name: "quiet-willow-balcony", alt: "Willow branches draped beside an upper balcony railing." },
      { name: "quiet-stone-waterfall", alt: "Stone waterfall and layered garden planting" },
      { name: "quiet-lily-pads", alt: "Lily pads beneath clear pond water" },
      { name: "quiet-balcony-cafe", alt: "Upper balcony with a small caf\u00e9 table" },
      { name: "quiet-pond-fountain", alt: "Fountain across the pond with a small outbuilding beyond" },
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
        <a className="wordmark" href="#top" aria-label="Casa Serenita, top of page">
          <span>Casa</span> Serenita
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
            <p className="hero-line">Cannot be seen from the road</p>
            <p className="hero-price">Private sale · CAD $1,895,000</p>
            <p className="hero-line">Just up the driveway to your right, serenity awaits you. Settled quietly beyond a long line of trees, nestled on 3.05 manicured acres with two ponds &amp; five porches.</p>
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
            <p>Fully Restored and standing strong since 1835. This 4,956 sq. ft. century home is full of enchantment &amp; character. It has been custom restored with care and detail, preserving the natural characteristics of the home with all of its incredible history and stories.</p>
            <p>The welcoming layout spends it well. With multiple rooms generous enough to comfortably host and accommodate a large crowd and quiet enough for everyone to find their own private space to just &quot;be&quot; and sit in the peace &amp; quiet alone. Regardless of your purpose, you can always look forward to the views from any room, any time of day or night.</p>
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
              <img
                src="/property/gallery/setting-rear-elevation-1440.webp"
                srcSet="/property/gallery/setting-rear-elevation-720.webp 720w, /property/gallery/setting-rear-elevation-1440.webp 1440w"
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                alt="Rear elevation with covered porches and upper balcony."
                width="1440"
                height="1080"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <figure className="story-image">
              <StoryImage name="front-through-trees" alt="Front of the house seen through mature trees, with the oval window over the porch." sizes="(max-width: 900px) 100vw, 30vw" />
            </figure>
          </div>
        </section>

        <section id="grounds" className="grounds section dark" aria-labelledby="grounds-title">
          <div className="grounds-copy">
            <p className="eyebrow gold">The grounds</p>
            <h2 id="grounds-title">A natural pond<br />and five porches</h2>
            <p>Two natural water features</p>
            <p>An engineered Natural Swimming Pond (NSP). Fully lined, lighted &amp; aerated. Completing the ambiance is a flowing rock waterfall and diving rock. Designed in Europe and modelled after an Alpine lake, you have never felt cleaner and silky soft so naturally. This stunning water feature is entirely filtered by plants. No maintenance and no chemicals. The plants do it all.</p>
            <p>The hot tub sits securely on the expansive composite deck which rests on a poured, rebar reinforced concrete slab. The deck cantilevers over the pond with the perimeter &amp; stairs being accented with inlaid lighting for ambiance and safety.</p>
            <p>The grounds were professionally graded for water drainage and beauty. It was designed to keep water away from the house and yet effectively capture naturally all rain water from eavestroughs and downspouts directly into the ponds.</p>
            <p>Feel at ease and secure with the Generac 22 kW built-in generator. Powerful enough to run the entire property. No blackouts for you.</p>
          </div>
          <div className="grounds-gallery">
            <img
              src="/property/gallery/grounds-willow-tree-1440.webp"
              srcSet="/property/gallery/grounds-willow-tree-720.webp 720w, /property/gallery/grounds-willow-tree-1440.webp 1440w"
              sizes="(max-width: 900px) calc(100vw - 48px), 30vw"
              alt="Mature willow tree on the lawn"
              width="960"
              height="1440"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/property/gallery/grounds-pool-natural-1440.webp"
              srcSet="/property/gallery/grounds-pool-natural-720.webp 720w, /property/gallery/grounds-pool-natural-1440.webp 1440w"
              sizes="(max-width: 900px) calc(100vw - 48px), 30vw"
              alt="Rock-edged natural pool with a stepping stone, grasses and a red maple"
              width="960"
              height="1440"
              loading="lazy"
              decoding="async"
            />
          </div>
          <PropertyVideo className="grounds-main" name="grounds-pool-pond" alt="Aerial view descending toward the natural pool and rear deck" />
          <img
            className="grounds-secondary"
            src="/property/gallery/grounds-rear-across-pond-1440.webp"
            srcSet="/property/gallery/grounds-rear-across-pond-720.webp 720w, /property/gallery/grounds-rear-across-pond-1440.webp 1440w"
            sizes="(max-width: 900px) calc(100vw - 48px), 30vw"
            alt="Rear exterior viewed across the pond garden."
            width="1440"
            height="1080"
            loading="lazy"
            decoding="async"
          />
          <p className="grounds-note">Water features: the natural swimming pond, plus a separate lower pond<br />Five covered porches<br />3.05 acres</p>
        </section>

        <section id="interior" className="interior section" aria-labelledby="interior-title">
          <div className="interior-lead">
            <p className="eyebrow copper">Inside</p>
            <h2 id="interior-title">Timber, copper<br />and stone</h2>
          </div>
          <StoryImage className="interior-main" name="kitchen" alt="Kitchen island and range viewed from across the room, with the oval leaded-glass window and stairwell visible beyond." />
          <div className="interior-copy">
            <p>The kitchen is always the heart of the home and this chef&apos;s kitchen is certainly no exception. The oversized expansive granite island is surrounded by reclaimed wood beams and old pine window sills.</p>
            <p>An original natural stone chimney from 1835 is showcased in the kitchen adding intrigue and nostalgia to every experience enjoyed around the island. Ceramic tile flows tastefully throughout kitchen, foyer, laundry and bathroom. Rare and unique custom cut reclaimed hardwood floor throughout dining and living room.</p>
            <p>With the commercial double ovens, large hammered copper double and prep sinks, generous pantry and a beverage bar, your culinary possibilities are endless.</p>
            <p>Cook and be a part of the party as the functionality allows for free movement for you and your family and friends to chat and move about comfortably without restriction. So many stories are shared and problems solved &quot;around the island&quot;.</p>
            <p>The natural wood burning fireplace in the living room, not only warms the room and hearts of those around it, but it is also visible from the piano room, kitchen and the outside deck and hot tub.</p>
            <p>The custom oval leaded glass window leads you up the curved staircase to the second floor of the home. Which boasts the stunning view of the expansive grounds from the generous executive office.</p>
            <a className="text-link" href="#gallery">View the gallery <span aria-hidden="true">→</span></a>
          </div>
          <div className="interior-secondary">
            <StoryImage className="interior-photo" name="copper-sink" alt="Hammered copper sink and dark countertop" />
            <img
              className="interior-photo"
              src="/property/gallery/craft-hearth-bellows-1440.webp"
              srcSet="/property/gallery/craft-hearth-bellows-720.webp 720w, /property/gallery/craft-hearth-bellows-1440.webp 1440w"
              sizes="(max-width: 900px) 100vw, 66vw"
              alt="Riveted leather-and-brass bellows against the fieldstone hearth, beside a hand-carved candlestick."
              width="960"
              height="1440"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        <section className="suite-band" aria-label="Primary suite">
          <div className="suite-gallery">
            <figure className="story-image suite-primary">
              <StoryImage name="primary-bedroom-wide" alt="Primary bedroom viewed from the fireplace across to the bed and the open French door to the porch." sizes="(max-width: 900px) 100vw, 32vw" />
            </figure>
            <figure className="story-image">
              <StoryImage name="primary-bedroom" alt="Bedroom with stone fireplace, television and windows" sizes="(max-width: 900px) 100vw, 20vw" />
            </figure>
            <figure className="story-image">
              <StoryImage name="primary-bedroom-porch-view" alt="Bed pillows in the foreground beside the open French door to a screened porch." sizes="(max-width: 900px) 100vw, 20vw" />
            </figure>
          </div>
          <div>
            <p className="eyebrow gold">The primary suite</p>
            <h2>A private<br />retreat</h2>
            <p>Ascend to your private sanctuary, complete with private wood burning fireplace, covered balcony overlooking the magnificent willow tree or a breathtaking view of the grounds, lighted upper natural swimming pond and the lower pond with lighted fountain. It is a truly spectacular, peaceful and calming experience at night. Especially when accompanied with the gentle rains and the symphony sounds of nature.</p>
            <p>Take a deep breath my friends. You&apos;re home.</p>
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
                <li>4,956 sq. ft. finished in total</li>
                <li>4,122 sq. ft. above grade</li>
                <li>834 sq. ft. below grade</li>
                <li>Six bedrooms: five above grade, one below</li>
                <li>Five bathrooms: three full and two half</li>
                <li>Three fireplaces, including natural-stone wood-burning fireplaces in the living room and primary bedroom</li>
                <li>Finished lower level with its own walk-up entrance</li>
                <li>Pool-side three-piece bathroom</li>
                <li>Heated triple garage with an infrared sauna</li>
                <li>Natural stone and vinyl siding</li>
              </ul>
            </div>
            <div>
              <h3>Grounds and services</h3>
              <ul>
                <li>3.05 acres</li>
                <li>Five covered porches with composite decking and railings</li>
                <li>Hot tub on a reinforced concrete slab, and a natural-gas connection at the back deck</li>
                <li>Asphalt driveway with a reinforced RV pad rated for 60,000 lb</li>
                <li>50-amp RV service, hard- and soft-water connections and frost-free taps</li>
                <li>Municipal water and sewer</li>
                <li>200-amp service, plus a 30-amp subpanel at the lower pond</li>
                <li>22 kW automatic natural-gas standby generator serving the whole property</li>
                <li>Chimneys and flues reconstructed in May 2019</li>
                <li>Multi-room audio and television wiring, including the porches and back yard</li>
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
            <p className="inquire-lead">Casa Serenita is offered privately at CAD $1,895,000. Viewings are available by confirmed appointment, arranged by email.</p>
            <p className="inquire-lead">Please include your name, preferred day and time windows, and how many people will attend.</p>
            <a className="cta-button" href={inquiryHref}>Email to request a private viewing</a>
            <p className="inquire-email">
              <a href={inquiryHref}>{inquiryEmail}</a>
            </p>
          </div>
        </section>
      </main>

      <footer>
        <p>
          <span>Casa Serenita ·</span>
          <span>1309 Queens Bush Road ·</span>
          <span>Wellesley, Ontario</span>
        </p>
        <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  );
}
