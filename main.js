const oraIntrare = document.getElementById("ora__intrare");
const oraIesire = document.getElementById("ora__iesire");
const inputBtn = document.getElementById("btn__intrare");
const outputBtn = document.getElementById("btn__iesire");
const resetBtnRecords = document.getElementById("btn__resetRecords");
const recordsList = document.getElementById("recordsList");
const exportBtn = document.getElementById("btn__export");
const resetBtnLastRecords = document.getElementById("btn__resetLastRecords");
const displayBtnRecords = document.getElementById("btn__displayRecords");
const manualInputField = document.getElementById("manualInput");
const manualIntrareBtn = document.getElementById("btn__manualIntrare");
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const drawerPanel = document.getElementById("drawerPanel");
const secondaryActions = document.getElementById("secondaryActions");
const breakBtn = document.getElementById("btn__break");

// ===== HAMBURGER MENU =====
function openDrawer() {
  drawer.style.display = "block";
  menuBtn.classList.add("is-hidden")
}

function closeDrawer() {
  drawer.style.display = "none";
  menuBtn.classList.remove("is-hidden");
}

menuBtn.addEventListener("click", () => {
  const isOpen = drawer.style.display === "block";
  if (isOpen) closeDrawer();
  else openDrawer();
});

drawer.addEventListener("click", (e) => {
  if (e.target === drawer) closeDrawer();
});

function syncSecondaryActionsPlacement() {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  if (isMobile) {
    if (secondaryActions.children.length > 0) {
      while (secondaryActions.firstChild) {
        drawerPanel.appendChild(secondaryActions.firstChild);
      }
    }
  } else {
    if (drawerPanel.children.length > 0) {
      while (drawerPanel.firstChild) {
        secondaryActions.appendChild(drawerPanel.firstChild);
      }
    }
    closeDrawer();
  }
}

window.addEventListener("resize", syncSecondaryActionsPlacement);
syncSecondaryActionsPlacement();

