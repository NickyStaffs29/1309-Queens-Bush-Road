/* eslint-disable @next/next/no-img-element -- web-sized local derivatives avoid runtime image infrastructure */
const facts = [
  ["Built", "1835"],
  ["Bedrooms", "5"],
  ["Bathrooms", "4"],
  ["Total interior", "6,553 sq. ft."],
  ["Covered porches", "5"],
  ["Natural pools", "2"],
];

const gallery = [
  ["/property/aerial-context.webp", "Aerial view of the property and its surrounding landscape"],
  ["/property/rear-architecture.webp", "Rear elevation framed by mature trees"],
  ["/property/covered-porch.webp", "Covered porch overlooking the lawn"],
  ["/property/natural-pool-detail.webp", "Natural swimming pool beside the terrace"],
  ["/property/kitchen-range.webp", "Commercial range in the chef's kitchen"],
  ["/property/kitchen-to-dining.webp", "Kitchen opening into the dining area"],
  ["/property/great-room.webp", "Living room with exposed wood beams"],
  ["/property/music-room.webp", "Light-filled music room with piano"],
  ["/property/wood-stair-detail.webp", "Wood staircase and lower-level landing"],
  ["/property/ensuite.webp", "Primary ensuite with double vanity"],
  ["/property/primary-suite.webp", "Primary suite sitting area"],
  ["/property/lower-level-gallery.webp", "Finished lower-level gallery"],
  ["/property/garage-loft.webp", "Finished heated and cooled garage loft"],
];

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
          <img src="/property/hero-kitchen.webp" alt="Chef's kitchen with a granite island and crafted wood cabinetry" fetchPriority="high" />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">St. Jacobs, Ontario</p>
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
            <p>Built in 1835, this substantial residence pairs an enduring architectural character with 6,553 square feet of finished interior space. Warm timber, stone and generous windows give each room its own quiet identity.</p>
          </div>
          <figure className="story-image story-aerial">
            <img src="/property/aerial-estate.webp" alt="Aerial view of the residence, grounds and natural pools" loading="lazy" />
            <figcaption>The residence sits within a broad, mature landscape.</figcaption>
          </figure>
          <figure className="story-image story-approach">
            <img src="/property/front-approach.webp" alt="Front approach and triple garage" loading="lazy" />
          </figure>
        </section>

        <section className="grounds section dark" aria-labelledby="grounds-title">
          <div className="grounds-copy">
            <p className="eyebrow gold">The grounds</p>
            <h2 id="grounds-title">Room to step outside</h2>
            <p>Five covered porches extend the home into its setting. Two natural swimming pools, broad lawns and established trees create a sequence of outdoor spaces from morning through evening.</p>
          </div>
          <img className="grounds-main" src="/property/poolside-terrace.webp" alt="Rear terrace beside one of the natural swimming pools" loading="lazy" />
          <img className="grounds-secondary" src="/property/natural-pool-landscape.webp" alt="Natural swimming pool set within the landscaped grounds" loading="lazy" />
          <p className="grounds-note">Two natural swimming pools<br />Five covered porches</p>
        </section>

        <section className="interior section" aria-labelledby="interior-title">
          <div className="interior-lead">
            <p className="eyebrow copper">Inside</p>
            <h2 id="interior-title">Craft, warmth<br />and scale</h2>
          </div>
          <img className="interior-main" src="/property/kitchen-cooktop.webp" alt="Chef's kitchen with granite counters, timber details and commercial cooktop" loading="lazy" />
          <div className="interior-copy">
            <p>The chef&apos;s kitchen centres on a granite island and commercial range with double ovens and warming drawers. Multiple sinks, a pantry and beverage bar support both everyday routines and larger gatherings.</p>
            <a className="text-link" href="#gallery">View the gallery <span aria-hidden="true">→</span></a>
          </div>
          <img className="interior-detail" src="/property/crafted-door.webp" alt="Crafted wood door and millwork detail" loading="lazy" />
        </section>

        <section className="suite-band" aria-label="Primary suite">
          <img src="/property/primary-sitting-room.webp" alt="Primary suite sitting room with warm wood flooring" loading="lazy" />
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
          <div className="gallery-grid">
            {gallery.map(([src, alt], index) => (
              <figure key={src} className={`gallery-item item-${index + 1}`}>
                <img src={src} alt={alt} loading="lazy" />
              </figure>
            ))}
          </div>
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
              <li>Heated and cooled garage loft</li>
              <li>Municipal services</li>
            </ul>
          </div>
        </section>

        <section id="inquire" className="inquire" aria-labelledby="inquire-title">
          <img src="/property/pool-deck.webp" alt="Natural pool and surrounding landscape" loading="lazy" />
          <div className="inquire-shade" />
          <div className="inquire-content">
            <p className="eyebrow gold">Private preview</p>
            <h2 id="inquire-title">Experience<br />1309 Queens Bush Road</h2>
            <p>This page is a private preview. Contact details coming soon.</p>
          </div>
        </section>
      </main>

      <footer>
        <p>1309 Queens Bush Road · St. Jacobs, Ontario</p>
        <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  );
}
