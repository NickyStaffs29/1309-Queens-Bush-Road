"use client";

import { useEffect, useRef, useState } from "react";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
    const video = videoRef.current;
    if (!video || reducedMotion || saveData) return;

    for (const source of video.querySelectorAll<HTMLSourceElement>("source[data-src]")) {
      source.src = source.dataset.src ?? "";
      if (source.dataset.media) source.media = source.dataset.media;
    }
    video.load();
    void video.play().catch(() => setReady(false));
  }, []);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  }

  return (
    <div className="hero-media">
      <picture className="hero-video-fallback">
        <source media="(max-width: 640px)" srcSet="/property/video/property-overview-mobile-poster.webp" />
        <img
          src="/property/video/property-overview-desktop-poster.webp"
          alt="Aerial view of 1309 Queens Bush Road and its surrounding grounds"
          width="1600"
          height="900"
          fetchPriority="high"
        />
      </picture>
      <video
        ref={videoRef}
        className={`hero-video${ready ? " is-ready" : ""}`}
        poster="/property/video/property-overview-desktop-poster.webp"
        width="1920"
        height="1080"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onCanPlay={() => setReady(true)}
        onError={() => setReady(false)}
      >
        <source
          data-src="/property/video/property-overview-mobile.mp4"
          data-media="(max-width: 640px)"
          type="video/mp4"
        />
        <source data-src="/property/video/property-overview-desktop.mp4" type="video/mp4" />
      </video>
      <button
        className="hero-video-control"
        type="button"
        onClick={togglePlayback}
        aria-pressed={paused}
        hidden={!ready}
        disabled={!ready}
      >
        {paused ? "Play video" : "Pause video"}
      </button>
    </div>
  );
}
