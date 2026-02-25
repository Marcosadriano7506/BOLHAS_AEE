const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ELEMENTOS
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const historyButton = document.getElementById("historyButton");
const historyScreen = document.getElementById("historyScreen");
const backButton = document.getElementById("backButton");
const historyTableBody = document.querySelector("#historyTable tbody");

const studentNameInput = document.getElementById("studentName");
const levelSelect = document.getElementById("levelSelect");
const scoreDisplay = document.getElementById("scoreDisplay");
const timeDisplay = document.getElementById("timeDisplay");

// VARIÁVEIS
let bubbles = [];
let level = 1;
let studentName = "";
let gameStarted = false;
let score = 0;
let gameInterval;
let gameTimer;
let timeLeft = 60;

// ==========================
// CRIAR BOLHAS
// ==========================
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

// ==========================
// DESENHAR BOLHAS 3D
// ==========================
function drawBubbles() {

  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach((bubble, index) => {

    bubble.y -= bubble.speed;

    let gradient = ctx.createRadialGradient(
      bubble.x - bubble.radius / 3,
      bubble.y - bubble.radius / 3,
      bubble.radius / 6,
      bubble.x,
      bubble.y,
      bubble.radius
    );

    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.3, "rgba(173,216,230,0.8)");
    gradient.addColorStop(1, "rgba(0,191,255,0.4)");

    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.stroke();

    if (bubble.y + bubble.radius < 0) {
      bubbles.splice(index, 1);
    }
  });

  scoreDisplay.textContent = "Bolhas: " + score;
  timeDisplay.textContent = "Tempo: " + timeLeft + "s";

  requestAnimationFrame(drawBubbles);
}

// ==========================
// CLIQUE PARA ESTOURAR
// ==========================
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

// ==========================
// TIMER
// ==========================
function startTimer() {
  gameTimer = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ==========================
// FINALIZAR JOGO
// ==========================
async function endGame() {

  gameStarted = false;

  clearInterval(gameInterval);
  clearInterval(gameTimer);

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
    alert("Erro ao salvar no banco.");
  } else {
    alert("Sessão finalizada!\nPontuação: " + score);
  }

  startScreen.style.display = "flex";
  timeLeft = 60;
  score = 0;
  bubbles = [];
}

// ==========================
// HISTÓRICO
// ==========================
async function loadHistory() {

  const { data, error } = await window.supabase
    .from('sessoes')
    .select('*')
    .order('data', { ascending: false });

  if (error) {
    alert("Erro ao carregar histórico.");
    return;
  }

  historyTableBody.innerHTML = "";

  data.forEach(sessao => {

    const row = document.createElement("tr");

    const nome = document.createElement("td");
    nome.textContent = sessao.nome;

    const dataTd = document.createElement("td");
    dataTd.textContent = new Date(sessao.data).toLocaleString();

    const pontuacao = document.createElement("td");
    pontuacao.textContent = sessao.pontuacao;

    row.appendChild(nome);
    row.appendChild(dataTd);
    row.appendChild(pontuacao);

    historyTableBody.appendChild(row);
  });
}

// ==========================
// BOTÕES
// ==========================
startButton.addEventListener("click", () => {

  studentName = studentNameInput.value.trim();

  if (studentName === "") {
    alert("Digite o nome do estudante");
    return;
  }

  level = levelSelect.value;

  startScreen.style.display = "none";
  historyScreen.style.display = "none";

  gameStarted = true;
  score = 0;
  bubbles = [];
  timeLeft = 60;

  gameInterval = setInterval(createBubble, 1500);

  startTimer();
  drawBubbles();
});

historyButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  historyScreen.style.display = "flex";
  loadHistory();
});

backButton.addEventListener("click", () => {
  historyScreen.style.display = "none";
  startScreen.style.display = "flex";
});
