// main.js

document.addEventListener("DOMContentLoaded", () => {
  // Header status tags
  const statusSleep = document.getElementById("status-sleep");
  const statusEnergy = document.getElementById("status-energy");

  // Morning card elements
  const statusPill = document.getElementById("morning-status-pill");
  const sleepOptionsContainer = document.getElementById("sleep-options");
  const energyOptionsContainer = document.getElementById("energy-options");
  const sleepRestartBtn = document.getElementById("sleep-restart-btn");
  const energyRestartBtn = document.getElementById("energy-restart-btn");
  const snoozeBtn = document.getElementById("morning-snooze-btn");

  // Estat intern
  let selectedSleep = null;
  let selectedEnergy = null;

  // --- Data submission (placeholder) ---

  async function sendMorningCheckin(entry) {
  const res = await fetch(SHEETS_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(entry)
  });
  if (!res.ok) throw new Error('Sheet push failed');
  return res.json();
}

function buildMorningPayload() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const timestamp = `${date} ${now.toTimeString().slice(0, 8)}`;
  return {
    date,
    timestamp,
    sleep_quality: selectedSleep,
    energy_level: selectedEnergy || 'Unspecified'
  };
}


  // --- Helpers UI ---

  function updateHeaderStatus() {
    if (statusSleep) {
      if (selectedSleep) {
        statusSleep.textContent = selectedSleep;
        statusSleep.style.display = "inline-flex";
      } else {
        statusSleep.style.display = "none";
      }
    }

    if (statusEnergy) {
      if (selectedEnergy) {
        statusEnergy.textContent = selectedEnergy;
        statusEnergy.style.display = "inline-flex";
      } else {
        statusEnergy.style.display = "none";
      }
    }
  }

  function updateStatusPill() {
    // Considerem "Completed" si hi ha Sleep informat
    if (selectedSleep) {
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

      // si ja hem triat, deshabilitem tots els botons
      if (selectedSleep) {
        btn.disabled = true;
        if (label === selectedSleep) {
          btn.style.fontWeight = "600";
          btn.style.opacity = "1";
        } else {
          btn.style.opacity = "0.5";
        }
      } else {
        btn.disabled = false;
        btn.style.opacity = "0.9";
      }

      btn.addEventListener("click", () => {
        if (!selectedSleep) {
          selectedSleep = label; // fixem selecció una única vegada
          const payload = buildMorningPayload();
            sendMorningCheckin(payload)
            .then(() => console.log('Sent to Sheets', payload))
            .catch((err) => console.error('Send failed', err));

          updateStatusPill();
          updateHeaderStatus();
          renderSleepOptions(); // refresca visuals
          // aquí en el futur: escriure a DB (sleep entry)
        }
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

      if (label === selectedEnergy) {
        btn.style.fontWeight = "600";
        btn.style.opacity = "1";
      } else {
        btn.style.opacity = "0.8";
      }

      btn.addEventListener("click", () => {
        selectedEnergy = label;
        updateHeaderStatus();
        renderEnergyOptions();
        // aquí en el futur: afegir una nova entrada d'energia (cumulativa) a DB
      });

      energyOptionsContainer.appendChild(btn);
    });
  }

  // --- Restart buttons ---

  if (sleepRestartBtn) {
    sleepRestartBtn.addEventListener("click", () => {
      // Per MVP: simplement permet canviar la selecció
      selectedSleep = null;
      updateStatusPill();
      updateHeaderStatus();
      renderSleepOptions();
      // En futur DB: això podria crear una nova entrada que sobreescrigui la "nit"
    });
  }

  if (energyRestartBtn) {
    energyRestartBtn.addEventListener("click", () => {
      // Per MVP: només netegem la selecció visible
      selectedEnergy = null;
      updateHeaderStatus();
      renderEnergyOptions();
      // En futur DB: el restart no esborraria l'històric; només afegiria una nova lectura
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
});