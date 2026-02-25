const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const studentNameInput = document.getElementById("studentName");
const levelSelect = document.getElementById("levelSelect");

let bubbles = [];
let level = 1;
let studentName = "";
let gameStarted = false;
let score = 0;
let gameInterval;
let gameTimer;
let timeLeft = 60; // 60 segundos

function createBubble() {

  let radius;
  let speed;

  if (level == 1) {
    radius = 70;
    speed = 1;
  } else if (level == 2) {
    radius = 45;
    speed = 1;
  } else {
    radius = 45;
    speed = 2;
  }

  let x = Math.random() * (canvas.width - radius * 2) + radius;

  bubbles.push({
    x: x,
    y: canvas.height + radius,
    radius: radius,
    speed: speed
  });
}

function drawBubbles() {

  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach((bubble, index) => {
    bubble.y -= bubble.speed;

    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (bubble.y + bubble.radius < 0) {
      bubbles.splice(index, 1);
    }
  });

  ctx.fillStyle = "white";
  ctx.font = "bold 22px Arial";
  ctx.fillText("Bolhas Estouradas: " + score, 20, 40);
  ctx.fillText("Tempo: " + timeLeft + "s", 20, 70);

  requestAnimationFrame(drawBubbles);
}

canvas.addEventListener("click", function (event) {

  if (!gameStarted) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  bubbles.forEach((bubble, index) => {
    const dx = clickX - bubble.x;
    const dy = clickY - bubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < bubble.radius) {
      bubbles.splice(index, 1);
      score++;
    }
  });
});

function startTimer() {
  gameTimer = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

async function endGame() {

  gameStarted = false;

  clearInterval(gameInterval);
  clearInterval(gameTimer);

  // SALVAR NO SUPABASE
  const { error } = await window.supabase
    .from('sessoes')
    .insert([
      {
        nome: studentName,
        pontuacao: score,
        data: new Date()
      }
    ]);

  if (error) {
    console.log("Erro ao salvar:", error);
    alert("Erro ao salvar no banco.");
  } else {
    alert("Sessão finalizada!\nPontuação: " + score);
  }

  // Reset
  startScreen.style.display = "flex";
  timeLeft = 60;
  score = 0;
  bubbles = [];
}

startButton.addEventListener("click", () => {

  studentName = studentNameInput.value.trim();

  if (studentName === "") {
    alert("Digite o nome do estudante");
    return;
  }

  level = levelSelect.value;

  startScreen.style.display = "none";

  gameStarted = true;
  score = 0;
  bubbles = [];
  timeLeft = 60;

  gameInterval = setInterval(createBubble, 1500);

  startTimer();
  drawBubbles();
});
