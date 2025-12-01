// main.js

document.addEventListener("DOMContentLoaded", () => {
  // Header status tags
  const statusSleep = document.getElementById("status-sleep");
  const statusEnergy = document.getElementById("status-energy");

  // Morning card elements
  const statusPill = document.getElementById("morning-status-pill");
  const sleepOptionsContainer = document.getElementById("sleep-options");
  const wakeOptionsContainer = document.getElementById("wake-options");
  const energyOptionsContainer = document.getElementById("energy-options");
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



  // --- Helpers UI ---

  function applyChipColor(btn, color, iconColor = "#fff", textColor = "#fff") {
    if (!color) return;
    btn.style.setProperty("--chip-bg", color);
    btn.style.setProperty("--chip-icon-color", iconColor);
    btn.style.setProperty("--chip-text-color", textColor);
    btn.style.backgroundColor = color;
    btn.style.color = textColor;
  }

  function applyHeaderColor(el, color) {
    if (!el || !color) return;
    el.style.backgroundColor = color;
    el.style.color = "#fff";
  }

  function updateHeaderStatus() {
    if (statusSleep) {
      if (sleepLocked && selectedSleep) {
        statusSleep.textContent = selectedSleep;
        statusSleep.style.display = "inline-flex";
        applyHeaderColor(statusSleep, sleepColorMap?.[selectedSleep]);
      } else {
        statusSleep.style.display = "none";
      }
    }

    if (statusEnergy) {
      if (lastEnergySent) {
        statusEnergy.textContent = lastEnergySent;
        statusEnergy.style.display = "inline-flex";
        applyHeaderColor(statusEnergy, energyColorMap?.[lastEnergySent]);
      } else {
        statusEnergy.style.display = "none";
      }
    }
  }

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
    sleepOptionsContainer.innerHTML = "";

    sleepQualityOptions.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-chip";
      btn.textContent = label;

      applyChipColor(btn, sleepColorMap?.[label]);

      const isSelected = label === selectedSleep;
      btn.disabled = sleepLocked || isSelected;
      btn.style.opacity = isSelected ? "1" : "0.55";
      btn.classList.toggle("chip-selected", isSelected);
      if (isSelected) btn.style.fontWeight = "600";

      btn.addEventListener("click", () => {
        if (sleepLocked) return;
        selectedSleep = label; // selecció pendent fins acceptar

        updateStatusPill();
        renderSleepOptions(); // refresca visuals
        updateSleepAcceptState();
      });

      sleepOptionsContainer.appendChild(btn);
    });
  }

  function renderWakeOptions() {
    if (!wakeOptionsContainer) return;
    wakeOptionsContainer.innerHTML = "";

    wakeTimeOptions.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-chip";
      btn.textContent = label;

      applyChipColor(btn, wakeColorMap?.[label], "#fff", "#fff");

      const isSelected = label === selectedWake;
      btn.disabled = wakeLocked || isSelected;
      btn.style.opacity = isSelected ? "1" : "0.55";
      btn.classList.toggle("chip-selected", isSelected);
      if (isSelected) btn.style.fontWeight = "600";

      btn.addEventListener("click", () => {
        if (wakeLocked) return;
        selectedWake = label;
        renderWakeOptions();
        updateWakeAcceptState();
      });

      wakeOptionsContainer.appendChild(btn);
    });
  }

  function renderEnergyOptions() {
    energyOptionsContainer.innerHTML = "";

    energyLevelOptions.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-chip";
      btn.textContent = label;

      applyChipColor(btn, energyColorMap?.[label]);

      const isSelected = label === selectedEnergy;
      btn.disabled = isSelected; // l'opció seleccionada queda inactiva fins que triïs una altra
      btn.style.opacity = isSelected ? "1" : "0.55";
      btn.classList.toggle("chip-selected", isSelected);
      if (isSelected) btn.style.fontWeight = "600";

      btn.addEventListener("click", () => {
        selectedEnergy = label;
        renderEnergyOptions();
        updateEnergyAcceptState();
      });

      energyOptionsContainer.appendChild(btn);
    });
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

  // --- Accept buttons ---

  if (sleepAcceptBtn) {
    sleepAcceptBtn.addEventListener("click", () => {
      if (sleepLocked || !selectedSleep) return;
      sleepLocked = true;
      updateStatusPill();
      updateHeaderStatus();
      updateSleepAcceptState();
      renderSleepOptions();
      sendMorningCheckin(buildSleepPayload());
    });
  }

  if (wakeAcceptBtn) {
    wakeAcceptBtn.addEventListener("click", () => {
      if (wakeLocked || !selectedWake) return;
      wakeLocked = true;
      updateWakeAcceptState();
      renderWakeOptions();
      sendMorningCheckin(buildWakePayload());
    });
  }

  if (energyAcceptBtn) {
    energyAcceptBtn.addEventListener("click", () => {
      if (!selectedEnergy) return;
      lastEnergySent = selectedEnergy;
      updateHeaderStatus();
      sendMorningCheckin(buildEnergyPayload());
      updateEnergyAcceptState();
    });
  }

  // --- Inicialització ---

  renderSleepOptions();
  renderWakeOptions();
  renderEnergyOptions();
  updateStatusPill();
  updateHeaderStatus();
  updateSleepAcceptState();
  updateEnergyAcceptState();
  updateWakeAcceptState();
});
