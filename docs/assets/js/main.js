(function () {
  const setupStep = document.getElementById("setupStep");
  const videoStep = document.getElementById("videoStep");
  const timelineStep = document.getElementById("timelineStep");

  const setupForm = document.getElementById("setupForm");
  const setupCarousel = document.getElementById("setupCarousel");
  const setupTrack = document.getElementById("setupTrack");
  const userNameInput = document.getElementById("userName");
  const tasteGrid = document.getElementById("tasteGrid");
  const spotifyLinkInput = document.getElementById("spotifyLink");
  const setupMessage = document.getElementById("setupMessage");

  const contextVideo = document.getElementById("contextVideo");
  const statusPill = document.getElementById("statusPill");
  const timelineTitle = document.getElementById("timelineTitle");
  const timelineList = document.getElementById("timelineList");
  const navLeftBtn = document.getElementById("navLeftBtn");
  const navRightBtn = document.getElementById("navRightBtn");

  const steps = [setupStep, videoStep, timelineStep];

  const defaultSongs = [
    { title: "City Pulse at Dawn", mood: "Focused", date: "2026-02-11", time: "08:07", mark: "CP" },
    { title: "Skybridge Drift", mood: "Curious", date: "2026-02-12", time: "12:16", mark: "SD" },
    { title: "Neon Soft Reset", mood: "Reflective", date: "2026-02-13", time: "18:44", mark: "NS" },
    { title: "Moonlight Terminal", mood: "Calm", date: "2026-02-14", time: "22:11", mark: "MT" },
    { title: "Rain Over Valencia", mood: "Reflective", date: "2026-01-29", time: "20:02", mark: "RV" },
    { title: "Station Lights", mood: "Focused", date: "2026-01-25", time: "07:46", mark: "SL" },
    { title: "Glass Garden", mood: "Calm", date: "2026-01-20", time: "17:58", mark: "GG" },
    { title: "Afterglow Arcade", mood: "Curious", date: "2026-01-16", time: "21:13", mark: "AA" },
    { title: "Static Sunrise", mood: "Focused", date: "2026-01-11", time: "06:39", mark: "SS" },
    { title: "Echoes on Market", mood: "Reflective", date: "2026-01-06", time: "19:24", mark: "EM" },
    { title: "Coastline Memory", mood: "Calm", date: "2025-12-28", time: "15:33", mark: "CM" },
    { title: "Velvet Subways", mood: "Curious", date: "2025-12-22", time: "23:01", mark: "VS" },
    { title: "Satellite Window", mood: "Focused", date: "2025-12-18", time: "09:12", mark: "SW" },
    { title: "Soft Orbit", mood: "Calm", date: "2025-12-12", time: "13:50", mark: "SO" },
    { title: "Polaroid Neon", mood: "Reflective", date: "2025-12-08", time: "18:17", mark: "PN" },
    { title: "Aurora in Transit", mood: "Curious", date: "2025-12-03", time: "22:27", mark: "AT" },
    { title: "Quiet District", mood: "Calm", date: "2025-11-27", time: "16:08", mark: "QD" },
    { title: "Blueprint for Morning", mood: "Focused", date: "2025-11-21", time: "08:02", mark: "BM" },
    { title: "Film Grain Nights", mood: "Reflective", date: "2025-11-14", time: "21:42", mark: "FN" },
    { title: "Luminous Harbor", mood: "Curious", date: "2025-11-08", time: "14:55", mark: "LH" }
  ];

  const SWIPE_THRESHOLD = 55;
  const WHEEL_THRESHOLD = 90;

  let demoUser = "Demo User";
  let setupPane = 0;
  let secondsLeft = 3;
  let hasTransitionedToTimeline = false;

  let countdownId;
  let videoTransitionTimeoutId;

  let setupTouchStartX = null;
  let setupTouchStartY = null;
  let setupPointerStartX = null;
  let setupPointerStartY = null;
  let setupWheelAccum = 0;
  let setupWheelResetId;

  let videoTouchStartX = null;
  let videoTouchStartY = null;
  let videoPointerStartX = null;
  let videoPointerStartY = null;
  let videoWheelAccum = 0;
  let videoWheelResetId;

  let timelineTouchStartX = null;
  let timelineTouchStartY = null;
  let timelinePointerStartX = null;
  let timelinePointerStartY = null;
  let timelineWheelAccum = 0;
  let timelineWheelResetId;

  function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function setStatus(message) {
    statusPill.textContent = message;
  }

  function clearVideoTransitionTimeout() {
    clearTimeout(videoTransitionTimeoutId);
    videoTransitionTimeoutId = undefined;
  }

  async function playContextVideo() {
    contextVideo.currentTime = 0;
    try {
      await contextVideo.play();
    } catch (error) {
      // Autoplay can be blocked by browser policy.
    }
  }

  function showSetupPane(paneIndex) {
    setupPane = Math.max(0, Math.min(1, paneIndex));
    setupTrack.style.setProperty("--setup-pane", String(setupPane));
    setupTrack.dataset.pane = String(setupPane);
    setupMessage.textContent = "";
  }

  function canAdvanceFromName() {
    if (!userNameInput.value.trim()) {
      setupMessage.textContent = "Please add a demo user name.";
      userNameInput.focus();
      return false;
    }
    return true;
  }

  function selectedTasteValues() {
    return Array.from(tasteGrid.querySelectorAll(".taste-card.active")).map((card) =>
      card.getAttribute("data-taste")
    );
  }

  function formatTimelineDate(dateValue) {
    const parsed = dateValue ? new Date(dateValue) : new Date();
    const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return safeDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function renderTimeline(songs) {
    timelineList.innerHTML = "";

    songs.forEach((song) => {
      const moodAccentMap = {
        focused: "#38bdf8",
        curious: "#22c55e",
        reflective: "#a78bfa",
        calm: "#14b8a6"
      };
      const accent = song.discAccent || moodAccentMap[String(song.mood || "").toLowerCase()] || "#38bdf8";

      const item = document.createElement("article");
      item.className = "timeline-item";

      const thumb = document.createElement("div");
      thumb.className = "thumb";
      thumb.style.setProperty("--disc-accent", accent);

      const content = document.createElement("div");
      content.className = "timeline-card";

      const meta = document.createElement("p");
      meta.className = "timeline-meta";
      const dateLabel = formatTimelineDate(song.date);
      meta.textContent = `${dateLabel} • ${song.time || "Recent"}`;

      const title = document.createElement("h3");
      title.className = "timeline-title";
      title.textContent = song.title;

      const mood = document.createElement("p");
      mood.className = "timeline-mood";
      mood.textContent = `Mood: ${song.mood}`;

      content.append(meta, title, mood);
      item.append(thumb, content);
      timelineList.appendChild(item);
    });
  }

  function goToStep(stepId) {
    steps.forEach((step) => step.classList.add("hidden"));

    if (stepId === "setup") {
      setupStep.classList.remove("hidden");
      setStatus(`Demo time remaining: ${formatTime(secondsLeft)}`);
      updateNavButtons();
      return;
    }

    if (stepId === "video") {
      videoStep.classList.remove("hidden");
      setStatus(`In progress: ${formatTime(secondsLeft)}`);
      clearVideoTransitionTimeout();
      videoTransitionTimeoutId = window.setTimeout(() => {
        simulateSongReceive();
      }, Math.max(1000, secondsLeft * 1000));
      playContextVideo();
      updateNavButtons();
      return;
    }

    timelineStep.classList.remove("hidden");
    setStatus(`Complete: ${formatTime(secondsLeft)} remaining`);
    updateNavButtons();
  }

  function startCountdown() {
    clearInterval(countdownId);
    countdownId = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        secondsLeft = 0;
        clearInterval(countdownId);
      }

      if (!timelineStep.classList.contains("hidden")) {
        setStatus(`Complete: ${formatTime(secondsLeft)} remaining`);
      } else {
        setStatus(`In progress: ${formatTime(secondsLeft)}`);
      }
    }, 1000);
  }

  function finalizeAndShowTimeline(songs) {
    if (hasTransitionedToTimeline) {
      return;
    }

    hasTransitionedToTimeline = true;
    clearVideoTransitionTimeout();
    timelineTitle.textContent = "Your timeline";
    renderTimeline(songs);
    goToStep("timeline");
  }

  function simulateSongReceive() {
    finalizeAndShowTimeline(defaultSongs);
  }

  function startDemoFromSetup() {
    const formData = new FormData(setupForm);
    const enteredName = String(formData.get("userName") || "").trim();

    if (!enteredName) {
      setupMessage.textContent = "Please add a demo user name.";
      return false;
    }

    const spotifyProvided = Boolean(spotifyLinkInput.value.trim());
    const selected = selectedTasteValues();
    if (!spotifyProvided && selected.length === 0) {
      setupMessage.textContent = "Add a Spotify link or choose at least one music preference.";
      return false;
    }

    demoUser = enteredName;
    hasTransitionedToTimeline = false;
    setupMessage.textContent = "";
    goToStep("video");
    startCountdown();
    return true;
  }

  function resetDemoToSetup() {
    demoUser = "Demo User";
    hasTransitionedToTimeline = false;
    secondsLeft = 3;
    clearInterval(countdownId);
    clearVideoTransitionTimeout();
    setupForm.reset();
    setupMessage.textContent = "";
    contextVideo.pause();
    contextVideo.currentTime = 0;
    timelineList.innerHTML = "";
    showSetupPane(0);
    tasteGrid.querySelectorAll(".taste-card").forEach((card) => {
      card.classList.remove("active");
      card.setAttribute("aria-pressed", "false");
    });
    goToStep("setup");
  }

  function updateNavButtons() {
    if (!setupStep.classList.contains("hidden")) {
      navLeftBtn.disabled = setupPane === 0;
      navRightBtn.disabled = false;
      return;
    }

    if (!videoStep.classList.contains("hidden")) {
      navLeftBtn.disabled = false;
      navRightBtn.disabled = false;
      return;
    }

    navLeftBtn.disabled = false;
    navRightBtn.disabled = false;
  }

  function goBackToSetupFromVideo() {
    contextVideo.pause();
    contextVideo.currentTime = 0;
    clearVideoTransitionTimeout();
    goToStep("setup");
  }

  function goToTimelineFromVideo() {
    simulateSongReceive();
  }

  function goBackToVideoFromTimeline() {
    hasTransitionedToTimeline = false;
    goToStep("video");
  }

  function handleSetupHorizontal(diffX, diffY) {
    if (Math.abs(diffX) <= Math.abs(diffY)) {
      return;
    }

    if (diffX > SWIPE_THRESHOLD && setupPane === 0) {
      if (canAdvanceFromName()) {
        showSetupPane(1);
        updateNavButtons();
      }
      return;
    }

    if (diffX < -SWIPE_THRESHOLD && setupPane === 1) {
      showSetupPane(0);
      updateNavButtons();
      return;
    }

    if (diffX > SWIPE_THRESHOLD && setupPane === 1) {
      startDemoFromSetup();
    }
  }

  function handleVideoHorizontal(diffX, diffY) {
    if (Math.abs(diffX) <= Math.abs(diffY)) {
      return;
    }

    if (diffX > SWIPE_THRESHOLD) {
      goToTimelineFromVideo();
      return;
    }

    if (diffX < -SWIPE_THRESHOLD) {
      goBackToSetupFromVideo();
    }
  }

  function handleTimelineHorizontal(diffX, diffY) {
    if (Math.abs(diffX) <= Math.abs(diffY)) {
      return;
    }

    if (diffX > SWIPE_THRESHOLD) {
      resetDemoToSetup();
      return;
    }

    if (diffX < -SWIPE_THRESHOLD) {
      goBackToVideoFromTimeline();
    }
  }

  userNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (canAdvanceFromName()) {
        showSetupPane(1);
        updateNavButtons();
      }
    }
  });

  navLeftBtn.addEventListener("click", () => {
    if (!setupStep.classList.contains("hidden")) {
      if (setupPane === 1) {
        showSetupPane(0);
      }
      updateNavButtons();
      return;
    }

    if (!videoStep.classList.contains("hidden")) {
      goBackToSetupFromVideo();
      return;
    }

    if (!timelineStep.classList.contains("hidden")) {
      goBackToVideoFromTimeline();
    }
  });

  navRightBtn.addEventListener("click", () => {
    if (!setupStep.classList.contains("hidden")) {
      if (setupPane === 0) {
        if (canAdvanceFromName()) {
          showSetupPane(1);
          updateNavButtons();
        }
      } else {
        startDemoFromSetup();
      }
      return;
    }

    if (!videoStep.classList.contains("hidden")) {
      goToTimelineFromVideo();
      return;
    }

    if (!timelineStep.classList.contains("hidden")) {
      resetDemoToSetup();
    }
  });

  setupCarousel.addEventListener(
    "touchstart",
    (event) => {
      setupTouchStartX = event.touches[0].clientX;
      setupTouchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  setupCarousel.addEventListener(
    "touchend",
    (event) => {
      if (setupTouchStartX === null || setupTouchStartY === null) {
        return;
      }
      const diffX = event.changedTouches[0].clientX - setupTouchStartX;
      const diffY = event.changedTouches[0].clientY - setupTouchStartY;
      setupTouchStartX = null;
      setupTouchStartY = null;
      handleSetupHorizontal(diffX, diffY);
    },
    { passive: true }
  );

  setupCarousel.addEventListener("pointerdown", (event) => {
    setupPointerStartX = event.clientX;
    setupPointerStartY = event.clientY;
  });

  setupCarousel.addEventListener("pointerup", (event) => {
    if (setupPointerStartX === null || setupPointerStartY === null) {
      return;
    }
    const diffX = event.clientX - setupPointerStartX;
    const diffY = event.clientY - setupPointerStartY;
    setupPointerStartX = null;
    setupPointerStartY = null;
    handleSetupHorizontal(diffX, diffY);
  });

  setupCarousel.addEventListener(
    "wheel",
    (event) => {
      if (setupStep.classList.contains("hidden")) {
        return;
      }
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }
      event.preventDefault();
      setupWheelAccum += event.deltaX;
      clearTimeout(setupWheelResetId);
      setupWheelResetId = window.setTimeout(() => {
        setupWheelAccum = 0;
      }, 220);

      if (setupWheelAccum > WHEEL_THRESHOLD) {
        setupWheelAccum = 0;
        handleSetupHorizontal(100, 0);
      } else if (setupWheelAccum < -WHEEL_THRESHOLD) {
        setupWheelAccum = 0;
        handleSetupHorizontal(-100, 0);
      }
    },
    { passive: false }
  );

  videoStep.addEventListener(
    "touchstart",
    (event) => {
      videoTouchStartX = event.touches[0].clientX;
      videoTouchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  videoStep.addEventListener(
    "touchend",
    (event) => {
      if (videoTouchStartX === null || videoTouchStartY === null) {
        return;
      }
      const diffX = event.changedTouches[0].clientX - videoTouchStartX;
      const diffY = event.changedTouches[0].clientY - videoTouchStartY;
      videoTouchStartX = null;
      videoTouchStartY = null;
      handleVideoHorizontal(diffX, diffY);
    },
    { passive: true }
  );

  videoStep.addEventListener("pointerdown", (event) => {
    videoPointerStartX = event.clientX;
    videoPointerStartY = event.clientY;
  });

  videoStep.addEventListener("pointerup", (event) => {
    if (videoPointerStartX === null || videoPointerStartY === null) {
      return;
    }
    const diffX = event.clientX - videoPointerStartX;
    const diffY = event.clientY - videoPointerStartY;
    videoPointerStartX = null;
    videoPointerStartY = null;
    handleVideoHorizontal(diffX, diffY);
  });

  videoStep.addEventListener(
    "wheel",
    (event) => {
      if (videoStep.classList.contains("hidden")) {
        return;
      }
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }
      event.preventDefault();
      videoWheelAccum += event.deltaX;
      clearTimeout(videoWheelResetId);
      videoWheelResetId = window.setTimeout(() => {
        videoWheelAccum = 0;
      }, 220);

      if (videoWheelAccum > WHEEL_THRESHOLD) {
        videoWheelAccum = 0;
        goToTimelineFromVideo();
      } else if (videoWheelAccum < -WHEEL_THRESHOLD) {
        videoWheelAccum = 0;
        goBackToSetupFromVideo();
      }
    },
    { passive: false }
  );

  timelineStep.addEventListener(
    "touchstart",
    (event) => {
      timelineTouchStartX = event.touches[0].clientX;
      timelineTouchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  timelineStep.addEventListener(
    "touchend",
    (event) => {
      if (timelineTouchStartX === null || timelineTouchStartY === null) {
        return;
      }
      const diffX = event.changedTouches[0].clientX - timelineTouchStartX;
      const diffY = event.changedTouches[0].clientY - timelineTouchStartY;
      timelineTouchStartX = null;
      timelineTouchStartY = null;
      handleTimelineHorizontal(diffX, diffY);
    },
    { passive: true }
  );

  timelineStep.addEventListener("pointerdown", (event) => {
    timelinePointerStartX = event.clientX;
    timelinePointerStartY = event.clientY;
  });

  timelineStep.addEventListener("pointerup", (event) => {
    if (timelinePointerStartX === null || timelinePointerStartY === null) {
      return;
    }
    const diffX = event.clientX - timelinePointerStartX;
    const diffY = event.clientY - timelinePointerStartY;
    timelinePointerStartX = null;
    timelinePointerStartY = null;
    handleTimelineHorizontal(diffX, diffY);
  });

  timelineStep.addEventListener(
    "wheel",
    (event) => {
      if (timelineStep.classList.contains("hidden")) {
        return;
      }
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }
      event.preventDefault();
      timelineWheelAccum += event.deltaX;
      clearTimeout(timelineWheelResetId);
      timelineWheelResetId = window.setTimeout(() => {
        timelineWheelAccum = 0;
      }, 220);

      if (timelineWheelAccum > WHEEL_THRESHOLD) {
        timelineWheelAccum = 0;
        resetDemoToSetup();
      } else if (timelineWheelAccum < -WHEEL_THRESHOLD) {
        timelineWheelAccum = 0;
        goBackToVideoFromTimeline();
      }
    },
    { passive: false }
  );

  tasteGrid.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const card = target.closest(".taste-card");
    if (!(card instanceof HTMLButtonElement)) {
      return;
    }

    card.classList.toggle("active");
    card.setAttribute("aria-pressed", String(card.classList.contains("active")));
  });

  setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    startDemoFromSetup();
  });

  contextVideo.addEventListener("ended", () => {
    window.setTimeout(simulateSongReceive, 900);
  });

  window.SerenityDemo = {
    receiveSunoSongs(songs) {
      if (!Array.isArray(songs) || songs.length === 0) {
        return;
      }

      const normalized = songs.map((song, index) => ({
        title: song.title || `Generated Track ${index + 1}`,
        mood: song.mood || "Unknown",
        date: song.date || new Date().toISOString(),
        time: song.time || "Recent",
        mark: song.mark || `S${index + 1}`,
        discAccent: song.discAccent || "#38bdf8"
      }));

      finalizeAndShowTimeline(normalized);
    }
  };

  showSetupPane(0);
  goToStep("setup");
  updateNavButtons();
})();
