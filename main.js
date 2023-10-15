const oraIntrare = document.getElementById("ora__intrare");
const oraIesire = document.getElementById("ora__iesire");
const inputBtn = document.getElementById("btn__intrare");
const outputBtn = document.getElementById("btn__iesire");
const resetBtn = document.getElementById("btn__reset");
const resetBtnRecords = document.getElementById("btn__resetRecords");
const recordsList = document.getElementById("recordsList");
const today = getCurrentDate(); // Get the current date

let inputArray = localStorage.getItem("input")
  ? JSON.parse(localStorage.getItem("input"))
  : [];

let outputArray = localStorage.getItem("output")
  ? JSON.parse(localStorage.getItem("output"))
  : [];

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
function inputTime() {
  const time = register();
  inputArray.push(time);
  localStorage.setItem("input", JSON.stringify(inputArray));
  document.querySelector("#ora__intrare").innerHTML = inputArray[0];
  updateDisplay();
  outputBtn.disabled = false;
}

function outputTime() {
  if (inputArray.length > 0) {
    const time = register();
    outputArray.push(time);
    localStorage.setItem("output", JSON.stringify(outputArray));
    document.querySelector("#ora__iesire").innerHTML = outputArray[0];
    updateDisplay();
  }
}

function resetTime() {
  localStorage.removeItem("input");
  localStorage.removeItem("output");
  inputArray = [];
  outputArray = [];
  document.querySelector("#ora__intrare").innerHTML = "";
  document.querySelector("#ora__iesire").innerHTML = "";
  document.querySelector("#time__difference").innerHTML = "";
  updateDisplay();
}

function resetRecords() {
  localStorage.removeItem("records");
  recordsList.innerHTML = "";
}

// Function to calculate and display the time difference relative to 8:30:00 (regular working time)
function updateDisplay() {
  if (inputArray.length > 0 && outputArray.length > 0) {
    const inputTimeParts = inputArray[0].split(":");
    const outputTimeParts = outputArray[0].split(":");

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

    const sign = timeDifferenceMillis < 0 ? "-" : "";
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
    records.unshift(record);

    // Update the "records" array in local storage
    localStorage.setItem("records", JSON.stringify(records));

    // Display the records in the list
    displayRecords();
  }
  function displayRecords() {
    // Clear the list
    recordsList.innerHTML = "";

    // Display each record in the list
    records.forEach((record) => {
      const listItem = document.createElement("li");
      listItem.textContent = record;
      recordsList.appendChild(listItem);
    });
  }
}

inputBtn.addEventListener("click", inputTime);
outputBtn.addEventListener("click", outputTime);
resetBtn.addEventListener("click", resetTime);
resetBtnRecords.addEventListener("click", resetRecords);

document.querySelector("#ora__intrare").innerHTML = inputArray[0];
document.querySelector("#ora__iesire").innerHTML = outputArray[0];

if (inputArray.length === 0) {
  document.querySelector("#ora__intrare").innerHTML = "";
}

if (outputArray.length === 0) {
  document.querySelector("#ora__iesire").innerHTML = "";
}

updateDisplay();
displayRecords();
