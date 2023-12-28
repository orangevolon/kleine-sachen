const GRID_SIDE = 20;
const SPEED_MOVE_PER_SECOND = 2;

const keyDirMap = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

function createCells(gridSize) {
  const cellsCount = gridSize ** 2;

  const cellsContainer = document.createElement("div");
  cellsContainer.classList.add("cells-container");
  cellsContainer.style.setProperty("--grid-size", gridSize);

  for (let cellIdx = 0; cellIdx < cellsCount; cellIdx++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = `cell-${cellIdx}`;

    cellsContainer.appendChild(cell);
  }

  return cellsContainer;
}

function createSnake(gridSize, initialDirection = "right") {
  let direction = initialDirection;
  const initialHeadIdx = Math.floor(gridSize ** 2 / 2);
  const positions = [initialHeadIdx];

  function getNext(head, direction) {
    switch (direction) {
      case "right":
        return head + 1;
      case "left":
        return head - 1;
      case "up":
        return head - gridSize;
      case "down":
        return head + gridSize;
    }
  }

  function setDirection(newDirection) {
    direction = newDirection;
  }

  function progress() {
    const head = positions[positions.length - 1];
    const added = getNext(head, direction);
    positions.push(added);

    const removed = positions.shift();

    return {
      added: [added],
      removed: [removed],
    };
  }

  return {
    setDirection,
    progress,
    positions,
  };
}

function renderSnake(diff, cellContainer) {
  for (const position of diff.added) {
    const cell = cellContainer.querySelector(`#cell-${position}`);
    cell.classList.add("snake-cell");
  }

  for (const position of diff.removed) {
    const cell = cellContainer.querySelector(`#cell-${position}`);
    cell.classList.remove("snake-cell");
  }
}

function prepareScene() {
  const app = document.getElementById("app");
  const cells = createCells(GRID_SIDE);
  app.appendChild(cells);

  const snake = createSnake(GRID_SIDE);
  document.addEventListener("keydown", (event) => {
    const direction = keyDirMap[event.key];
    if (direction) snake.setDirection(direction);
  });

  return { snake, cells };
}

function runGame() {
  const { snake, cells } = prepareScene();

  const interval = 1000 / SPEED_MOVE_PER_SECOND;
  setInterval(() => {
    const diff = snake.progress();
    requestAnimationFrame(() => {
      renderSnake(diff, cells);
    });
  }, interval);
}

runGame();
