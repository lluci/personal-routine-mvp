// main.js

document.addEventListener("DOMContentLoaded", () => {
  // set dynamic page title date (e.g. "Mon, Dec 1 · 2025")
  (function setPageDate() {
    const now = new Date();
    const weekday = now.toLocaleString(undefined, { weekday: "short" });
    const month = now.toLocaleString(undefined, { month: "short" });
    const day = now.getDate();
    const year = now.getFullYear();
    const dateStr = `${weekday}, ${month} ${day} · ${year}`;
    const titleEl = document.getElementById("page-title");
    if (titleEl) titleEl.textContent = dateStr;
  })();

  // Morning card elements
  const statusPill = document.getElementById("morning-status-pill");
  const sleepAcceptBtn = document.getElementById("sleep-accept-btn");
  const wakeAcceptBtn = document.getElementById("wake-accept-btn");
  const energyAcceptBtn = document.getElementById("energy-accept-btn");

  // Estat intern
  let selectedSleep = null;
  let selectedWake = null;
  let selectedEnergy = null;
  let sleepLocked = false; // un cop acceptat el son, no canvia
  let wakeLocked = false; // un cop acceptada la hora de despertar, no canvia
  let lastEnergySent = null; // mostra al header només l'últim acceptat

  // Use options and color maps from config.js:
  //   sleepQualityOptions, wakeTimeOptions, energyLevelOptions
  //   sleepColorMap, wakeColorMap, energyColorMap, SELECT_DEFAULT_BG
  // (These are defined in config.js and drive select labels and semaphore colors.)

  // Helper to set select uniform color using CSS variable used by index.html's .compact-select
  function applySelectColor(selectEl, color) {
    if (!selectEl) return;
    selectEl.style.setProperty("--select-bg", color);
  }

  // --- Helpers for select background tinting ---
  function setSelectBg(selectEl, color) {
    if (!selectEl) return;
    selectEl.style.setProperty("--select-bg", color);
  }

  function applyDefaultSelectBg(selectEl) {
    setSelectBg(selectEl, (typeof SELECT_DEFAULT_BG !== "undefined") ? SELECT_DEFAULT_BG : "#f8fafc");
  }

  function tintSelectForAccepted(selectEl, value, map) {
    if (!selectEl) return;
    const color = (map && value && map[value]) ? map[value] : null;
    if (color) setSelectBg(selectEl, color);
  }

  // --- Data submission ---

  async function sendMorningCheckin(entry) {
    try {
      await fetch(SHEETS_ENDPOINT, {
        method: "POST",
        mode: "no-cors", // evitem CORS/preflight; resposta opaca
        body: JSON.stringify(entry)
      });
      console.log("Sent to Sheets (no-cors)", entry);
    } catch (err) {
      console.error("Send to Sheets failed", err);
    }
  }

  function buildSleepPayload() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const timestamp = `${date} ${now.toTimeString().slice(0, 8)}`;
    return {
      date,
      timestamp,
      sleep_quality: selectedSleep || "Unspecified",
      energy_level: "",
      wake_time: ""
    };
  }

  function buildWakePayload() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const timestamp = `${date} ${now.toTimeString().slice(0, 8)}`;
    return {
      date,
      timestamp,
      sleep_quality: "",
      energy_level: "",
      wake_time: selectedWake || "Unspecified"
    };
  }

  function buildEnergyPayload() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const timestamp = `${date} ${now.toTimeString().slice(0, 8)}`;
    return {
      date,
      timestamp,
      sleep_quality: "",
      energy_level: selectedEnergy || "Unspecified",
      wake_time: ""
    };
  }



  // --- Populate selects (compact dropdowns) ---
  const sleepSelect = document.getElementById("sleep-select");
  const wakeSelect = document.getElementById("wake-select");
  const energySelect = document.getElementById("energy-select");

  function populateSelect(selectEl, options, placeholder) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = placeholder || "Choose...";
    empty.selected = true;
    empty.disabled = true;
    selectEl.appendChild(empty);
    options.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      selectEl.appendChild(o);
    });
  }


  // --- Helpers UI ---

  function updateStatusPill() {
    // Considerem "Completed" només quan s'ha acceptat el son
    if (sleepLocked) {
      statusPill.textContent = "Completed";
      statusPill.classList.remove("status-pill--pending");
      statusPill.classList.add("status-pill--done");
    } else {
      statusPill.textContent = "Not completed";
      statusPill.classList.remove("status-pill--done");
      statusPill.classList.add("status-pill--pending");
    }
  }

  function renderSleepOptions() {
    // populate the compact select
    populateSelect(sleepSelect, sleepQualityOptions, "Select sleep quality");
    // start with gray until accepted
    applyDefaultSelectBg(sleepSelect);
    sleepSelect.disabled = sleepLocked;
    if (selectedSleep) sleepSelect.value = selectedSleep;
    // if already accepted, tint with configured color
    if (sleepLocked && selectedSleep) {
      tintSelectForAccepted(sleepSelect, selectedSleep, sleepColorMap);
    }
  }

  function renderWakeOptions() {
    populateSelect(wakeSelect, wakeTimeOptions, "Select wake time");
    applyDefaultSelectBg(wakeSelect);
    wakeSelect.disabled = wakeLocked;
    if (selectedWake) wakeSelect.value = selectedWake;
    if (wakeLocked && selectedWake) {
      tintSelectForAccepted(wakeSelect, selectedWake, wakeColorMap);
    }
  }

  function renderEnergyOptions() {
    populateSelect(energySelect, energyLevelOptions, "Select energy level");
    applyDefaultSelectBg(energySelect);
    // energy field is not locked by default; if lastEnergySent exists (previous accept), tint
    if (lastEnergySent) {
      tintSelectForAccepted(energySelect, lastEnergySent, energyColorMap);
    } else {
      // if there's a selected but not yet accepted energy, reflect selection
      if (selectedEnergy) energySelect.value = selectedEnergy;
    }
  }

  function updateSleepAcceptState() {
    if (sleepAcceptBtn) {
      sleepAcceptBtn.disabled = sleepLocked || !selectedSleep;
    }
  }

  function updateWakeAcceptState() {
    if (wakeAcceptBtn) {
      wakeAcceptBtn.disabled = wakeLocked || !selectedWake;
    }
  }

  function updateEnergyAcceptState() {
    if (energyAcceptBtn) {
      energyAcceptBtn.disabled = !selectedEnergy;
    }
  }

  // Select change handlers: update pending selection and accept button states
  function applySelectedColorToSelect(selectEl, value, map) {
    if (!selectEl) return;
    const color = (map && value && map[value]) ? map[value] : (typeof SELECT_DEFAULT_BG !== "undefined" ? SELECT_DEFAULT_BG : "#f8fafc");
    setSelectBg(selectEl, color);
  }

  // Select change handlers
  if (sleepSelect) {
    sleepSelect.addEventListener("change", () => {
      selectedSleep = sleepSelect.value || null;
      // Immediately tint the field to reflect the chosen item
      applySelectedColorToSelect(sleepSelect, selectedSleep, sleepColorMap);
      updateSleepAcceptState();
      updateStatusPill();
    });
  }
  if (wakeSelect) {
    wakeSelect.addEventListener("change", () => {
      selectedWake = wakeSelect.value || null;
      applySelectedColorToSelect(wakeSelect, selectedWake, wakeColorMap);
      updateWakeAcceptState();
    });
  }
  if (energySelect) {
    energySelect.addEventListener("change", () => {
      selectedEnergy = energySelect.value || null;
      applySelectedColorToSelect(energySelect, selectedEnergy, energyColorMap);
      updateEnergyAcceptState();
    });
  }

  // --- Accept buttons ---

  if (sleepAcceptBtn) {
    sleepAcceptBtn.addEventListener("click", () => {
      if (sleepLocked || !selectedSleep) return;
      sleepLocked = true;
      if (sleepSelect) {
        sleepSelect.disabled = true;
        tintSelectForAccepted(sleepSelect, selectedSleep, sleepColorMap);
      }
      updateStatusPill();
      updateSleepAcceptState();
      renderSleepOptions();
      sendMorningCheckin(buildSleepPayload());
    });
  }

  if (wakeAcceptBtn) {
    wakeAcceptBtn.addEventListener("click", () => {
      if (wakeLocked || !selectedWake) return;
      wakeLocked = true;
      if (wakeSelect) {
        wakeSelect.disabled = true;
        tintSelectForAccepted(wakeSelect, selectedWake, wakeColorMap);
      }
      updateWakeAcceptState();
      renderWakeOptions();
      sendMorningCheckin(buildWakePayload());
    });
  }

  if (energyAcceptBtn) {
    energyAcceptBtn.addEventListener("click", () => {
      if (!selectedEnergy) return;
      lastEnergySent = selectedEnergy;
      // tint the energy select on accept but keep it editable
      if (energySelect) tintSelectForAccepted(energySelect, selectedEnergy, energyColorMap);
      sendMorningCheckin(buildEnergyPayload());
      updateEnergyAcceptState();
    });
  }

  // --- Inicialització ---
  // populate and reflect initial state
  renderSleepOptions();
  renderWakeOptions();
  renderEnergyOptions();
  updateStatusPill();
  updateSleepAcceptState();
  updateEnergyAcceptState();
  updateWakeAcceptState();
});
