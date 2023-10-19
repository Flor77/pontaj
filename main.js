const oraIntrare = document.getElementById("ora__intrare");
const oraIesire = document.getElementById("ora__iesire");
const inputBtn = document.getElementById("btn__intrare");
const outputBtn = document.getElementById("btn__iesire");
const resetBtn = document.getElementById("btn__reset");
const resetBtnRecords = document.getElementById("btn__resetRecords");
const recordsList = document.getElementById("recordsList");
const exportBtn = document.getElementById("btn__export");

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
  const time = register();
  await saveToLocalStorage("input", time);
  document.querySelector("#ora__intrare").innerHTML = time;
  updateDisplay();
}

async function outputTime() {
  if (inputTimeValue) {
    const time = register();
    await saveToLocalStorage("output", time);
    document.querySelector("#ora__iesire").innerHTML = time;
    updateDisplay();
    document.querySelector("#ora__intrare").innerHTML = "";
    document.querySelector("#ora__iesire").innerHTML = "";
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

// Function to calculate and display the time difference relative to 8:30:00 (regular working time) ,update the "records" array and display records
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
      timeDifferenceString;

    // Create a record for the current date and time difference

    const record = `${today}: ${timeDifferenceString}`;

    // Add this record to the beginning of the list
    const existingRecord = records.find((record) => record.startsWith(today));
    if (!existingRecord) {
      records.unshift(record);
    }

    // Update the "records" array in local storage
    await saveToLocalStorage("records", JSON.stringify(records));

    // Display the records in the list
    displayRecords();
    document.querySelector("#time__difference").innerHTML = "";
  }
}

inputBtn.addEventListener("click", inputTime);
outputBtn.addEventListener("click", outputTime);
resetBtn.addEventListener("click", resetTime);
resetBtnRecords.addEventListener("click", resetRecords);

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

updateDisplay();
displayRecords();
