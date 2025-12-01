// main.js

document.addEventListener("DOMContentLoaded", () => {
  // Header status tags
  const statusSleep = document.getElementById("status-sleep");
  const statusEnergy = document.getElementById("status-energy");

  // Morning card elements
  const statusPill = document.getElementById("morning-status-pill");
  const sleepOptionsContainer = document.getElementById("sleep-options");
  const energyOptionsContainer = document.getElementById("energy-options");
  const sleepAcceptBtn = document.getElementById("sleep-accept-btn");
  const energyAcceptBtn = document.getElementById("energy-accept-btn");
  const snoozeBtn = document.getElementById("morning-snooze-btn");

  // Estat intern
  let selectedSleep = null;
  let selectedEnergy = null;
  let sleepLocked = false; // un cop acceptat el son, no canvia
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
      energy_level: "" // entrada només de son
    };
  }

  function buildEnergyPayload() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const timestamp = `${date} ${now.toTimeString().slice(0, 8)}`;
    return {
      date,
      timestamp,
      sleep_quality: "", // entrada només d'energia
      energy_level: selectedEnergy || "Unspecified"
    };
  }



  // --- Helpers UI ---

  function updateHeaderStatus() {
    if (statusSleep) {
      if (sleepLocked && selectedSleep) {
        statusSleep.textContent = selectedSleep;
        statusSleep.style.display = "inline-flex";
      } else {
        statusSleep.style.display = "none";
      }
    }

    if (statusEnergy) {
      if (lastEnergySent) {
        statusEnergy.textContent = lastEnergySent;
        statusEnergy.style.display = "inline-flex";
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

      const isSelected = label === selectedSleep;
      btn.disabled = sleepLocked || isSelected;
      btn.style.opacity = isSelected ? "1" : "0.9";
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

  function renderEnergyOptions() {
    energyOptionsContainer.innerHTML = "";

    energyLevelOptions.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-chip";
      btn.textContent = label;

      const isSelected = label === selectedEnergy;
      btn.disabled = isSelected; // l'opció seleccionada queda inactiva fins que triïs una altra
      btn.style.opacity = isSelected ? "1" : "0.8";
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

  if (energyAcceptBtn) {
    energyAcceptBtn.addEventListener("click", () => {
      if (!selectedEnergy) return;
      lastEnergySent = selectedEnergy;
      updateHeaderStatus();
      sendMorningCheckin(buildEnergyPayload());
      updateEnergyAcceptState();
    });
  }

  // --- Snooze (placeholder) ---

  if (snoozeBtn) {
    snoozeBtn.addEventListener("click", () => {
      console.log("Morning check-in snoozed by 10 minutes (placeholder).");
      alert("Snooze 10 min (placeholder, només dins la pàgina).");
    });
  }

  // --- Inicialització ---

  renderSleepOptions();
  renderEnergyOptions();
  updateStatusPill();
  updateHeaderStatus();
  updateSleepAcceptState();
  updateEnergyAcceptState();
});
