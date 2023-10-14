const oraIntrare = document.getElementById("ora__intrare");
const oraIesire = document.getElementById("ora__iesire");
const inputBtn = document.getElementById("btn__intrare");
const outputBtn = document.getElementById("btn__iesire");
const resetBtn = document.getElementById("btn__reset");

let inputArray = localStorage.getItem("input")
  ? JSON.parse(localStorage.getItem("input"))
  : [];
console.log(inputArray);

let outputArray = localStorage.getItem("output")
  ? JSON.parse(localStorage.getItem("output"))
  : [];
console.log(outputArray);

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

// Function to display the current time
function inputTime() {
  const time = register();
  inputArray.push(time);
  localStorage.setItem("input", JSON.stringify(inputArray));
  document.querySelector("#ora__intrare").innerHTML = inputArray[0];
  updateDisplay();
}

function outputTime() {
  const time = register();
  outputArray.push(time);
  localStorage.setItem("output", JSON.stringify(outputArray));
  document.querySelector("#ora__iesire").innerHTML = outputArray[0];
  updateDisplay();
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

// Function to calculate and display the time difference
function updateDisplay() {
  if (inputArray.length > 0 && outputArray.length > 0) {
    const inputTimeParts = inputArray[0].split(":");
    const outputTimeParts = outputArray[0].split(":");

    const inputDate = new Date(
      0,
      0,
      0,
      inputTimeParts[0],
      inputTimeParts[1],
      inputTimeParts[2]
    );
    const outputDate = new Date(
      0,
      0,
      0,
      outputTimeParts[0],
      outputTimeParts[1],
      outputTimeParts[2]
    );

    const timeDifference = new Date(outputDate - inputDate);

    const hours = timeDifference.getUTCHours();
    const minutes = timeDifference.getUTCMinutes();
    const seconds = timeDifference.getUTCSeconds();

    document.querySelector("#time__difference").innerHTML = `${
      hours < 10 ? "0" : ""
    }${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  }
}

inputBtn.addEventListener("click", inputTime);
outputBtn.addEventListener("click", outputTime);
resetBtn.addEventListener("click", resetTime);

document.querySelector("#ora__intrare").innerHTML = inputArray[0];
document.querySelector("#ora__iesire").innerHTML = outputArray[0];

updateDisplay();
