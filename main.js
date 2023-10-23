const oraIntrare = document.getElementById("ora__intrare");
const oraIesire = document.getElementById("ora__iesire");
const inputBtn = document.getElementById("btn__intrare");
const outputBtn = document.getElementById("btn__iesire");
const resetBtn = document.getElementById("btn__reset");
const resetBtnRecords = document.getElementById("btn__resetRecords");
const recordsList = document.getElementById("recordsList");
const exportBtn = document.getElementById("btn__export");
const resetBtnLastRecords = document.getElementById("btn__resetLastRecords");
const displayBtnRecords = document.getElementById("btn__displayRecords");

// Function to save data to local storage with a Promise
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

// Function to get data from local storage with a Promise
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
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const timeString = `${hours < 10 ? "0" : ""}${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  return timeString;
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
    listItem.textContent = record;
    recordsList.appendChild(listItem);
  });
}

// Function to display the current time
async function inputTime() {
  if (!inputTimeValue) {
    const time = register();
    await saveToLocalStorage("input", time);
    document.querySelector("#ora__intrare").innerHTML = time;
    updateDisplay();
  } else if (inputTimeValue) {
    displayErrorMessage("Ai intrare!");
    return;
  }
}

async function outputTime() {
  if (inputTimeValue) {
    const time = register();
    await saveToLocalStorage("output", time);
    document.querySelector("#ora__iesire").innerHTML = time;
    document.querySelector("#ora__intrare").innerHTML = "";
    document.querySelector("#ora__iesire").innerHTML = "";
    calculateTotalTimeDifference();
    updateDisplay();
  } else if (!inputTimeValue) {
    displayErrorMessage("Nu ai intrare!");
    return;
  }
  clearErrorMessage();
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
  document.querySelector("#ora__intrare").innerHTML = "";
  document.querySelector("#ora__iesire").innerHTML = "";
  updateDisplay();
}

function getCurrentDateFromInputTimeValue() {
  const inputTimeParts = inputTimeValue.split(":");
  return `${inputTimeParts[0]}-${
    inputTimeParts[1]
  }-${inputTimeParts[2].substring(0, 2)}`;
}

function resetRecords() {
  const confirmation = window.confirm("Chiar vrei sa stergi?");

  if (confirmation) {
    localStorage.removeItem("records");
    recordsList.innerHTML = "";
  }
}

//Calculate and display the time difference relative to 8:30:00 (regular working time) ,update the "records" array and display records
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

    const timeDifferenceMillis =
      outputMillis - inputMillis - regularWorkingMillis;

    // Check if the current record exists in the list of records

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
      formatTimeDifference(timeDifferenceString);

    // Create a record for the current date and time difference

    const record = `${today}: ${timeDifferenceString}`;

    // Add this record to the beginning of the list
    const existingRecord = records.find((record) => record.startsWith(today));
    if (!existingRecord) {
      records.unshift(record);
    }

    // Update the "records" array in local storage
    await saveToLocalStorage("records", JSON.stringify(records));

    calculateTotalTimeDifference();
    resetInputAndOutput();

    document.querySelector("#time__difference").innerHTML = "";
  }
}

function formatTimeDifference(record) {
  const parts = record.split(":");
  const dateString = parts[0];
  const timeDifference = parts[1].trim();

  const formattedDate = new Date(dateString).toLocaleDateString();
  return `${formattedDate}: ${timeDifference}`;
}

inputBtn.addEventListener("click", inputTime);
outputBtn.addEventListener("click", outputTime);
resetBtn.addEventListener("click", resetTime);
resetBtnRecords.addEventListener("click", resetRecords);
resetBtnLastRecords.addEventListener("click", deleteLastRecord);
displayBtnRecords.addEventListener("click", toggleRecordsList);

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
  errorMessageElement.style.display = "block"; // Show the error message element
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
  // Ensure there are records to export
  if (records.length === 0) {
    alert("No records to export.");
    return;
  }

  // Create a CSV content
  let csvContent = "Time Difference\n"; // Header

  records.forEach((record) => {
    csvContent += record + "\n";
  });

  // Create a Blob containing the CSV data
  const blob = new Blob([csvContent], { type: "text/csv" });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a download link
  const a = document.createElement("a");
  a.href = url;
  a.download = "records.csv"; // You can customize the filename
  document.body.appendChild(a);

  // Trigger the click event on the link to initiate the download
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function calculateTotalTimeDifference() {
  let totalDifferenceMillis = 0;

  records.forEach((record) => {
    const timeDifference = record.split(": ")[1].trim();
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

  document.getElementById("total-time-difference").textContent =
    totalTimeDifference;
}

function deleteLastRecord() {
  const confirmation = window.confirm("Chiar vrei sa stergi?");
  const records = JSON.parse(localStorage.getItem("records")) || [];

  if (confirmation && records.length > 0) {
    records.shift();
    localStorage.setItem("records", JSON.stringify(records));

    displayRecords();
    calculateTotalTimeDifference();
    updateDisplay();
  }
}

function displayRecordsList() {
  recordsList.style.display = "block"; // Show the records list
  displayRecords();
}

function toggleRecordsList() {
  if (recordsList.style.display === "none") {
    recordsList.style.display = "block"; // Show the records list
  } else {
    recordsList.style.display = "none"; // Hide the records list
  }
}

updateDisplay();
displayRecords();
calculateTotalTimeDifference();
