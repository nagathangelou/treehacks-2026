(function () {
  const tabSetup = document.getElementById("tab-setup");
  const tabVideo = document.getElementById("tab-video");
  const tabTimeline = document.getElementById("tab-timeline");
  const setupStep = document.getElementById("setupStep");
  const videoStep = document.getElementById("videoStep");
  const timelineStep = document.getElementById("timelineStep");

  const setupForm = document.getElementById("setupForm");
  const userNameInput = document.getElementById("userName");
  const spotifyBlock = document.getElementById("spotifyBlock");
  const questionBlock = document.getElementById("questionBlock");
  const spotifyLinkInput = document.getElementById("spotifyLink");
  const setupMessage = document.getElementById("setupMessage");

  const contextVideo = document.getElementById("contextVideo");
  const startVideoBtn = document.getElementById("startVideoBtn");
  const skipBtn = document.getElementById("skipBtn");
  const resetBtn = document.getElementById("resetBtn");
  const statusPill = document.getElementById("statusPill");
  const pipelineStatus = document.getElementById("pipelineStatus");
  const timelineTitle = document.getElementById("timelineTitle");
  const timelineList = document.getElementById("timelineList");

  const tabs = [tabSetup, tabVideo, tabTimeline];
  const steps = [setupStep, videoStep, timelineStep];

  const defaultSongs = [
    { title: "City Pulse at Dawn", mood: "Focused", time: "08:07", mark: "CP" },
    { title: "Skybridge Drift", mood: "Curious", time: "12:16", mark: "SD" },
    { title: "Neon Soft Reset", mood: "Reflective", time: "18:44", mark: "NS" },
    { title: "Moonlight Terminal", mood: "Calm", time: "22:11", mark: "MT" }
  ];

  let demoUser = "Demo User";
  let countdownId;
  let secondsLeft = 120;

  function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function setStatus(message) {
    statusPill.textContent = message;
  }

  function renderTimeline(songs) {
    timelineList.innerHTML = "";

    songs.forEach((song, index) => {
      const item = document.createElement("article");
      item.className = "timeline-item";

      const thumb = document.createElement("div");
      thumb.className = "thumb";
      thumb.textContent = song.mark || `S${index + 1}`;

      const content = document.createElement("div");
      const meta = document.createElement("p");
      meta.className = "timeline-meta";
      meta.textContent = `${demoUser} • ${song.time || "Recent"}`;

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
    tabs.forEach((tab) => tab.classList.remove("active"));

    if (stepId === "setup") {
      setupStep.classList.remove("hidden");
      tabSetup.classList.add("active");
      setStatus(`Demo window: ${formatTime(secondsLeft)}`);
      return;
    }

    if (stepId === "video") {
      videoStep.classList.remove("hidden");
      tabVideo.classList.add("active");
      setStatus(`In progress: ${formatTime(secondsLeft)}`);
      return;
    }

    timelineStep.classList.remove("hidden");
    tabTimeline.classList.add("active");
    setStatus(`Complete: ${formatTime(secondsLeft)} remaining`);
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
    pipelineStatus.textContent = "Suno songs received. Building timeline...";
    timelineTitle.textContent = `${demoUser}'s Serenity Timeline`;
    renderTimeline(songs);
    goToStep("timeline");
  }

  function simulateSongReceive() {
    const personalizedSongs = defaultSongs.map((song) => ({
      ...song,
      title: `${demoUser} - ${song.title}`
    }));
    finalizeAndShowTimeline(personalizedSongs);
  }

  document.querySelectorAll('input[name="captureMethod"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.value === "spotify" && input.checked) {
        spotifyBlock.classList.remove("hidden");
        questionBlock.classList.add("hidden");
      }

      if (input.value === "questions" && input.checked) {
        questionBlock.classList.remove("hidden");
        spotifyBlock.classList.add("hidden");
      }
    });
  });

  setupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(setupForm);
    const captureMethod = formData.get("captureMethod");
    const enteredName = String(formData.get("userName") || "").trim();

    if (!enteredName) {
      setupMessage.textContent = "Please add a demo user name.";
      return;
    }

    if (captureMethod === "spotify" && !spotifyLinkInput.value.trim()) {
      setupMessage.textContent = "Add a Spotify link or switch to quick questions.";
      return;
    }

    if (captureMethod === "questions") {
      const selected = formData.getAll("taste");
      if (selected.length === 0) {
        setupMessage.textContent = "Choose at least one music preference.";
        return;
      }
    }

    demoUser = enteredName;
    setupMessage.textContent = "Setup complete. Moving to video...";
    goToStep("video");
    startCountdown();
  });

  startVideoBtn.addEventListener("click", async () => {
    pipelineStatus.textContent = "Playback running. AI pipeline generating tracks...";

    try {
      await contextVideo.play();
    } catch (error) {
      pipelineStatus.textContent = "Video file missing. Add serenity-demo.mp4, then retry.";
    }
  });

  contextVideo.addEventListener("ended", () => {
    pipelineStatus.textContent = "Video complete. Receiving generated songs...";
    window.setTimeout(simulateSongReceive, 900);
  });

  skipBtn.addEventListener("click", () => {
    simulateSongReceive();
  });

  resetBtn.addEventListener("click", () => {
    demoUser = "Demo User";
    secondsLeft = 120;
    clearInterval(countdownId);
    setupForm.reset();
    setupMessage.textContent = "";
    contextVideo.pause();
    contextVideo.currentTime = 0;
    timelineList.innerHTML = "";
    pipelineStatus.textContent = "Waiting for playback...";
    spotifyBlock.classList.remove("hidden");
    questionBlock.classList.add("hidden");
    goToStep("setup");
  });

  window.SerenityDemo = {
    receiveSunoSongs(songs) {
      if (!Array.isArray(songs) || songs.length === 0) {
        return;
      }

      const normalized = songs.map((song, index) => ({
        title: song.title || `${demoUser} - Generated Track ${index + 1}`,
        mood: song.mood || "Unknown",
        time: song.time || "Recent",
        mark: song.mark || `S${index + 1}`
      }));

      finalizeAndShowTimeline(normalized);
    }
  };

  goToStep("setup");
})();
