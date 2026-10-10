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
    let lastRenderTimestamp = null;
    let activeChapter = -1;
    let frameRequested = false;
    let duration = 0;
    let seekTimeout = 0;
    let frameRequestId = 0;
    let mobileSeekTimerId = 0;
    let mobileSeekInFlight = false;
    let mobileSeekTargetTime = null;
    let lastMobileSeekAt = 0;
    let lastSeekDuration = 0;
    let progressPercent = -1;
    let videoFrameCallbackId = null;
    const smoothMobileSeeking = window.matchMedia("(max-width: 700px)").matches;
    const baseSeekInterval = 33;
    const maxScrollPlaybackRate = 8;
    const hasVideoFrameCallback = typeof video.requestVideoFrameCallback === "function";

    function getScrollProgress() {
      const rect = film.getBoundingClientRect();
      const scrollableDistance = Math.max(1, film.offsetHeight - window.innerHeight);
      return Math.min(1, Math.max(0, -rect.top / scrollableDistance));
    }

    function animateChapterCopy(chapterIndex) {
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

    function seekToProgress(progress) {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const targetTime = progress * video.duration;

      if (smoothMobileSeeking) {
        mobileSeekTargetTime = targetTime;
        scheduleMobileSeek();
        return;
      }

      if (Math.abs(video.currentTime - targetTime) < 0.04) return;
      video.currentTime = targetTime;
    }

    function scheduleMobileSeek() {
      if (mobileSeekTimerId || mobileSeekInFlight || mobileSeekTargetTime === null) return;
      
      const interval = smoothMobileSeeking 
        ? Math.max(baseSeekInterval, lastSeekDuration * 1.1)
        : baseSeekInterval;
      const wait = Math.max(0, interval - (Date.now() - lastMobileSeekAt));
      mobileSeekTimerId = window.setTimeout(flushMobileSeek, wait);
    }

    function flushMobileSeek() {
      mobileSeekTimerId = 0;
      if (mobileSeekInFlight || mobileSeekTargetTime === null || video.seeking) return;

      const targetTime = mobileSeekTargetTime;
      mobileSeekTargetTime = null;
      
      if (Math.abs(video.currentTime - targetTime) < 0.04) {
        return;
      }

      mobileSeekInFlight = true;
      const seekStartTime = Date.now();
      lastMobileSeekAt = seekStartTime;
      video.currentTime = targetTime;
      
      if (hasVideoFrameCallback && videoFrameCallbackId === null) {
        videoFrameCallbackId = video.requestVideoFrameCallback(() => {
          videoFrameCallbackId = null;
          lastSeekDuration = Math.max(20, Date.now() - seekStartTime);
          handleMobileSeeked();
        });
      }
    }

    function handleMobileSeeked() {
      if (!smoothMobileSeeking) return;
      mobileSeekInFlight = false;
      if (duration > 0) {
        updateChapter(video.currentTime / duration);
      }
      if (mobileSeekTargetTime !== null) {
        scheduleMobileSeek();
      }
    }

    function finishMobileScroll() {
      if (!smoothMobileSeeking) return;
      mobileSeekTargetTime = scrollProgress * duration;
      scheduleMobileSeek();
    }

    function render(timestamp) {
      frameRequested = false;
      const targetProgress = getScrollProgress();
      if (lastRenderTimestamp === null || reducedMotion.matches || duration <= 0) {
        scrollProgress = targetProgress;
      } else {
        const elapsed = Math.min(0.05, (timestamp - lastRenderTimestamp) / 1000);
        const difference = targetProgress - scrollProgress;
        const easedStep = difference * (1 - Math.exp(-elapsed / 0.22));
        const maxStep = (elapsed * maxScrollPlaybackRate) / duration;
        scrollProgress += Math.sign(difference) * Math.min(Math.abs(easedStep), maxStep);
      }
      lastRenderTimestamp = timestamp;

      const tiltFactor = reducedMotion.matches ? 0 : 1;
      const pointerX = Number(stage.dataset.pointerX || 0);
      const pointerY = Number(stage.dataset.pointerY || 0);
      const scrollTilt = (scrollProgress - 0.5) * 1.5;
      stage.style.setProperty("--parallax-x", `${(pointerX * 8 * tiltFactor).toFixed(1)}px`);
      stage.style.setProperty("--parallax-y", `${(pointerY * 8 * tiltFactor).toFixed(1)}px`);
      stage.style.setProperty("--copy-x", `${(pointerX * -9 * tiltFactor).toFixed(1)}px`);
      stage.style.setProperty("--copy-y", `${(pointerY * -7 * tiltFactor).toFixed(1)}px`);
      stage.style.setProperty(
        "--video-tilt-x",
        `${((scrollProgress - 0.5) * 0.8 - pointerY * tiltFactor * 1.2).toFixed(2)}deg`,
      );
      stage.style.setProperty("--video-tilt-y", `${(pointerX * tiltFactor * 1.6).toFixed(2)}deg`);
      stage.style.setProperty("--video-scale", (1.045 + Math.abs(scrollTilt) * 0.012).toFixed(4));
      stage.style.setProperty("--film-progress", scrollProgress.toFixed(4));

      const nextProgressPercent = Math.round(scrollProgress * 100);
      if (nextProgressPercent !== progressPercent) {
        progressPercent = nextProgressPercent;
        progressLabel.textContent = String(progressPercent).padStart(2, "0");
      }

      const chapterProgress = smoothMobileSeeking && duration > 0
        ? video.currentTime / duration
        : scrollProgress;
      updateChapter(chapterProgress);
      seekToProgress(scrollProgress);
      if (Math.abs(targetProgress - scrollProgress) > 0.0001) {
        requestRender();
      }
    }

    function requestRender() {
      if (frameRequested) return;
      frameRequested = true;
      frameRequestId = window.requestAnimationFrame(render);
    }

    function handleScroll() {
      if (smoothMobileSeeking) {
        window.clearTimeout(seekTimeout);
        seekTimeout = window.setTimeout(finishMobileScroll, 140);
      }
      requestRender();
    }

    function handlePointerMove(event) {
      if (reducedMotion.matches) return;
      const bounds = stage.getBoundingClientRect();
      stage.dataset.pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3);
      stage.dataset.pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3);
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
    stage.addEventListener("pointermove", handlePointerMove, options);
    stage.addEventListener("pointerleave", () => {
      stage.dataset.pointerX = "0";
      stage.dataset.pointerY = "0";
      requestRender();
    }, options);
    video.addEventListener("loadedmetadata", handleLoadedMetadata, options);
    video.addEventListener("seeked", handleMobileSeeked, options);
    video.addEventListener("error", () => {
      videoError.hidden = false;
      console.error("The film video could not be decoded. The browser may not support this video format.");
    }, options);

    if (video.readyState >= 1) handleLoadedMetadata();
    requestRender();

    return () => {
      listeners.abort();
      window.cancelAnimationFrame(frameRequestId);
      window.clearTimeout(mobileSeekTimerId);
      window.clearTimeout(seekTimeout);
      if (videoFrameCallbackId !== null && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(videoFrameCallbackId);
      }
      chapterCopy.getAnimations().forEach((animation) => animation.cancel());
      processNote.getAnimations().forEach((animation) => animation.cancel());
      video.pause();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <main id="begin">
        <section ref={filmRef} className="film" id="film" aria-label="Scroll-controlled film">
          <div
            ref={stageRef}
            className="film-stage"
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
              <source src="/HMT_0001-3120.mkv" type="video/x-matroska" />
              <source src="/hiii.mp4" type="video/mp4" />
            </video>
            <div className="film-grade" aria-hidden="true" />
            <div className="film-grain" aria-hidden="true" />
            <div className="film-edge" aria-hidden="true" />

            <div className="chapter-copy" aria-live="polite" aria-atomic="true">
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
