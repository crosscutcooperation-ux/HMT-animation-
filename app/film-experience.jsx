"use client";

import { useEffect, useRef } from "react";

const chapters = [
  {
    time: 0,
    tone: "site",
    title: "From bare land<br />to production <em>start-up.</em>",
    kicker: "GREENFIELD / ONE PROGRAMME",
    caption: "Engineering, civil works, machine setup and production readiness—held as one programme.",
    copy: { x: "6vw", y: "9svh", width: "min(39vw, 570px)", align: "left" },
    mobilePosition: "top",
  },
  {
    time: 4.8,
    tone: "civil",
    title: "The hall follows<br />the <em>machine plan.</em>",
    kicker: "CIVIL & STRUCTURAL",
    caption: "PEB span, hook height and floor loading are set with the equipment list.",
    copy: { x: "6vw", y: "9svh", width: "min(38vw, 560px)", align: "left" },
    mobilePosition: "top",
    note: { text: "SPAN / HOOK HEIGHT / FLOOR LOAD", x: "62vw", y: "76svh", side: "right" },
  },
  {
    time: 13.7,
    tone: "delivery",
    title: "Machines arrive<br /><em>on sequence.</em>",
    kicker: "MACHINE LOGISTICS",
    caption: "Procurement and transportation stay locked to the construction schedule.",
    copy: { x: "6vw", y: "10svh", width: "min(36vw, 520px)", align: "left" },
    mobilePosition: "top",
    note: { text: "DELIVERY WINDOW / LOCKED", x: "65vw", y: "76svh", side: "right" },
  },
  {
    time: 16.7,
    tone: "handling",
    title: "Controlled unload.<br /><em>One interface.</em>",
    kicker: "OEM COORDINATION",
    caption: "Builders, vendors and the owner’s engineering team move to one installation plan.",
    copy: { x: "59vw", y: "52svh", width: "min(35vw, 500px)", align: "right" },
    mobilePosition: "bottom",
    note: { text: "CRATE A / MACHINE BASE", x: "6vw", y: "19svh", side: "left" },
  },
  {
    time: 25.4,
    tone: "staging",
    title: "Parts staged<br /><em>in build order.</em>",
    kicker: "INSTALLATION READINESS",
    caption: "Every lift is sequenced before the first component leaves its crate.",
    copy: { x: "59vw", y: "9svh", width: "min(35vw, 500px)", align: "right" },
    mobilePosition: "top",
    note: { text: "A → B → C / BUILD SEQUENCE", x: "6vw", y: "73svh", side: "left" },
  },
  {
    time: 28.5,
    tone: "installation",
    title: "Machine<br /><em>installation.</em>",
    kicker: "BASE & DATUM",
    caption: "The base is positioned first—ready for level, alignment and assembly.",
    copy: { x: "6vw", y: "9svh", width: "min(35vw, 500px)", align: "left" },
    mobilePosition: "top",
    note: { text: "BASE DATUM", x: "66vw", y: "74svh", side: "right" },
  },
  {
    time: 32.1,
    tone: "crane",
    title: "Lift. Align.<br /><em>Set.</em>",
    kicker: "CONTROLLED ASSEMBLY",
    caption: "Spindle, controls and gantry are placed against the machine datum.",
    copy: { x: "6vw", y: "11svh", width: "min(34vw, 490px)", align: "left" },
    mobilePosition: "top",
    note: { text: "LIFT PLAN / C.G.", x: "65vw", y: "71svh", side: "right" },
  },
  {
    time: 40.2,
    tone: "mechanical",
    title: "Mechanical<br /><em>completion.</em>",
    kicker: "LINE INTEGRATION",
    caption: "Machine installation and production line integration move as one workstream.",
    copy: { x: "6vw", y: "59svh", width: "min(35vw, 510px)", align: "left" },
    mobilePosition: "bottom",
    note: { text: "LEVEL / ALIGN / LOCK", x: "66vw", y: "17svh", side: "right" },
  },
  {
    time: 46.8,
    tone: "controls",
    title: "PLC & power<br /><em>integration.</em>",
    kicker: "AUTOMATION & CONTROLS",
    caption: "Controls, drives and interlocks are written to the process narrative.",
    copy: { x: "6vw", y: "9svh", width: "min(35vw, 510px)", align: "left" },
    mobilePosition: "top",
    note: { text: "L1 / L2 / L3 / N / PE", x: "65vw", y: "73svh", side: "right" },
  },
  {
    time: 50.2,
    tone: "commissioning",
    title: "Ready for the<br /><em>first stable run.</em>",
    kicker: "PRODUCTION READINESS",
    caption: "Trial production, validation and technical support stay through ramp-up.",
    copy: { x: "6vw", y: "10svh", width: "min(38vw, 550px)", align: "left" },
    mobilePosition: "top",
    note: { text: "HMT / GM 320", x: "68vw", y: "76svh", side: "right" },
  },
];

