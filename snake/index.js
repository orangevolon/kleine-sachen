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

function createSnake({
  gridSize,
  speed,
  initialDirection = "right",
  onProgress,
  onFail,
}) {
  let direction = initialDirection;
  const initialHeadIdx = Math.floor(gridSize ** 2 / 2);
  const positions = [initialHeadIdx];

  function getNext(head, direction) {
    switch (direction) {
      case "right": {
        if (head % gridSize === gridSize - 1) throw head;
        return head + 1;
      }
      case "left": {
        if (head % gridSize === 0) throw head;
        return head - 1;
      }
      case "up": {
        if (head < gridSize) throw head;
        return head - gridSize;
      }
      case "down": {
        if (head > (gridSize - 1) * gridSize) throw head;
        return head + gridSize;
      }
    }
  }

  function setDirection(newDirection) {
    direction = newDirection;
  }

  function progress() {
    const head = positions[positions.length - 1];

    try {
      const added = getNext(head, direction);
      positions.push(added);
      const removed = positions.shift();

      return {
        added: [added],
        removed: [removed],
      };
    } catch (hit) {
      return { hit };
    }
  }

  // run the snake
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

  return {
    setDirection,
    progress,
    positions,
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

function runGame() {
  const app = document.getElementById("app");
  const cells = createCells(GRID_SIDE);
  app.appendChild(cells);

  const snake = createSnake({
    gridSize: GRID_SIDE,
    speed: SPEED_MOVE_PER_SECOND,
    onProgress: createProgressHandler(cells),
    onFail: createFailHandler(),
  });

  document.addEventListener("keydown", (event) => {
    const direction = keyDirMap[event.key];
    if (direction) snake.setDirection(direction);
  });

  return { snake, cells };
}

runGame();
