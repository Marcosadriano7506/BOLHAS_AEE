const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ELEMENTOS DA TELA INICIAL
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const studentNameInput = document.getElementById("studentName");
const levelSelect = document.getElementById("levelSelect");

// VARIÁVEIS DO JOGO
let bubbles = [];
let level = 1;
let studentName = "";
let gameStarted = false;
let score = 0;
let gameInterval;

// FUNÇÃO PARA CRIAR BOLHAS BASEADO NO NÍVEL
function createBubble() {

  let radius;
  let speed;

  if (level == 1) {
    radius = 60;
    speed = 1;
  } else if (level == 2) {
    radius = 40;
    speed = 1;
  } else {
    radius = 40;
    speed = 2;
  }

  bubbles.push({
    x: Math.random() * canvas.width,
    y: canvas.height,
    radius: radius,
    speed: speed
  });
}

// DESENHAR BOLHAS
function drawBubbles() {

  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach((bubble, index) => {

    bubble.y -= bubble.speed;

    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.stroke();

    // ESTOURAR AO CLICAR (SIMULA TOQUE POR ENQUANTO)
    canvas.addEventListener("click", function (event) {
      const dx = event.clientX - bubble.x;
      const dy = event.clientY - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bubble.radius) {
        bubbles.splice(index, 1);
        score++;
      }
    });

    if (bubble.y + bubble.radius < 0) {
      bubbles.splice(index, 1);
    }
  });

  // MOSTRAR PONTUAÇÃO
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Aluno: " + studentName, 20, 40);
  ctx.fillText("Pontuação: " + score, 20, 70);

  requestAnimationFrame(drawBubbles);
}

// BOTÃO INICIAR
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

  gameInterval = setInterval(createBubble, 1000);

  drawBubbles();
});
