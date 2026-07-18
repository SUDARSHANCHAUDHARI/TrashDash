(function () {
  "use strict";

  const REQUIRED_FAILURES = 7;
  const PROXIMITY_PADDING = 62;
  const DOCUMENT_EDGE_PADDING = 10;
  const EFFECT_CLASSES = [
    "is-alert",
    "is-closed",
    "is-jumping",
    "is-tiny",
    "is-hiding",
    "is-plant",
    "has-wheels",
  ];

  const REFUSALS = [
    {
      id: "move-away",
      label: "The bin moved away.",
      speech: "Personal space!",
      duration: 1250,
    },
    {
      id: "close-lid",
      label: "The bin slammed its lid shut.",
      speech: "Closed for business.",
      duration: 1150,
    },
    {
      id: "jump-corner",
      label: "The bin jumped to another corner.",
      speech: "New corner. Who dis?",
      duration: 1450,
    },
    {
      id: "hide-folder",
      label: "The bin hid behind the Tax Stuff folder.",
      speech: "You saw nothing.",
      duration: 1450,
    },
    {
      id: "plant-pot",
      label: "The bin is pretending to be a plant pot.",
      speech: "Bin? I'm a ficus.",
      duration: 1450,
    },
    {
      id: "become-tiny",
      label: "The bin became inconveniently tiny.",
      speech: "Too small. Shame.",
      duration: 1250,
    },
    {
      id: "push-document",
      label: "The bin pushed the document away.",
      speech: "Return to desktop!",
      duration: 1200,
    },
    {
      id: "storage-full",
      label: "Storage Full",
      speech: "Storage Full",
      duration: 1350,
    },
    {
      id: "grow-wheels",
      label: "The bin grew wheels and escaped.",
      speech: "Catch me later!",
      duration: 1650,
    },
    {
      id: "return-document",
      label: "The bin returned the document to its starting point.",
      speech: "Return to sender.",
      duration: 1250,
    },
  ];

  const stage = document.querySelector("#game-stage");
  const documentFile = document.querySelector("#document");
  const trashBin = document.querySelector("#trash-bin");
  const coverFolder = document.querySelector("#cover-folder");
  const attemptCount = document.querySelector("#attempt-count");
  const progressDots = Array.from(document.querySelectorAll("#progress-dots span"));
  const statusToast = document.querySelector("#status-toast");
  const statusMessage = document.querySelector("#status-message");
  const binSpeech = document.querySelector("#bin-speech");
  const soundToggle = document.querySelector("#sound-toggle");
  const soundLabel = soundToggle.querySelector(".button-label");
  const resetButton = document.querySelector("#reset-button");
  const playAgainButton = document.querySelector("#play-again-button");
  const victoryCard = document.querySelector("#victory-card");
  const confetti = document.querySelector("#confetti");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const state = {
    attempts: 0,
    won: false,
    dragging: false,
    keyboardGrabbed: false,
    effectLocked: false,
    approachTriggered: false,
    pointerId: null,
    pointerOffset: { x: 0, y: 0 },
    documentPosition: { x: 0, y: 0, targetX: 0, targetY: 0 },
    documentStart: { x: 0, y: 0 },
    binHome: { x: 0, y: 0 },
    refusalDeck: [],
    soundEnabled: true,
    audioContext: null,
    generation: 0,
  };

  const activeTimers = new Set();
  let resizeTimer = 0;

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
  }

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
  }

  function schedule(callback, delay) {
    const generation = state.generation;
    const timer = window.setTimeout(() => {
      activeTimers.delete(timer);
      if (generation === state.generation) {
        callback();
      }
    }, delay);
    activeTimers.add(timer);
    return timer;
  }

  function clearScheduledTasks() {
    activeTimers.forEach((timer) => window.clearTimeout(timer));
    activeTimers.clear();
  }

  function effectDuration(milliseconds) {
    return reducedMotionQuery.matches ? Math.min(milliseconds, 620) : milliseconds;
  }

  function setDocumentPosition(x, y, immediate) {
    const maxX = stage.clientWidth - documentFile.offsetWidth - DOCUMENT_EDGE_PADDING;
    const maxY = stage.clientHeight - documentFile.offsetHeight - DOCUMENT_EDGE_PADDING;
    const nextX = clamp(x, DOCUMENT_EDGE_PADDING, maxX);
    const nextY = clamp(y, DOCUMENT_EDGE_PADDING, maxY);

    state.documentPosition.targetX = nextX;
    state.documentPosition.targetY = nextY;

    if (immediate) {
      state.documentPosition.x = nextX;
      state.documentPosition.y = nextY;
      renderDocumentPosition();
    }
  }

  function renderDocumentPosition() {
    documentFile.style.left = `${state.documentPosition.x}px`;
    documentFile.style.top = `${state.documentPosition.y}px`;
  }

  function setBinPosition(x, y, allowOutsideStage) {
    if (allowOutsideStage) {
      trashBin.style.left = `${x}px`;
      trashBin.style.top = `${y}px`;
      return;
    }

    const maxX = stage.clientWidth - trashBin.offsetWidth - 8;
    const maxY = stage.clientHeight - trashBin.offsetHeight - 8;
    trashBin.style.left = `${clamp(x, 8, maxX)}px`;
    trashBin.style.top = `${clamp(y, 8, maxY)}px`;
  }

  function calculateHomePositions() {
    const compact = stage.clientWidth < 620;
    const documentX = compact ? stage.clientWidth * 0.11 : stage.clientWidth * 0.17;
    const documentY = compact ? stage.clientHeight * 0.27 : stage.clientHeight * 0.37;
    const binInset = compact ? 20 : Math.max(38, stage.clientWidth * 0.07);
    const binBottom = compact ? 56 : 38;

    state.documentStart = {
      x: clamp(
        documentX,
        DOCUMENT_EDGE_PADDING,
        stage.clientWidth - documentFile.offsetWidth - DOCUMENT_EDGE_PADDING,
      ),
      y: clamp(
        documentY,
        DOCUMENT_EDGE_PADDING,
        stage.clientHeight - documentFile.offsetHeight - DOCUMENT_EDGE_PADDING,
      ),
    };
    state.binHome = {
      x: stage.clientWidth - trashBin.offsetWidth - binInset,
      y: stage.clientHeight - trashBin.offsetHeight - binBottom,
    };
  }

  function placeGamePieces(immediate) {
    calculateHomePositions();
    if (immediate) {
      trashBin.classList.add("no-transition");
    }
    setDocumentPosition(state.documentStart.x, state.documentStart.y, immediate);
    setBinPosition(state.binHome.x, state.binHome.y);

    if (immediate) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => trashBin.classList.remove("no-transition"));
      });
    }
  }

  function getRelativeRect(element) {
    const stageRect = stage.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left - stageRect.left,
      top: rect.top - stageRect.top,
      right: rect.right - stageRect.left,
      bottom: rect.bottom - stageRect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  function rectanglesOverlap(first, second, padding) {
    return !(
      first.right < second.left - padding ||
      first.left > second.right + padding ||
      first.bottom < second.top - padding ||
      first.top > second.bottom + padding
    );
  }

  function documentIsNearBin() {
    return rectanglesOverlap(
      getRelativeRect(documentFile),
      getRelativeRect(trashBin),
      PROXIMITY_PADDING,
    );
  }

  function documentIsInsideBin() {
    const fileRect = getRelativeRect(documentFile);
    const binRect = getRelativeRect(trashBin);
    const overlapWidth = Math.max(
      0,
      Math.min(fileRect.right, binRect.right) - Math.max(fileRect.left, binRect.left),
    );
    const overlapHeight = Math.max(
      0,
      Math.min(fileRect.bottom, binRect.bottom) - Math.max(fileRect.top, binRect.top),
    );
    const overlapArea = overlapWidth * overlapHeight;
    const requiredArea = Math.min(
      fileRect.width * fileRect.height,
      binRect.width * binRect.height,
    ) * 0.08;

    return overlapArea >= requiredArea;
  }

  function showStatus(message, tone) {
    statusMessage.textContent = message;
    statusToast.classList.remove("is-warning", "is-success");
    if (tone) {
      statusToast.classList.add(`is-${tone}`);
    }
    statusToast.classList.add("is-visible");
  }

  function showSpeech(message) {
    binSpeech.textContent = message;
    binSpeech.classList.add("is-visible");
  }

  function hideSpeech() {
    binSpeech.classList.remove("is-visible");
  }

  function updateAttemptDisplay() {
    attemptCount.textContent = `${state.attempts} / ${REQUIRED_FAILURES}`;
    progressDots.forEach((dot, index) => {
      dot.classList.toggle("is-filled", index < state.attempts);
    });
    document.querySelector(".attempt-counter").classList.toggle(
      "is-full",
      state.attempts >= REQUIRED_FAILURES,
    );
  }

  function getAudioContext() {
    if (!state.soundEnabled) {
      return null;
    }

    if (!state.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return null;
      }
      state.audioContext = new AudioContextClass();
    }

    if (state.audioContext.state === "suspended") {
      state.audioContext.resume().catch(() => {});
    }
    return state.audioContext;
  }

  function tone(frequency, duration, options) {
    const audioContext = getAudioContext();
    if (!audioContext) {
      return;
    }

    const settings = {
      delay: 0,
      endFrequency: frequency,
      type: "square",
      volume: 0.035,
      ...options,
    };
    const startTime = audioContext.currentTime + settings.delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = settings.type;
    oscillator.frequency.setValueAtTime(Math.max(1, frequency), startTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, settings.endFrequency),
      startTime + duration,
    );
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(settings.volume, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  function playGrabSound() {
    tone(260, 0.055, { endFrequency: 330, type: "sine", volume: 0.025 });
  }

  function playRefusalSound() {
    const base = 180 + Math.random() * 50;
    tone(base * 1.5, 0.12, { endFrequency: base, type: "square", volume: 0.028 });
    tone(base, 0.16, {
      delay: 0.11,
      endFrequency: base * 0.72,
      type: "sawtooth",
      volume: 0.022,
    });
  }

  function playSuccessSound() {
    [262, 330, 392, 523].forEach((frequency, index) => {
      tone(frequency, 0.26, {
        delay: index * 0.105,
        endFrequency: frequency * 1.015,
        type: "triangle",
        volume: 0.038,
      });
    });
  }

  function updateSoundControl() {
    soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
    soundToggle.setAttribute(
      "aria-label",
      state.soundEnabled ? "Turn sound off" : "Turn sound on",
    );
    soundLabel.textContent = state.soundEnabled ? "Sound on" : "Sound off";
  }

  function endDrag(options) {
    const settings = { releaseCapture: true, ...options };
    const pointerId = state.pointerId;

    state.dragging = false;
    state.keyboardGrabbed = false;
    state.pointerId = null;
    documentFile.classList.remove("is-dragging");
    documentFile.setAttribute("aria-grabbed", "false");

    if (
      settings.releaseCapture &&
      pointerId !== null &&
      documentFile.hasPointerCapture(pointerId)
    ) {
      documentFile.releasePointerCapture(pointerId);
    }
  }

  function nudgeDocumentFromBin(distance) {
    const fileRect = getRelativeRect(documentFile);
    const binRect = getRelativeRect(trashBin);
    const fileCenterX = fileRect.left + fileRect.width / 2;
    const fileCenterY = fileRect.top + fileRect.height / 2;
    const binCenterX = binRect.left + binRect.width / 2;
    const binCenterY = binRect.top + binRect.height / 2;
    let deltaX = fileCenterX - binCenterX;
    let deltaY = fileCenterY - binCenterY;
    const magnitude = Math.hypot(deltaX, deltaY) || 1;

    deltaX = (deltaX / magnitude) * distance;
    deltaY = (deltaY / magnitude) * distance;
    setDocumentPosition(
      state.documentPosition.x + deltaX,
      state.documentPosition.y + deltaY,
      false,
    );
  }

  function moveBinAway() {
    const fileRect = getRelativeRect(documentFile);
    const binRect = getRelativeRect(trashBin);
    const fileCenterX = fileRect.left + fileRect.width / 2;
    const fileCenterY = fileRect.top + fileRect.height / 2;
    const binCenterX = binRect.left + binRect.width / 2;
    const binCenterY = binRect.top + binRect.height / 2;
    const deltaX = binCenterX - fileCenterX;
    const deltaY = binCenterY - fileCenterY;
    const magnitude = Math.hypot(deltaX, deltaY) || 1;
    const travel = Math.min(stage.clientWidth, stage.clientHeight) * 0.32;

    setBinPosition(
      binRect.left + (deltaX / magnitude) * travel,
      binRect.top + (deltaY / magnitude) * travel,
    );
  }

  function jumpToAnotherCorner() {
    const inset = 22;
    const corners = [
      { x: inset, y: inset + 34 },
      { x: stage.clientWidth - trashBin.offsetWidth - inset, y: inset + 34 },
      { x: inset, y: stage.clientHeight - trashBin.offsetHeight - 42 },
    ];
    const destination = corners[Math.floor(Math.random() * corners.length)];
    trashBin.classList.add("is-jumping");
    setBinPosition(destination.x, destination.y);
  }

  function hideBehindFolder() {
    const folderRect = getRelativeRect(coverFolder);
    trashBin.classList.add("is-hiding");
    coverFolder.classList.add("is-covering");
    setBinPosition(
      folderRect.left + folderRect.width * 0.08,
      folderRect.top - trashBin.offsetHeight * 0.36,
    );
  }

  function pushDocumentAway() {
    documentFile.classList.add("is-rejected");
    nudgeDocumentFromBin(Math.min(220, stage.clientWidth * 0.3));
  }

  function returnDocumentHome() {
    documentFile.classList.add("is-rejected");
    setDocumentPosition(state.documentStart.x, state.documentStart.y, false);
  }

  function executeRefusal(refusal) {
    trashBin.classList.add("is-alert");

    switch (refusal.id) {
      case "move-away":
        moveBinAway();
        nudgeDocumentFromBin(54);
        break;
      case "close-lid":
        trashBin.classList.add("is-closed");
        nudgeDocumentFromBin(74);
        break;
      case "jump-corner":
        jumpToAnotherCorner();
        nudgeDocumentFromBin(54);
        break;
      case "hide-folder":
        hideBehindFolder();
        nudgeDocumentFromBin(54);
        break;
      case "plant-pot":
        trashBin.classList.add("is-plant");
        nudgeDocumentFromBin(72);
        break;
      case "become-tiny":
        trashBin.classList.add("is-tiny");
        nudgeDocumentFromBin(60);
        break;
      case "push-document":
        pushDocumentAway();
        break;
      case "storage-full":
        nudgeDocumentFromBin(78);
        break;
      case "grow-wheels":
        trashBin.classList.add("has-wheels");
        nudgeDocumentFromBin(54);
        schedule(() => {
          setBinPosition(stage.clientWidth + 20, state.binHome.y, true);
        }, effectDuration(190));
        break;
      case "return-document":
        returnDocumentHome();
        break;
      default:
        nudgeDocumentFromBin(70);
    }
  }

  function drawRefusal() {
    if (state.refusalDeck.length === 0) {
      state.refusalDeck = shuffle(REFUSALS);
    }
    return state.refusalDeck.shift();
  }

  function restoreAfterRefusal() {
    EFFECT_CLASSES.forEach((className) => trashBin.classList.remove(className));
    coverFolder.classList.remove("is-covering");
    documentFile.classList.remove("is-rejected");
    setBinPosition(state.binHome.x, state.binHome.y);

    schedule(() => {
      state.effectLocked = false;
      if (state.attempts >= REQUIRED_FAILURES) {
        showSpeech("Fine. Drop it.");
        showStatus("Seven refusals logged. The bin has run out of excuses.", "success");
      } else {
        hideSpeech();
        showStatus("The bin reset itself. Try another approach.");
      }
    }, effectDuration(700));
  }

  function triggerRefusal() {
    if (
      state.effectLocked ||
      state.won ||
      state.approachTriggered ||
      state.attempts >= REQUIRED_FAILURES
    ) {
      return;
    }

    const refusal = drawRefusal();
    state.approachTriggered = true;
    state.effectLocked = true;
    state.attempts += 1;
    endDrag({ releaseCapture: true });
    updateAttemptDisplay();
    showSpeech(refusal.speech);
    showStatus(`Attempt ${state.attempts}: ${refusal.label}`, "warning");
    playRefusalSound();
    executeRefusal(refusal);
    schedule(restoreAfterRefusal, effectDuration(refusal.duration));
  }

  function createConfetti() {
    const colors = ["#e74d36", "#f3c94f", "#4b9a63", "#fffdf4", "#5d6eb8"];
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 30; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.setProperty("--x", `${3 + Math.random() * 94}%`);
      piece.style.setProperty("--size", `${7 + Math.random() * 9}px`);
      piece.style.setProperty("--color", colors[index % colors.length]);
      piece.style.setProperty("--rotation", `${Math.random() * 180}deg`);
      piece.style.setProperty("--duration", `${1.6 + Math.random() * 1.4}s`);
      piece.style.setProperty("--delay", `${Math.random() * 0.42}s`);
      fragment.appendChild(piece);
    }

    confetti.replaceChildren(fragment);
  }

  function acceptDocument() {
    if (state.won || state.attempts < REQUIRED_FAILURES) {
      return;
    }

    state.won = true;
    state.effectLocked = true;
    endDrag({ releaseCapture: true });
    hideSpeech();
    showSpeech("...fine.");
    showStatus("The bin is processing a difficult emotion…", "success");

    const binRect = getRelativeRect(trashBin);
    setDocumentPosition(
      binRect.left + binRect.width * 0.5 - documentFile.offsetWidth * 0.5,
      binRect.top + binRect.height * 0.18,
      false,
    );
    documentFile.classList.add("is-accepting");
    playSuccessSound();

    schedule(() => {
      documentFile.classList.add("is-hidden");
      trashBin.classList.add("is-celebrating");
      createConfetti();
      victoryCard.hidden = false;
      showStatus("Trash accepted reluctantly.", "success");
      playAgainButton.focus({ preventScroll: true });
    }, effectDuration(760));
  }

  function handlePointerDown(event) {
    if (state.won || state.effectLocked || event.button > 0) {
      return;
    }

    event.preventDefault();
    const fileRect = documentFile.getBoundingClientRect();
    state.dragging = true;
    state.keyboardGrabbed = false;
    state.approachTriggered = false;
    state.pointerId = event.pointerId;
    state.pointerOffset.x = event.clientX - fileRect.left;
    state.pointerOffset.y = event.clientY - fileRect.top;
    documentFile.classList.add("is-dragging");
    documentFile.setAttribute("aria-grabbed", "true");
    documentFile.setPointerCapture(event.pointerId);
    showStatus(
      state.attempts >= REQUIRED_FAILURES
        ? "The bin is staying put. Drop the file inside."
        : "Careful—the bin noticed you.",
    );
    playGrabSound();
  }

  function handlePointerMove(event) {
    if (!state.dragging || state.pointerId !== event.pointerId || state.keyboardGrabbed) {
      return;
    }

    event.preventDefault();
    const stageRect = stage.getBoundingClientRect();
    setDocumentPosition(
      event.clientX - stageRect.left - state.pointerOffset.x,
      event.clientY - stageRect.top - state.pointerOffset.y,
      false,
    );
  }

  function handlePointerUp(event) {
    if (!state.dragging || state.pointerId !== event.pointerId || state.keyboardGrabbed) {
      return;
    }

    state.documentPosition.x = state.documentPosition.targetX;
    state.documentPosition.y = state.documentPosition.targetY;
    renderDocumentPosition();
    endDrag({ releaseCapture: true });

    if (state.attempts >= REQUIRED_FAILURES && documentIsInsideBin()) {
      acceptDocument();
    } else if (state.attempts < REQUIRED_FAILURES && documentIsNearBin()) {
      triggerRefusal();
    } else {
      showStatus(
        state.attempts >= REQUIRED_FAILURES
          ? "Almost. Drop the document over the bin opening."
          : "Missed the bin. It looks smug about that.",
      );
    }
  }

  function handlePointerCancel(event) {
    if (!state.dragging || state.pointerId !== event.pointerId || state.keyboardGrabbed) {
      return;
    }
    endDrag({ releaseCapture: true });
    showStatus("Drag cancelled. The document is still on the desktop.");
  }

  function beginKeyboardDrag() {
    if (state.won || state.effectLocked) {
      return;
    }
    state.keyboardGrabbed = true;
    state.dragging = true;
    state.approachTriggered = false;
    documentFile.classList.add("is-dragging");
    documentFile.setAttribute("aria-grabbed", "true");
    showStatus("Document grabbed. Use the arrow keys, then Space to drop.");
    playGrabSound();
  }

  function finishKeyboardDrag() {
    state.documentPosition.x = state.documentPosition.targetX;
    state.documentPosition.y = state.documentPosition.targetY;
    renderDocumentPosition();
    endDrag({ releaseCapture: false });

    if (state.attempts >= REQUIRED_FAILURES && documentIsInsideBin()) {
      acceptDocument();
    } else if (state.attempts < REQUIRED_FAILURES && documentIsNearBin()) {
      triggerRefusal();
    } else {
      showStatus("Document dropped on the desktop.");
    }
  }

  function handleDocumentKeydown(event) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (state.keyboardGrabbed) {
        finishKeyboardDrag();
      } else {
        beginKeyboardDrag();
      }
      return;
    }

    if (!state.keyboardGrabbed || !event.key.startsWith("Arrow")) {
      return;
    }

    event.preventDefault();
    const step = event.shiftKey ? 38 : 16;
    let nextX = state.documentPosition.targetX;
    let nextY = state.documentPosition.targetY;

    if (event.key === "ArrowLeft") nextX -= step;
    if (event.key === "ArrowRight") nextX += step;
    if (event.key === "ArrowUp") nextY -= step;
    if (event.key === "ArrowDown") nextY += step;

    setDocumentPosition(nextX, nextY, true);
    if (state.attempts < REQUIRED_FAILURES && documentIsNearBin()) {
      triggerRefusal();
    }
  }

  function resetGame(announceReset) {
    const capturedPointer = state.pointerId;
    if (
      capturedPointer !== null &&
      typeof documentFile.hasPointerCapture === "function" &&
      documentFile.hasPointerCapture(capturedPointer)
    ) {
      documentFile.releasePointerCapture(capturedPointer);
    }

    state.generation += 1;
    clearScheduledTasks();
    state.attempts = 0;
    state.won = false;
    state.dragging = false;
    state.keyboardGrabbed = false;
    state.effectLocked = false;
    state.approachTriggered = false;
    state.pointerId = null;
    state.refusalDeck = shuffle(REFUSALS);

    EFFECT_CLASSES.forEach((className) => trashBin.classList.remove(className));
    trashBin.classList.remove("is-celebrating");
    documentFile.classList.remove(
      "is-dragging",
      "is-rejected",
      "is-accepting",
      "is-hidden",
    );
    documentFile.setAttribute("aria-grabbed", "false");
    coverFolder.classList.remove("is-covering");
    victoryCard.hidden = true;
    confetti.replaceChildren();
    hideSpeech();
    updateAttemptDisplay();
    placeGamePieces(true);
    showStatus("Grab the document and aim for the bin.");

    if (announceReset) {
      playGrabSound();
      documentFile.focus({ preventScroll: true });
    }
  }

  function animate() {
    const position = state.documentPosition;
    const smoothing = reducedMotionQuery.matches ? 1 : state.dragging ? 0.42 : 0.24;
    const deltaX = position.targetX - position.x;
    const deltaY = position.targetY - position.y;

    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
      position.x += deltaX * smoothing;
      position.y += deltaY * smoothing;
      if (Math.abs(deltaX) < 0.35) position.x = position.targetX;
      if (Math.abs(deltaY) < 0.35) position.y = position.targetY;
      renderDocumentPosition();
    }

    if (
      state.dragging &&
      !state.effectLocked &&
      !state.approachTriggered &&
      state.attempts < REQUIRED_FAILURES &&
      documentIsNearBin()
    ) {
      triggerRefusal();
    }

    window.requestAnimationFrame(animate);
  }

  function handleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!state.dragging && !state.effectLocked && !state.won) {
        placeGamePieces(true);
      }
    }, 120);
  }

  documentFile.addEventListener("pointerdown", handlePointerDown);
  documentFile.addEventListener("pointermove", handlePointerMove);
  documentFile.addEventListener("pointerup", handlePointerUp);
  documentFile.addEventListener("pointercancel", handlePointerCancel);
  documentFile.addEventListener("keydown", handleDocumentKeydown);
  documentFile.addEventListener("click", (event) => event.preventDefault());
  soundToggle.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    updateSoundControl();
    if (state.soundEnabled) {
      playGrabSound();
      showStatus("Sound is on.");
    } else {
      showStatus("Sound is off.");
    }
  });
  resetButton.addEventListener("click", () => resetGame(true));
  playAgainButton.addEventListener("click", () => resetGame(true));
  window.addEventListener("resize", handleResize);
  reducedMotionQuery.addEventListener?.("change", handleResize);

  updateSoundControl();
  window.requestAnimationFrame(() => {
    resetGame(false);
    animate();
  });

  window.TrashDash = Object.freeze({
    reset: () => resetGame(false),
    getState: () => ({ attempts: state.attempts, won: state.won }),
    refusalIds: REFUSALS.map((refusal) => refusal.id),
  });
})();
