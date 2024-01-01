const GRID_SIDE = 20;
const SPEED_MOVE_PER_SECOND = 2;

const oppositeDirections = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

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

function createSnake({
  gridSize,
  speed,
  initialDirection = "right",
  onProgress,
  onFail,
  onFoodSpawn,
}) {
  let direction = initialDirection;
  let foodPosition;

  const initialHeadIdx = Math.floor(gridSize ** 2 / 2);
  const positions = [initialHeadIdx];

  // Private methods
  function spawnNewFood() {
    const oldPosition = foodPosition;
    const maxPosition = gridSize ** 2 - 1;

    do foodPosition = Math.round(Math.random() * maxPosition);
    while (isOnSnakeBody(foodPosition));

    onFoodSpawn?.({
      position: foodPosition,
      oldPosition,
    });
  }

  function isOnSnakeBody(position) {
    return positions.includes(position);
  }

  function isOnEdge(position) {
    if (position % gridSize === gridSize - 1) return "right-edge";
    if (position % gridSize === 0) return "left-edge";
    if (position < gridSize) return "top-edge";
    if (position > (gridSize - 1) * gridSize) return "bottom-edge";
    return false;
  }

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

  function getNextIfPossible(head, direction) {
    const next = getNext(head, direction);

    if (isOnSnakeBody(next)) throw head;

    const edge = isOnEdge(head);
    if (direction === "right" && edge === "right-edge") throw head;
    if (direction === "left" && edge === "left-edge") throw head;
    if (direction === "top" && edge === "top-edge") throw head;
    if (direction === "bottom" && edge === "bottom-edge") throw head;

    return next;
  }

  // Public methods
  function setDirection(newDirection) {
    if (newDirection === oppositeDirections[direction]) return;
    direction = newDirection;
  }

  function progress() {
    const head = positions[positions.length - 1];

    try {
      const nextHead = getNextIfPossible(head, direction);
      positions.push(nextHead);

      if (nextHead === foodPosition) {
        spawnNewFood();

        return {
          added: [nextHead],
          removed: [],
        };
      }

      const removed = positions.shift();

      return {
        added: [nextHead],
        removed: [removed],
      };
    } catch (hit) {
      return { hit };
    }
  }

  function start() {
    const intervalTimeMs = 1000 / speed;
    const interval = setInterval(() => {
      const result = progress();

      if (result.hit) {
        clearInterval(interval);
        onFail?.(result);
      } else {
        onProgress(result);
      }
    }, intervalTimeMs);

    spawnNewFood();
  }

  return {
    positions,
    setDirection,
    start,
  };
}

function createProgressHandler(cellContainer) {
  return function handleProgress(progressDiff) {
    for (const position of progressDiff.added) {
      const cell = cellContainer.querySelector(`#cell-${position}`);
      cell.classList.add("snake-cell");
    }

    for (const position of progressDiff.removed) {
      const cell = cellContainer.querySelector(`#cell-${position}`);
      cell.classList.remove("snake-cell");
    }
  };
}

function createFailHandler() {
  return function failHandler({ hit }) {
    console.log("hit the wall!", hit);
  };
}

function createFoodSpawnHandler(cellContainer) {
  return function handleSpawnFood({ position, oldPosition }) {
    if (oldPosition) {
      const oldCell = cellContainer.querySelector(`#cell-${oldPosition}`);
      oldCell.classList.remove("food");
    }

    const newCell = cellContainer.querySelector(`#cell-${position}`);
    newCell.classList.add("food");
  };
}

function runGame() {
  const app = document.getElementById("app");
  const cells = createCells(GRID_SIDE);
  app.appendChild(cells);

  const snake = createSnake({
    gridSize: GRID_SIDE,
    speed: SPEED_MOVE_PER_SECOND,
    onProgress: createProgressHandler(cells),
    onFail: createFailHandler(),
    onFoodSpawn: createFoodSpawnHandler(cells),
  });

  document.addEventListener("keydown", (event) => {
    const direction = keyDirMap[event.key];
    if (direction) snake.setDirection(direction);
  });

  snake.start();
}

runGame();