export default function FilmExperience() {
  const rootRef = useRef(null);
  const filmRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const film = filmRef.current;
    const stage = stageRef.current;
    if (!root || !film || !stage) return;

    const video = stage.querySelector(".film-video");
    const chapterCopy = stage.querySelector(".chapter-copy");
    const title = stage.querySelector("[data-title]");
    const kicker = stage.querySelector("[data-kicker]");
    const chapterStep = stage.querySelector("[data-step]");
    const caption = stage.querySelector("[data-caption]");
    const processNote = stage.querySelector("[data-process-note]");
    const progressLabel = stage.querySelector("[data-progress-label]");
    const videoError = stage.querySelector(".video-error");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listeners = new AbortController();

    let scrollProgress = 0;
    let activeChapter = -1;
    let frameRequested = false;
    let duration = 0;
    let frameRequestId = 0;
    let seekTimerId = 0;
    let settleTimerId = 0;
    let seekInFlight = false;
    let seekStartedAt = 0;
    let lastSeekAt = 0;
    let lastSeekDuration = 0;
    let progressPercent = -1;
    let playPending = false;
    let scrollSettled = true;
    let lastVisualProgress = -1;
    const baseSeekInterval = window.matchMedia("(max-width: 700px)").matches ? 75 : 50;
    const maxPlaybackRate = 4;
    const maxPlaybackGap = 0.85;

    function getScrollProgress() {
      const rect = film.getBoundingClientRect();
      const scrollableDistance = Math.max(1, film.offsetHeight - window.innerHeight);
      return Math.min(1, Math.max(0, -rect.top / scrollableDistance));
    }

    function animateChapterCopy(chapterIndex) {
      if (stage.classList.contains("film-stage--clean")) return;
      chapterCopy.getAnimations().forEach((animation) => animation.cancel());
      processNote.getAnimations().forEach((animation) => animation.cancel());
      if (reducedMotion.matches) return;

      const entersFromLeft = chapterIndex % 2 === 0;
      chapterCopy.animate(
        [
          {
            opacity: 0,
            filter: "blur(8px)",
            transform: `translate3d(${entersFromLeft ? "-18px" : "18px"}, 10px, 28px)`,
          },
          { opacity: 1, filter: "blur(0)", transform: "translate3d(0, 0, 28px)" },
        ],
        { duration: 680, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );

      if (!processNote.hidden) {
        processNote.animate(
          [
            { opacity: 0, filter: "blur(4px)" },
            { opacity: 1, filter: "blur(0)" },
          ],
          { duration: 520, delay: 140, fill: "backwards", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      }
    }

    function updateChapter(progress) {
      let nextChapter = 0;
      const videoTime = progress * duration;
      for (let index = 1; index < chapters.length; index += 1) {
        if (videoTime >= chapters[index].time) nextChapter = index;
      }
      if (nextChapter === activeChapter) return;

      activeChapter = nextChapter;
      const chapter = chapters[nextChapter];
      stage.dataset.copyTone = chapter.tone;
      stage.dataset.copyAlign = chapter.copy.align;
      stage.dataset.mobilePosition = chapter.mobilePosition;
      stage.style.setProperty("--copy-left", chapter.copy.x);
      stage.style.setProperty("--copy-top", chapter.copy.y);
      stage.style.setProperty("--copy-width", chapter.copy.width);
      title.innerHTML = chapter.title;
      caption.textContent = chapter.caption;
      kicker.textContent = chapter.kicker;
      chapterStep.textContent = String(nextChapter).padStart(2, "0");
      processNote.textContent = chapter.note?.text || "";
      processNote.hidden = !chapter.note;
      if (chapter.note) {
        processNote.dataset.noteSide = chapter.note.side;
        processNote.style.setProperty("--note-left", chapter.note.x);
        processNote.style.setProperty("--note-top", chapter.note.y);
      }
      animateChapterCopy(nextChapter);
    }

    function seekTo(targetTime) {
      if (seekInFlight || video.seeking) return;
      const elapsed = performance.now() - lastSeekAt;
      const interval = Math.max(baseSeekInterval, Math.min(140, lastSeekDuration));
      if (lastSeekAt && elapsed < interval) {
        if (!seekTimerId) {
          seekTimerId = window.setTimeout(() => {
            seekTimerId = 0;
            requestRender();
          }, interval - elapsed);
        }
        return;
      }

      video.pause();
      seekInFlight = true;
      seekStartedAt = performance.now();
      lastSeekAt = seekStartedAt;
      video.currentTime = targetTime;
    }

    function handleSeeked() {
      if (!seekInFlight) return;
      seekInFlight = false;
      lastSeekDuration = performance.now() - seekStartedAt;
      updateChapter(video.currentTime / duration);
      requestRender();
    }

    function syncVideo() {
      if (duration <= 0 || seekInFlight || video.seeking) return;
      const targetTime = Math.min(duration - 0.001, scrollProgress * duration);
      const gap = targetTime - video.currentTime;

      if (reducedMotion.matches) {
        if (Math.abs(gap) > 0.04) seekTo(targetTime);
        else video.pause();
        return;
      }
      if (gap < (scrollSettled ? -0.04 : -0.12) || gap > maxPlaybackGap) {
        seekTo(targetTime);
        return;
      }
      if (gap <= 0.05) {
        video.pause();
        return;
      }

      // Let the decoder play consecutive frames while the scroll position moves forward.
      const playbackRate = Math.round(Math.max(0.5, Math.min(maxPlaybackRate, gap * 8)) * 4) / 4;
      if (Math.abs(video.playbackRate - playbackRate) >= 0.25) {
        video.playbackRate = playbackRate;
      }
      if (video.paused && !playPending) {
        playPending = true;
        video.play().catch(() => {}).finally(() => {
          playPending = false;
          requestRender();
        });
      }
    }

    function render() {
      frameRequested = false;
      scrollProgress = getScrollProgress();

      if (scrollProgress !== lastVisualProgress) {
        stage.style.setProperty("--film-progress", scrollProgress.toFixed(4));
        lastVisualProgress = scrollProgress;
      }

      const nextProgressPercent = Math.round(scrollProgress * 100);
      if (nextProgressPercent !== progressPercent) {
        progressPercent = nextProgressPercent;
        progressLabel.textContent = String(progressPercent).padStart(2, "0");
      }

      updateChapter(duration > 0 ? video.currentTime / duration : scrollProgress);
      syncVideo();
      if (!video.paused && !seekInFlight) requestRender();
    }

    function requestRender() {
      if (frameRequested) return;
      frameRequested = true;
      frameRequestId = window.requestAnimationFrame(render);
    }

    function handleScroll() {
      scrollSettled = false;
      window.clearTimeout(settleTimerId);
      settleTimerId = window.setTimeout(() => {
        scrollSettled = true;
        requestRender();
      }, 140);
      requestRender();
    }

    function handleLoadedMetadata() {
      if (Number.isFinite(video.duration)) {
        duration = video.duration;
      }
      requestRender();
    }

    const options = { signal: listeners.signal };
    window.addEventListener("scroll", handleScroll, { ...options, passive: true });
    window.addEventListener("resize", requestRender, options);
    video.addEventListener("loadedmetadata", handleLoadedMetadata, options);
    video.addEventListener("seeked", handleSeeked, options);
    video.addEventListener("error", () => {
      videoError.hidden = false;
      console.error("The film video could not be decoded. The browser may not support this video format.");
    }, options);

    if (video.readyState >= 1) handleLoadedMetadata();
    requestRender();

    return () => {
      listeners.abort();
      window.cancelAnimationFrame(frameRequestId);
      window.clearTimeout(seekTimerId);
      window.clearTimeout(settleTimerId);
      chapterCopy.getAnimations().forEach((animation) => animation.cancel());
      processNote.getAnimations().forEach((animation) => animation.cancel());
      video.pause();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <header className="site-nav">
        <a className="site-nav-brand" href="#begin" aria-label="HMT home">
          HMT
        </a>
        <nav className="site-nav-links" aria-label="Main navigation">
          <a href="#film">THE FILM</a>
        </nav>
      </header>
      <main id="begin">
        <section ref={filmRef} className="film" id="film" aria-label="Scroll-controlled film">
          <div
            ref={stageRef}
            className="film-stage film-stage--clean"
            data-copy-tone={chapters[0].tone}
            data-copy-align={chapters[0].copy.align}
            data-mobile-position={chapters[0].mobilePosition}
            style={{
              "--copy-left": chapters[0].copy.x,
              "--copy-top": chapters[0].copy.y,
              "--copy-width": chapters[0].copy.width,
            }}
          >
            <video
              className="film-video"
              preload="auto"
              muted
              playsInline
              aria-label="Full-screen film synchronized with page scroll"
            >
              <source src="/1011-scroll.mp4" type="video/mp4" />
              <source src="/hiii.mp4" type="video/mp4" />
            </video>
            <div className="chapter-copy" aria-hidden="true">
              <p className="chapter-kicker">
                <span className="chapter-step">
                  <span data-step>00</span>
                  <span aria-hidden="true"> / {String(chapters.length - 1).padStart(2, "0")}</span>
                </span>
                <span className="chapter-dot" aria-hidden="true" />
                <span data-kicker>{chapters[0].kicker}</span>
              </p>
              <h1
                className="chapter-title"
                data-title
                dangerouslySetInnerHTML={{ __html: chapters[0].title }}
              />
              <p className="chapter-caption" data-caption>
                {chapters[0].caption}
              </p>
            </div>

            <p className="process-note" data-process-note hidden />

            <div className="film-progress" aria-hidden="true">
              <span className="film-progress-name">GREENFIELD / BUILD SEQUENCE</span>
              <span className="film-progress-track">
                <span className="film-progress-value" />
              </span>
              <span className="film-progress-number" data-progress-label>00</span>
              <span className="film-progress-unit">%</span>
            </div>

            <p className="video-error" role="status" hidden>
              This browser can’t decode the video. Please use an MP4 (H.264) video for browser playback.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
