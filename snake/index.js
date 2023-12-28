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

const GRID_SIDE = 20;

const app = document.getElementById("app");
const cells = createCells(GRID_SIDE);
app.appendChild(cells);
