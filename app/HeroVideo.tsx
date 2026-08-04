"use client";

import { useEffect, useRef, useState } from "react";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

const HERO_CLIPS = [
  {
    desktop: "/property/video/property-overview-desktop.mp4",
    mobile: "/property/video/property-overview-mobile.mp4",
    mobileObjectPosition: "center",
  },
  {
    desktop: "/property/video/hero-front-driveway-arrival-desktop.mp4",
    mobile: "/property/video/front-driveway-arrival.mp4",
    mobileObjectPosition: "38% 52%",
  },
  {
    desktop: "/property/video/hero-setting-street-approach-desktop.mp4",
    mobile: "/property/video/setting-street-approach.mp4",
    mobileObjectPosition: "35% 48%",
  },
] as const;

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const clipIndexRef = useRef(0);
  const userPausedRef = useRef(false);
  const blockedRef = useRef(false);
  const [clipIndex, setClipIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  function loadClip(index: number, autoplay: boolean) {
    const video = videoRef.current;
    if (!video) return;
    const clip = HERO_CLIPS[index];
    const sources = video.querySelectorAll<HTMLSourceElement>("source[data-src]");
    for (const source of sources) {
      source.media = source.dataset.media ?? "";
      source.dataset.src = source.dataset.media === "(max-width: 640px)" ? clip.mobile : clip.desktop;
      source.src = source.dataset.src;
    }
    setReady(false);
    video.load();
    if (autoplay) {
      void video.play().catch(() => setReady(false));
    }
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
    blockedRef.current = Boolean(reducedMotion || saveData);
    if (blockedRef.current) return;
    loadClip(clipIndexRef.current, true);
  }, []);

  function handleEnded() {
    if (blockedRef.current || userPausedRef.current) return;
    const next = (clipIndexRef.current + 1) % HERO_CLIPS.length;
    clipIndexRef.current = next;
    setClipIndex(next);
    loadClip(next, true);
  }

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      try {
        await video.play();
      } catch {
        setReady(false);
        return;
      }
      setPaused(false);
    } else {
      userPausedRef.current = true;
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
        style={{ objectPosition: HERO_CLIPS[clipIndex].mobileObjectPosition }}
        data-hero-clips={JSON.stringify(HERO_CLIPS)}
        poster="/property/video/property-overview-desktop-poster.webp"
        width="1920"
        height="1080"
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        onCanPlay={() => setReady(true)}
        onError={() => setReady(false)}
        onEnded={handleEnded}
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
        hidden={!ready}
        disabled={!ready}
      >
        {paused ? "Play video" : "Pause video"}
      </button>
    </div>
  );
}
