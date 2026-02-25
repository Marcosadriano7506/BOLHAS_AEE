const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function createBubble() {
  bubbles.push({
    x: Math.random() * canvas.width,
    y: canvas.height,
    radius: 30 + Math.random() * 20,
    speed: 1 + Math.random() * 2
  });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach((bubble, index) => {
    bubble.y -= bubble.speed;

    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.stroke();

    if (bubble.y + bubble.radius < 0) {
      bubbles.splice(index, 1);
    }
  });

  requestAnimationFrame(drawBubbles);
}

setInterval(createBubble, 1000);
drawBubbles();
async function testarSalvarSessao() {
  const { data, error } = await window.supabase
    .from('sessoes')
    .insert([
      {
        pontuacao: 5,
        nivel: "teste",
        tempo_segundos: 20
      }
    ]);

  if (error) {
    console.log("ERRO:", error);
  } else {
    console.log("SUCESSO:", data);
  }
}

// chama automaticamente ao carregar
testarSalvarSessao();
