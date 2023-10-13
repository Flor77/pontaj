const oraIntrare = document.getElementById("ora__intrare");
const oraIesire = document.getElementById("ora__iesire");
const inputBtn = document.getElementById("btn__intrare");
const outputBtn = document.getElementById("btn__iesire");

let inputArray = localStorage.getItem("input")
  ? JSON.parse(localStorage.getItem("input"))
  : [];
console.log(inputArray);

let outputArray = localStorage.getItem("output")
  ? JSON.parse(localStorage.getItem("output"))
  : [];
console.log(outputArray);

// Function to display the current time
function inputTime() {
  const now = new Date();
  const hours1 = now.getHours();
  const minutes1 = now.getMinutes();
  const seconds1 = now.getSeconds();
  const timeString = `${hours1}:${minutes1}:${seconds1}`;
  inputArray.push(timeString);
  localStorage.setItem("input", JSON.stringify(inputArray));
  location.reload();
}

function outputTime() {
  const now = new Date();
  const hours2 = now.getHours();
  const minutes2 = now.getMinutes();
  const seconds2 = now.getSeconds();
  const timeString = `${hours2}:${minutes2}:${seconds2}`;
  outputArray.push(timeString);
  localStorage.setItem("output", JSON.stringify(outputArray));
  location.reload();
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

    oraIntrare.innerHTML = inputArray[0];
    oraIesire.innerHTML = outputArray[0];
    document.querySelector(
      "#time__difference"
    ).innerHTML = `${hours}:${minutes}:${seconds}`;
  }
}

// Attach the displayTime function to the button click event
inputBtn.addEventListener("click", inputTime);
outputBtn.addEventListener("click", outputTime);

document.querySelector("#ora__intrare").innerHTML = inputArray[0];
document.querySelector("#ora__iesire").innerHTML = outputArray[0];

updateDisplay();
