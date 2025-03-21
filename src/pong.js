import { Paddle } from "./paddle.js";
import { Ball } from "./ball.js";
import { Text } from "./text.js";

export function Pong(canvas) {

  console.log("Welcome to PONG!");

  const ctx = canvas.getContext("2d");

  let lastTime = Date.now() / 1000.0;
  let text = undefined;
  let ball = undefined;
  
  // Left paddle
  const paddleLeft = new Paddle({
    ctx,
    down: "s",
    up: "z",
    height: canvas.height
  });
  paddleLeft.position[0] = 0;

  // Right paddle
  const paddleRight = new Paddle({
    ctx,
    down: "ArrowDown",
    up: "ArrowUp",
    height: canvas.height
  });
  paddleRight.position[0] = 580;

  // The ball
  function createBall() {
    ball = new Ball({
      ctx,
      width: canvas.width,
      height: canvas.height,
      leftPaddle: paddleLeft,
      rightPaddle: paddleRight,
      onEscape: (result) => {
  
        if (ball) {
          ball = undefined;
          text = new Text({ ctx, text: "Gagnant: " + (result.winner === 'left' ? 'Gauche' : 'Droit')});
          text.position = [
            canvas.width / 2.0,
            canvas.height / 2.0
          ]
          endGame();
        }
  
      }
    });
    ball.position = [ canvas.width / 2.0, canvas.height / 2.0 ];
  
  }

  
  function endGame() {
    setTimeout(
      () => {
        text = undefined;
        createBall();
      },
      3000
    )
  }

  // The animation loop
  function loop() {
    const time = Date.now() / 1000.0;
    let delta = time - lastTime;
    lastTime = time;

    // First update the position of all the objects
    paddleLeft.update(delta);
    paddleRight.update(delta);
    if (ball) { ball.update(delta); }
    if (text) { text.update(delta); }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all the objects
    paddleLeft.draw();
    paddleRight.draw();

    if (ball) { ball.draw(); }
    if (text) { text.draw(); }

    // Emit the current state to the server
    window.network.sendUdp(JSON.stringify({
      paddleLeft: { position: paddleLeft.position },
      paddleRight: { position: paddleRight.position },
      ball: ball ? { position: ball.position } : null,
      text: text ? { text: text.text } : null
    }));

    // Program the next animation frame
    requestAnimationFrame(loop);
  }

  // Remplacez la partie à la fin par:
  createBall();

  // Écouter les mises à jour du serveur
  window.electron.receive('game-update', (data) => {
    // console.log(data)
      if (data.paddleLeft && data.paddleRight) {
          paddleLeft.position = data.paddleLeft.position;
          paddleRight.position = data.paddleRight.position;
          
          if (data.ball && ball) {
              ball.position = data.ball.position;
          }

          // Gérer d'autres états du jeu si nécessaire
          if (data.text) {
              text = new Text({ ctx, text: data.text.text });
              text.position = [
                  canvas.width / 2.0,
                  canvas.height / 2.0
              ];

              endGame();
            }
      }
  });

  // Start the game
  requestAnimationFrame(loop);
}