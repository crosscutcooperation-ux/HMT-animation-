"use client";

import { useEffect, useRef } from "react";

const chapters = [
  {
    time: 0,
    tone: "site",
    title: "From bare land<br />to production <em>start-up.</em>",
    position: "top-left",
    kicker: "ENGINEERING & PROJECT DEVELOPMENT",
    caption: "Land, utilities and building constraints measured before drawings lock.",
  },
  {
    time: 13,
    tone: "civil",
    title: "Land &<br /><em>civil.</em>",
    position: "top-right",
    kicker: "LAND & CIVIL",
    caption: "Survey, infrastructure, PEB buildings, epoxy floors and the utilities a hall needs before a machine arrives.",
  },
  {
    time: 18,
    tone: "steel",
    title: "PEB<br /><em>buildings.</em>",
    position: "bottom-left",
    kicker: "PEB BUILDINGS",
    caption: "Pre-engineered structures sized for cranes, spans and future bays.",
    note: "CRANE CLEARANCE",
    notePosition: "top-right",
  },
  {
    time: 25,
    tone: "epoxy",
    title: "Epoxy <em>flooring.</em>",
    position: "top-right",
    kicker: "EPOXY FLOORING",
    caption: "Load-rated, chemical-resistant floors finished before machines are set.",
    note: "FINISH BEFORE MACHINE SET",
    notePosition: "bottom-left",
  },
  {
    time: 39,
    tone: "delivery",
    title: "New machine<br /><em>procurement.</em>",
    position: "top-left",
    kicker: "NEW MACHINE PROCUREMENT",
    caption: "OEM specification, vendor control and delivery locked to the construction schedule.",
  },
  {
    time: 50,
    tone: "handling",
    title: "Machine<br /><em>transportation.</em>",
    position: "top-right",
    kicker: "MACHINE TRANSPORTATION",
    caption: "Machines are transported to the planned installation bays.",
    note: "LIFT PLAN",
    notePosition: "bottom-left",
  },
  {
    time: 70,
    tone: "crane",
    title: "EOT crane supply<br /><em>& installation.</em>",
    position: "top-left",
    kicker: "EOT CRANE SUPPLY & INSTALLATION",
    caption: "Gantry, runway and crane commissioning so the hall can lift from day one.",
  },
  {
    time: 78,
    tone: "installation",
    title: "Machine<br /><em>installation.</em>",
    position: "top-right",
    kicker: "MACHINE INSTALLATION",
    caption: "Machine installation, commissioning and production line integration.",
  },
  {
    time: 101,
    tone: "controls",
    title: "PLC<br /><em>integration.</em>",
    position: "top-right",
    kicker: "PLC INTEGRATION",
    caption: "Controls, drives and interlocks written to the process narrative.",
    note: "CONTROLS → DRIVES → INTERLOCKS",
    notePosition: "bottom-left",
  },
  {
    time: 110,
    tone: "commissioning",
    title: "Trial production<br /><em>support.</em>",
    position: "top-left",
    kicker: "TRIAL PRODUCTION SUPPORT",
    caption: "PLC integration, automation, trial production and technical support through the first stable runs.",
    note: "FIRST STABLE RUN",
    notePosition: "bottom-right",
  },
];

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

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
    const progressTrack = stage.querySelector(".progress-track");
    const currentReadout = stage.querySelector("[data-current]");
    const durationReadout = stage.querySelector("[data-duration]");
    const chapterCopy = stage.querySelector(".chapter-copy");
    const title = stage.querySelector("[data-title]");
    const kicker = stage.querySelector("[data-kicker]");
    const caption = stage.querySelector("[data-caption]");
    const processNote = stage.querySelector("[data-process-note]");
    const playToggle = stage.querySelector(".play-toggle");
    const playLabel = stage.querySelector("[data-play-label]");
    const videoError = stage.querySelector(".video-error");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listeners = new AbortController();

    let scrollProgress = 0;
    let lastRenderTimestamp = null;
    let isPlaying = false;
    let playbackScrollProgress = 0;
    let isSeekingFromScroll = false;
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
      if (reducedMotion.matches) return;

      const entersFromLeft = chapterIndex % 2 === 0;
      chapterCopy.animate(
        [
          {
            opacity: 0.25,
            transform: `translate3d(${entersFromLeft ? "-12px" : "12px"}, 0, 28px)`,
          },
          { opacity: 1, transform: "translate3d(0, 0, 28px)" },
        ],
        { duration: 480, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
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
      stage.dataset.copyPosition = chapter.position;
      stage.dataset.copyTone = chapter.tone;
      title.innerHTML = chapter.title;
      caption.textContent = chapter.caption;
      kicker.textContent = chapter.kicker;
      processNote.textContent = chapter.note || "";
      processNote.hidden = !chapter.note;
      if (chapter.notePosition) {
        processNote.dataset.notePosition = chapter.notePosition;
      } else {
        delete processNote.dataset.notePosition;
      }
      animateChapterCopy(nextChapter);
    }

    function updateProgress(progress, time) {
      const percent = Math.round(progress * 100);
      progressTrack.value = String(Math.round(progress * Number(progressTrack.max)));
      progressTrack.style.setProperty("--progress", `${percent}%`);
      progressTrack.setAttribute("aria-valuetext", formatTime(time));
      currentReadout.textContent = formatTime(time);
    }

    function seekToProgress(progress) {
      if (!Number.isFinite(video.duration) || video.duration <= 0 || isPlaying) return;
      const targetTime = progress * video.duration;

      if (smoothMobileSeeking) {
        mobileSeekTargetTime = targetTime;
        isSeekingFromScroll = true;
        scheduleMobileSeek();
        return;
      }

      if (Math.abs(video.currentTime - targetTime) < 0.04) return;
      isSeekingFromScroll = true;
      video.currentTime = targetTime;
      window.clearTimeout(seekTimeout);
      seekTimeout = window.setTimeout(() => {
        isSeekingFromScroll = false;
      }, 120);
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
        isSeekingFromScroll = false;
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
      if (mobileSeekTargetTime !== null) {
        scheduleMobileSeek();
        return;
      }
      isSeekingFromScroll = false;
    }

    function finishMobileScroll() {
      if (!smoothMobileSeeking || isPlaying) return;
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

      if (!isPlaying) {
        const time = scrollProgress * duration;
        updateProgress(scrollProgress, time);
        updateChapter(scrollProgress);
        seekToProgress(scrollProgress);
      }
      if (!isPlaying && Math.abs(targetProgress - scrollProgress) > 0.0001) {
        requestRender();
      }
    }

    function requestRender() {
      if (frameRequested) return;
      frameRequested = true;
      frameRequestId = window.requestAnimationFrame(render);
    }

    function setProgressFromScroll(progress) {
      const boundedProgress = Math.min(1, Math.max(0, progress));
      const filmTop = window.scrollY + film.getBoundingClientRect().top;
      const filmScrollDistance = film.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: filmTop + boundedProgress * filmScrollDistance,
        behavior: "instant",
      });
      requestRender();
    }

    function setPlaying(playing) {
      isPlaying = playing;
      playToggle.setAttribute("aria-pressed", String(playing));
      playToggle.setAttribute("aria-label", playing ? "Pause film" : "Play film");
      playLabel.textContent = playing ? "PAUSE FILM" : "PLAY FILM";
      if (playing) {
        playbackScrollProgress = getScrollProgress();
        video.play().catch((error) => {
          isPlaying = false;
          playToggle.setAttribute("aria-pressed", "false");
          playToggle.setAttribute("aria-label", "Play film");
          playLabel.textContent = "PLAY FILM";
          console.error("Unable to play the film:", error);
        });
        return;
      }
      video.pause();
      requestRender();
    }

    function handleScroll() {
      if (isPlaying && Math.abs(getScrollProgress() - playbackScrollProgress) > 0.0005) {
        setPlaying(false);
      }
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
        durationReadout.textContent = formatTime(duration);
      }
      requestRender();
    }

    function handleTimeUpdate() {
      if (!isPlaying || isSeekingFromScroll) return;
      const progress = video.duration ? video.currentTime / video.duration : 0;
      updateProgress(progress, video.currentTime);
      updateChapter(progress);
    }

    function handleProgressKeydown(event) {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const current = Number(progressTrack.value) / Number(progressTrack.max);
      const next = event.key === "Home"
        ? 0
        : event.key === "End"
          ? 1
          : current + (event.key === "ArrowRight" ? 0.01 : -0.01);
      setProgressFromScroll(next);
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
    video.addEventListener("timeupdate", handleTimeUpdate, options);
    video.addEventListener("seeked", handleMobileSeeked, options);
    video.addEventListener("ended", () => setPlaying(false), options);
    video.addEventListener("error", () => {
      videoError.hidden = false;
      console.error("The film video could not be decoded. The browser may not support this video format.");
    }, options);
    playToggle.addEventListener("click", () => setPlaying(!isPlaying), options);
    progressTrack.addEventListener("input", () => {
      if (isPlaying) setPlaying(false);
      setProgressFromScroll(Number(progressTrack.value) / Number(progressTrack.max));
    }, options);
    progressTrack.addEventListener("keydown", handleProgressKeydown, options);

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
      video.pause();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <main id="begin">
        <section ref={filmRef} className="film" id="film" aria-label="Scroll-controlled film">
          <div ref={stageRef} className="film-stage">
            <video
              className="film-video"
              preload="auto"
              muted
              playsInline
              aria-label="Full-screen film synchronized with page scroll"
            >
              <source src="/0001-2840.mkv" type="video/x-matroska" />
              <source src="/hiii.mp4" type="video/mp4" />
            </video>
            <div className="film-grade" aria-hidden="true" />
            <div className="film-grain" aria-hidden="true" />
            <div className="film-edge" aria-hidden="true" />

            <div className="chapter-copy" aria-live="polite" aria-atomic="true">
              <p className="chapter-kicker">
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

            <p
              className="process-note"
              data-process-note
              data-note-position={chapters[0].notePosition}
              hidden
            />

            <div className="film-bottomline">
              <span className="time-readout">
                <span data-current>00:00</span><span className="time-divider"> / </span><span data-duration>00:00</span>
              </span>
              <div className="progress-control">
                <label className="sr-only" htmlFor="film-progress">Film position</label>
                <input
                  className="progress-track"
                  id="film-progress"
                  type="range"
                  min="0"
                  max="1000"
                  defaultValue="0"
                  step="1"
                  aria-valuetext="00:00"
                />
              </div>
              <button className="play-toggle" type="button" aria-label="Play film" aria-pressed="false">
                <span className="play-icon" aria-hidden="true" />
                <span data-play-label>PLAY FILM</span>
              </button>
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