function saveToLocalStorage(key, value) {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(key, value);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function getFromLocalStorage(key) {
  return new Promise((resolve, reject) => {
    try {
      const value = localStorage.getItem(key);
      resolve(value);
    } catch (error) {
      reject(error);
    }
  });
}

let inputTimeValue = localStorage.getItem("input") || "";

let outputTimeValue = localStorage.getItem("output") || "";

const records = JSON.parse(localStorage.getItem("records")) || [];

function register() {
  const now = new Date();
  const adjustedTime = "07:30:00";
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const timeString = `${hours < 10 ? "0" : ""}${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  if (timeString >= "06:00:00" && timeString <= "07:30:00") {
    return adjustedTime;
  } else {
    return timeString;
  }
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${year}-${month < 10 ? "0" : ""}${month}-${
    day < 10 ? "0" : ""
  }${day}`;
}

function displayRecords() {
  recordsList.innerHTML = "";
  records.forEach((record) => {
    const listItem = document.createElement("li");
    const breakStr = record.break || "00:00";
    listItem.textContent = `${record.date}: ${record.diff}: ${breakStr}: ${record.input}: ${record.output}`;
    recordsList.appendChild(listItem);
  });
}

async function inputTime(isManual) {
  if (!inputTimeValue) {
    const now = new Date();
    const today = getCurrentDate();
    const lastRecord = records.find((record) => record.date === today);
    if (lastRecord) {
      displayErrorMessage("Te ai inregistrat azi !");
      return;
    }
    let time;
    if (isManual) {
      inputBtn.disabled = true;
      manualInputField.style.display = "inline";
      manualInputField.style.outline = "none";
      manualInputField.style.padding = "5px";
      manualInputField.focus();

      time = await handleManualInput();
      manualInputField.value = "";
      manualInputField.style.display = "none";
      inputBtn.disabled = false;
    } else {
      time = register();
    }

    await saveToLocalStorage("input", time);
    document.querySelector("#ora__intrare").innerHTML = time;
    updateDisplay();
    updateButtonsState();
    updateBreakUI();
  } else if (inputTimeValue) {
    displayErrorMessage("Ai intrare!");
    return;
  }
}

async function outputTime(isManual) {
  const confirmation = window.confirm("Chiar vrei sa iesi?");

  if (confirmation) {
    if (localStorage.getItem("breakStart")) {
       displayErrorMessage("Ești în pauză. Apasă Reia!");
       return;
      }
    if (inputTimeValue) {
      let time;
      if (isManual) {
        outputBtn.disabled = true;
        manualInputField.style.display = "inline";
        manualInputField.style.outline = "none";
        manualInputField.style.padding = "5px";
        manualInputField.focus();

        time = await handleManualInput();
        manualInputField.value = "";
        manualInputField.style.display = "none";
        outputBtn.disabled = false;
      } else {
        time = register();
      }

      await saveToLocalStorage("output", time);
      calculateTotalTimeDifference();
      updateDisplay();
      updateButtonsState();
      updateBreakUI();
    } else if (!inputTimeValue) {
      displayErrorMessage("Nu ai intrare!");
      return;
    }
    clearErrorMessage();
  }
}

function resetTime() {
  const confirmation = window.confirm("Chiar vrei sa stergi?");
  if (confirmation) {
    localStorage.removeItem("input");
    localStorage.removeItem("output");
    document.querySelector("#ora__intrare").innerHTML = "";
    document.querySelector("#ora__iesire").innerHTML = "";
    document.querySelector("#time__difference").innerHTML = "";
    updateDisplay();
  }
}

function resetInputAndOutput() {
  localStorage.removeItem("input");
  localStorage.removeItem("output");
  localStorage.removeItem("breakStart");
  localStorage.setItem("breakTotal", "00:00:00");
  document.querySelector("#ora__intrare").innerHTML = "";
  document.querySelector("#ora__iesire").innerHTML = "";
  updateDisplay();
  updateButtonsState();
  updateBreakUI();
}

function resetRecords() {
  const confirmation = window.prompt(
    "ATENȚIE!\nAceastă acțiune va șterge TOATE înregistrările.\n\nPentru confirmare, tastează exact: STERGE"
  );

  if (confirmation !== "STERGE") {
    displayErrorMessage("Operațiune anulată.");
    return;
  }

  localStorage.removeItem("records");
  recordsList.innerHTML = "";

  calculateTotalTimeDifference();
  updateDisplay();
  updateButtonsState();
  updateBreakUI();

  location.reload();
}

async function updateDisplay() {
  inputTimeValue = (await getFromLocalStorage("input")) || "";
  outputTimeValue = (await getFromLocalStorage("output")) || "";
  if (inputTimeValue && outputTimeValue) {
    const today = getCurrentDate();

    const inputTimeParts = inputTimeValue.split(":");
    const outputTimeParts = outputTimeValue.split(":");

    const inputHours = parseInt(inputTimeParts[0], 10);
    const inputMinutes = parseInt(inputTimeParts[1], 10);
    const inputSeconds = parseInt(inputTimeParts[2], 10);

    const outputHours = parseInt(outputTimeParts[0], 10);
    const outputMinutes = parseInt(outputTimeParts[1], 10);
    const outputSeconds = parseInt(outputTimeParts[2], 10);

    const inputMillis =
      inputHours * 3600000 + inputMinutes * 60000 + inputSeconds * 1000;
    const outputMillis =
      outputHours * 3600000 + outputMinutes * 60000 + outputSeconds * 1000;
    const regularWorkingMillis = 8 * 3600000 + 30 * 60000;
    const breakTotal = localStorage.getItem("breakTotal") || "00:00:00";
    const breakParts = breakTotal.split(":");
    const breakH = parseInt(breakParts[0], 10) || 0;
    const breakM = parseInt(breakParts[1], 10) || 0;
    const breakS = parseInt(breakParts[2], 10) || 0;
    const breakMillis = breakH * 3600000 + breakM * 60000 + breakS * 1000;

    const timeDifferenceMillis =
         outputMillis - inputMillis - breakMillis - regularWorkingMillis;
    const sign = timeDifferenceMillis < 0 ? "-" : "+";
    const absTimeDifferenceMillis = Math.abs(timeDifferenceMillis);

    const hours = Math.floor(absTimeDifferenceMillis / 3600000);
    const minutes = Math.floor((absTimeDifferenceMillis % 3600000) / 60000);
    const seconds = Math.floor((absTimeDifferenceMillis % 60000) / 1000);

    const hoursStr = hours.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");

    const timeDifferenceString = `${sign}${hoursStr}:${minutesStr}:${secondsStr}`;
    document.querySelector("#time__difference").innerHTML =
      timeDifferenceString;
    const breakHHMM = breakTotal.slice(0, 5);
    const record = {
             date: today,
             diff: timeDifferenceString,
             break: breakHHMM,
             input: inputTimeValue,
             output: outputTimeValue
     };
    const existingRecord = records.find((record) => record.date === today);
    if (!existingRecord) {
      records.unshift(record);
    }
    await saveToLocalStorage("records", JSON.stringify(records));
    calculateTotalTimeDifference();
    resetInputAndOutput();
    document.querySelector("#time__difference").innerHTML = "";
  }
}

function updateButtonsState() {
  const hasInput = !!localStorage.getItem("input");
  const hasOutput = !!localStorage.getItem("output");
  const today = getCurrentDate();
  const hasTodayRecord = records.some((r) => r.date === today);
  inputBtn.disabled = hasInput || hasTodayRecord;
  manualIntrareBtn.disabled = hasTodayRecord;
  outputBtn.disabled = !hasInput || hasOutput;
}

function formatTimeDifference(record) {
  const parts = record.split(":");
  const dateString = parts[0];
  const timeDifference = parts[1].trim();

  const formattedDate = new Date(dateString).toLocaleDateString();
  return `${formattedDate}: ${timeDifference}`;
}

inputBtn.addEventListener("click", () => inputTime(false));
manualIntrareBtn.addEventListener("click", () => {
  if (!inputTimeValue) {
    inputTime(true);
  } else {
    outputTime(true);
  }
});
outputBtn.addEventListener("click", () => outputTime(false));
resetBtnRecords.addEventListener("click", resetRecords);
resetBtnLastRecords.addEventListener("click", deleteLastRecord);
displayBtnRecords.addEventListener("click", toggleRecordsList);
breakBtn.addEventListener("click", toggleBreak);

document.querySelector("#ora__intrare").innerHTML = inputTimeValue;
document.querySelector("#ora__iesire").innerHTML = outputTimeValue;

if (!inputTimeValue) {
  document.querySelector("#ora__intrare").innerHTML = "";
}

if (!outputTimeValue) {
  document.querySelector("#ora__iesire").innerHTML = "";
}

function displayErrorMessage(message) {
  const errorMessageElement = document.getElementById("error-message");
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = "block";
  setTimeout(clearErrorMessage, 1000);
}

function clearErrorMessage() {
  const errorMessageElement = document.getElementById("error-message");
  errorMessageElement.style.display = "none";
}

exportBtn.addEventListener("click", () => {
  exportRecordsToCSV();
});

function exportRecordsToCSV() {
  if (records.length === 0) {
    alert("No records to export.");
    return;
  }
  let csvContent = "date,diff,break,input,output\n";
  records.forEach((record) => {
    const breakStr = record.break || "00:00";
    csvContent += `${record.date},${record.diff},${breakStr},${record.input},${record.output}\n`;

  });
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "records.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function calculateTotalTimeDifference() {
  let totalDifferenceMillis = 0;

  records.forEach((record) => {
    const timeDifference = record.diff.trim();
    const matches = timeDifference.match(/^([-+]?)((\d+):)?((\d+):)?(\d+)$/);

    if (matches) {
      const timeDifferenceSign = matches[1] === "-" ? "-" : "+";
      const hours = parseInt(matches[3]) || 0;
      const minutes = parseInt(matches[5]) || 0;
      const seconds = parseInt(matches[6]) || 0;

      const signMultiplier = timeDifferenceSign === "-" ? -1 : 1;

      const hoursInMillis = hours * 3600000;
      const minutesInMillis = minutes * 60000;
      const secondsInMillis = seconds * 1000;

      const recordMillis =
        signMultiplier * (hoursInMillis + minutesInMillis + secondsInMillis);
      totalDifferenceMillis += recordMillis;
    }
  });

  const totalSign = totalDifferenceMillis >= 0 ? "+" : "-";
  totalDifferenceMillis = Math.abs(totalDifferenceMillis);

  const totalHours = Math.floor(totalDifferenceMillis / 3600000);
  const totalMinutes = Math.floor((totalDifferenceMillis % 3600000) / 60000);
  const totalSeconds = Math.floor((totalDifferenceMillis % 60000) / 1000);

  const hoursStr = totalHours.toString().padStart(2, "0");
  const minutesStr = totalMinutes.toString().padStart(2, "0");
  const secondsStr = totalSeconds.toString().padStart(2, "0");

  const totalTimeDifference = `${totalSign}${hoursStr}:${minutesStr}:${secondsStr}`;

  const totalTimeDifferenceElement = document.getElementById(
    "total-time-difference"
  );

  totalTimeDifferenceElement.style.color =
    totalSign === "+" ? "#40be25" : "red";
  totalTimeDifferenceElement.textContent = totalTimeDifference.slice(0, 6);
}

function deleteLastRecord() {
  const hasInput = !!localStorage.getItem("input");
  const hasOutput = !!localStorage.getItem("output");
  const today = getCurrentDate();

  const recordsLS = JSON.parse(localStorage.getItem("records")) || [];
  const hasTodayRecord = recordsLS.some((r) => r.date === today);

  if (hasInput && !hasTodayRecord) {
    const confirmation = window.confirm(
      "Azi ai o zi în curs (ai intrare). Vrei să resetezi ziua curentă (intrare/pauze) fără să ștergi istoricul?"
    );

    if (confirmation) {
      localStorage.removeItem("input");
      localStorage.removeItem("output");
      localStorage.removeItem("breakStart");
      localStorage.setItem("breakTotal", "00:00:00");

      document.querySelector("#ora__intrare").innerHTML = "";
      document.querySelector("#ora__iesire").innerHTML = "";
      document.querySelector("#time__difference").innerHTML = "";

      updateDisplay();
      updateButtonsState();
      updateBreakUI();
    }
    return;
  }

  const confirmation = window.confirm("Chiar vrei să ștergi ultima înregistrare salvată?");
  if (confirmation && recordsLS.length > 0) {
    recordsLS.shift();
    localStorage.setItem("records", JSON.stringify(recordsLS));

    calculateTotalTimeDifference();
    displayRecords();
    updateDisplay();
    location.reload();
  }
}

function displayRecordsList() {
  recordsList.style.display = "block";
  displayRecords();
}

function toggleRecordsList() {
  if (recordsList.style.display === "none") {
    recordsList.style.display = "block";
    displayRecords();
  } else {
    recordsList.style.display = "none";
  }
}

function isValidTimeFormat(timeString) {
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

function timeToSeconds(t) {
  if (!t || !isValidTimeFormat(t)) return 0;
  const [h, m, s] = t.split(":").map((x) => parseInt(x, 10));
  return h * 3600 + m * 60 + s;
}

function secondsToTime(totalSeconds) {
  const sign = totalSeconds < 0 ? "-" : "";
  let x = Math.abs(totalSeconds);

  const h = Math.floor(x / 3600);
  x %= 3600;
  const m = Math.floor(x / 60);
  const s = x % 60;

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${sign}${hh}:${mm}:${ss}`;
}

function diffSeconds(t1, t2) {
  return timeToSeconds(t2) - timeToSeconds(t1);
}

function handleManualInput() {
  return new Promise((resolve, reject) => {
    manualInputField.addEventListener("blur", function onBlur() {
      manualInputField.removeEventListener("blur", onBlur);

      const manualInput = manualInputField.value;
      if (!isValidTimeFormat(manualInput)) {
        displayErrorMessage("Formatul orei este invalid!");
        reject(new Error("Invalid time format"));
      } else {
        resolve(manualInput);
      }
    });
  });
}

function updateBreakUI() {
  const hasInput = !!localStorage.getItem("input");
  const breakStart = localStorage.getItem("breakStart");
  const breakTotal = localStorage.getItem("breakTotal") || "00:00:00";
  const isBreak = !!breakStart;

  const breakBtn = document.getElementById("btn__break");
  const statusEl = document.getElementById("work-status");
  const breakTotalEl = document.getElementById("break-total");
  const outputBtn = document.getElementById("btn__iesire");

  if (!breakBtn || !statusEl || !breakTotalEl) return;
  const breakHHMM = breakTotal.slice(0, 5);

  /* =========================
     IDLE – fara intrare
     ========================= */
  if (!hasInput) {
    breakBtn.disabled = true;
    breakBtn.textContent = "Pauză";
    breakBtn.classList.remove("is-work", "is-break");

    statusEl.style.display = "none";
    breakTotalEl.style.display = "none";

    return;
  }

  /* =========================
     Zi inceputa → Nu afiseaza pauza
     ========================= */
  breakTotalEl.textContent = `Pauză azi: ${breakHHMM}`;
  const hasBreak = breakHHMM !== "00:00";
  breakTotalEl.style.display = hasBreak ? "flex" : "none";

  /* =========================
     BREAK
     ========================= */
  if (isBreak) {
    breakBtn.disabled = false;
    breakBtn.textContent = "REIA";
    breakBtn.classList.remove("is-work");
    breakBtn.classList.add("is-break");

    statusEl.textContent = "PAUZĂ";
    statusEl.style.display = "flex";
    statusEl.classList.remove("is-work");
    statusEl.classList.add("is-break");
    outputBtn.disabled = true;
    return;
  }

  /* =========================
     WORK
     ========================= */
  breakBtn.disabled = false;
  breakBtn.textContent = "Pauză";
  breakBtn.classList.remove("is-break");
  breakBtn.classList.add("is-work");

  statusEl.textContent = "LUCRU";
  statusEl.style.display = "flex";
  statusEl.classList.remove("is-break");
  statusEl.classList.add("is-work");
}

function toggleBreak() {
  const hasInput = !!localStorage.getItem("input");
  if (!hasInput) {
    displayErrorMessage("Nu ai intrare!");
    return;
  }
  const breakStart = localStorage.getItem("breakStart");
  let breakTotal = localStorage.getItem("breakTotal");

  if (!breakTotal) {
    breakTotal = "00:00:00";
    localStorage.setItem("breakTotal", breakTotal);
  }
  if (!breakStart) {
   const confirmBreak = window.confirm("Intri în pauză acum?");
  if (!confirmBreak) return;

   const now = register();
   localStorage.setItem("breakStart", now);

   updateButtonsState();
   updateBreakUI();
   return;
  }

  const now = register();
  const delta = diffSeconds(breakStart, now);
  if (delta < 0) {
    displayErrorMessage("Ora invalidă pentru pauză!");
    return;
  }
  const totalSeconds = timeToSeconds(breakTotal) + delta;
  localStorage.setItem("breakTotal", secondsToTime(totalSeconds));
  localStorage.removeItem("breakStart");
  updateButtonsState();
  updateBreakUI();
}

updateDisplay();
updateButtonsState();
updateBreakUI();
displayRecords();
calculateTotalTimeDifference();
