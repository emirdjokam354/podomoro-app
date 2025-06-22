let time = 25 * 60;
let timerInterval;
let isRunning = false;
let sessions = 0;
let isFocus = true;
let endTime = null;

const alertSound = document.getElementById("alertSound");
const countdownBeep = new Audio("asset/countdown.mp3");

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function updateTimerDisplay(seconds) {
  document.getElementById("timer").textContent = formatTime(seconds);
}

function getTodayKey() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
}

function incrementDailySessions() {
  const todayKey = getTodayKey();
  const dailyData = JSON.parse(localStorage.getItem("dailySessions") || "{}");
  if (dailyData[todayKey]) {
    dailyData[todayKey] += 1;
  } else {
    dailyData[todayKey] = 1;
  }
  localStorage.setItem("dailySessions", JSON.stringify(dailyData));
  document.getElementById("sessions").textContent = `Sesi Hari Ini: ${dailyData[todayKey]}`;
}

function loadDailySessions() {
  const todayKey = getTodayKey();
  const dailyData = JSON.parse(localStorage.getItem("dailySessions") || "{}");
  const count = dailyData[todayKey] || 0;
  document.getElementById("sessions").textContent = `Sesi Hari Ini: ${count}`;
}

function tick() {
  const now = Date.now();
  const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
  updateTimerDisplay(remaining);

  // Mainkan suara beep saat 5 detik terakhir
  if (remaining <= 5 && remaining > 0) {
    countdownBeep.play();
  }

  if (remaining <= 0) {
    clearInterval(timerInterval);
    isRunning = false;
    timerInterval = null;

    if (isFocus) {
      sessions++;
      document.getElementById("sessions").textContent = `Sesi Hari ini : ${sessions}`;
      incrementDailySessions();
      const task = document.getElementById("taskInput").value.trim();
      const duration = parseInt(document.getElementById("focusInput").value) || 25;
      if (task) saveTaskToHistory(task, duration);
      alertSound.play();
      setTimeout(() => {
        alert("Waktu Istirahat! 🎉");
      }, 0);
      isFocus = false;
      startTimer(); // Mulai otomatis istirahat
    } else {
      alertSound.play();
      setTimeout(() => {
        alert("Waktu Fokus Lagi! 💪");
      }, 0);
      isFocus = true;
      const focusDuration = parseInt(document.getElementById("focusInput").value) || 25;
      time = focusDuration * 60;
      updateTimerDisplay(time); // Tampilkan waktu fokus, tapi tidak mulai otomatis
    }
  }
}

function startTimer() {
  if (isRunning) return;

  const focusDuration = parseInt(document.getElementById("focusInput").value) || 25;
  const breakDuration = parseInt(document.getElementById("breakInput").value) || 5;
  const duration = isFocus ? focusDuration : breakDuration;

  endTime = Date.now() + duration * 60 * 1000;

  tick();
  timerInterval = setInterval(tick, 1000);
  isRunning = true;
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timerInterval = null;
  const now = Date.now();
  const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
  time = remaining;
  updateTimerDisplay(time);
}

function resetTimer() {
  pauseTimer();
  const focusDuration = parseInt(document.getElementById("focusInput").value) || 25;
  time = focusDuration * 60;
  isFocus = true;
  updateTimerDisplay(time);
}

function saveTaskToHistory(task, duration) {
  const now = new Date();
  const timestamp = now.toLocaleString();
  const history = JSON.parse(localStorage.getItem("taskHistory") || "[]");
  history.unshift({ task, duration, time: timestamp });
  localStorage.setItem("taskHistory", JSON.stringify(history));
  loadTaskHistory();
}

function deleteTask(index) {
  const history = JSON.parse(localStorage.getItem("taskHistory") || "[]");
  history.splice(index, 1);
  localStorage.setItem("taskHistory", JSON.stringify(history));
  loadTaskHistory();
}

function clearHistory() {
  localStorage.removeItem("taskHistory");
  localStorage.removeItem("dailySessions");
  loadTaskHistory();
  loadDailySessions();
}

function loadTaskHistory() {
  const taskHistory = JSON.parse(localStorage.getItem("taskHistory") || "[]");
  const list = document.getElementById("taskHistory");
  list.innerHTML = "";
  taskHistory.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `
      <span>${item.task} - ${item.duration} menit - ${item.time}</span>
      <button onclick="deleteTask(${index})">✖</button>
    `;
    list.appendChild(li);
  });
}

document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);
document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);

document.getElementById("taskInput").addEventListener("input", () => {
  const value = document.getElementById("taskInput").value.trim();
  document.getElementById("taskDisplay").textContent = value !== "" ? value : "Belum ada tugas.";
});

updateTimerDisplay(time);
loadTaskHistory();
loadDailySessions(); // ← ini penting agar "Sesi Hari Ini" muncul dari localStorage saat pertama kali
