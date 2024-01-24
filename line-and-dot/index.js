const MIN_BOARD_WIDTH = 1;
const MIN_BOARD_HEIGHT = 1;
const DOT_QUARTERS_PER_CELL = 4;
const DOT_SIZE_PX = 8;
const EDGE_THICKNESS = 6;

function appendElement(type, parent, { classes, id, cssVars, onClick } = {}) {
  const element = document.createElement(type);

  if (classes) {
    for (const className of classes) {
      element.classList.add(className);
    }
  }

  if (id) {
    element.setAttribute("id", id);
  }

  if (cssVars) {
    for (const [cssVarKey, cssVarValue] of Object.entries(cssVars)) {
      element.style.setProperty(cssVarKey, cssVarValue);
    }
  }

  if (onClick) {
    element.addEventListener("click", onClick);
  }

  parent.appendChild(element);
  return element;
}

function validateBoardSize({ rows, cols }) {
  if (cols < MIN_BOARD_WIDTH)
    throw new Error(`Grid width must be at least ${MIN_BOARD_WIDTH}`);

  if (rows < MIN_BOARD_HEIGHT)
    throw new Error(`Grid height must be at least ${MIN_BOARD_HEIGHT}`);
}

function createBoard(container, options) {
  function appendCellEdges(cell, row, col) {
    const cssVars = { "--edge-thickness": `${EDGE_THICKNESS}px` };

    const isLastCol = col === options.cols - 1;
    const isLastRow = row === options.rows - 1;

    function createClickHandler(edge) {
      return function handleClick(event) {
        options?.onEdgeSelect?.({ col, row, edge }, event);
      };
    }

    appendElement("div", cell, {
      classes: ["cell-edge", "align-top"],
      cssVars,
      onClick: createClickHandler("top"),
    });

    appendElement("div", cell, {
      classes: ["cell-edge", "align-left"],
      cssVars,
      onClick: createClickHandler("left"),
    });

    if (isLastRow) {
      appendElement("div", cell, {
        classes: ["cell-edge", "align-bottom"],
        cssVars,
        onClick: createClickHandler("bottom"),
      });
    }

    if (isLastCol) {
      appendElement("div", cell, {
        classes: ["cell-edge", "align-right"],
        cssVars,
        onClick: createClickHandler("right"),
      });
    }
  }

  function appendCellDots(cell, rowIdx, colIdx) {
    const cssVars = { "--dot-size": `${DOT_SIZE_PX}px` };

    appendElement("div", cell, {
      classes: ["cell-dot"],
      cssVars,
    });

    const isLastCol = colIdx === options.cols - 1;
    const isLastRow = rowIdx === options.rows - 1;

    if (isLastCol && isLastRow) {
      appendElement("div", cell, {
        classes: ["cell-dot", "align-right", "align-bottom"],
        cssVars,
      });
    }

    if (isLastCol) {
      appendElement("div", cell, {
        classes: ["cell-dot", "align-right"],
        cssVars,
      });
    }

    if (isLastRow) {
      appendElement("div", cell, {
        classes: ["cell-dot", "align-bottom"],
        cssVars,
      });
    }
  }

  function appendCells(row, rowIdx) {
    for (let colIdx = 0; colIdx < options.cols; colIdx++) {
      const cell = appendElement("td", row, {
        classes: ["cell"],
        id: `cell-${rowIdx}-${colIdx}`,
      });

      const cellSpacer = appendElement("div", cell, {
        classes: ["cell-spacer"],
      });

      appendCellDots(cellSpacer, rowIdx, colIdx);
      appendCellEdges(cellSpacer, rowIdx, colIdx);
    }
  }

  function appendRows(container) {
    for (let rowIdx = 0; rowIdx < options.rows; rowIdx++) {
      const row = appendElement("tr", container, {
        classes: ["board-row"],
      });

      appendCells(row, rowIdx);
    }
  }

  function insertBoard(container) {
    container.innerHTML = "";

    const board = appendElement("table", container, {
      classes: ["board"],
      id: "board",
    });

    appendRows(board);
  }

  function toggleEdge({ row, col, edge }) {
    const cellElem = document.getElementById(`cell-${row}-${col}`);
    if (!cellElem) throw new Error("Invalid row and col");

    const edgeElem = cellElem.querySelector(`.cell-edge.align-${edge}`);
    if (!edgeElem) throw new Error("Invalid edge");

    edgeElem.classList.toggle("selected");
  }

  function toggleCell({ row, col }) {
    const cellElem = document.getElementById(`cell-${row}-${col}`);
    if (!cellElem) throw new Error("Invalid row and col");

    cellElem.classList.toggle("selected");
  }

  validateBoardSize(options);
  insertBoard(container);

  return {
    toggleEdge,
    toggleCell,
  };
}

function createGame(options) {
  const adjList = new Map();

  function getCellIdx({ col, row }) {
    // cells outside of the range are all -1
    if (col < 0 || col >= options.cols) return -1;
    if (row < 0 || row >= options.rows) return -2;

    return row * options.cols + col;
  }

  function getCellPos(cellIdx) {
    const row = Math.floor(cellIdx / options.cols);
    const col = cellIdx % options.cols;
    return { row, col };
  }

  function initAdjList() {
    for (let row = 0; row < options.rows; row++) {
      for (let col = 0; col < options.cols; col++) {
        const cellIdx = getCellIdx({ row, col });

        adjList.set(
          cellIdx,
          new Set([
            getAdjCellIdx({ row, col }, "top"),
            getAdjCellIdx({ row, col }, "right"),
            getAdjCellIdx({ row, col }, "bottom"),
            getAdjCellIdx({ row, col }, "left"),
          ])
        );
      }
    }
  }

  function getAdjCellIdx({ col, row }, side) {
    switch (side) {
      case "top":
        return getCellIdx({ row: row - 1, col });
      case "right":
        return getCellIdx({ row, col: col + 1 });
      case "bottom":
        return getCellIdx({ row: row + 1, col });
      case "left":
        return getCellIdx({ row, col: col - 1 });
    }
  }

  function closeFromCell(cellIdx) {
    const visited = new Set();

    function dfs(cellIdx) {
      if (visited.has(cellIdx)) return true;

      visited.add(cellIdx);
      const adjs = adjList.get(cellIdx);
      if (adjs.size === 0) return true;
      if (adjs.has(-1)) return false;
      if (adjs.has(-2)) return false;

      for (const adj of adjs) {
        const canClose = dfs(adj);
        if (!canClose) return false;
      }

      return true;
    }

    const canClose = dfs(cellIdx);
    if (!canClose) return [];

    return visited;
  }

  function selectEdge({ col, row, edge }) {
    const cellIdx = getCellIdx({ col, row });
    const adjCellIdx = getAdjCellIdx({ col, row }, edge);

    const closedCells = [];
    if (cellIdx > 0) {
      adjList.get(cellIdx).delete(adjCellIdx);

      const cells = closeFromCell(cellIdx);
      for (const cellIdx of cells) {
        closedCells.push(getCellPos(cellIdx));
      }
    }

    if (adjCellIdx > 0) {
      adjList.get(adjCellIdx).delete(cellIdx);

      const cells = closeFromCell(adjCellIdx);
      for (const cellIdx of cells) {
        closedCells.push(getCellPos(cellIdx));
      }
    }

    return closedCells;
  }

  validateBoardSize(options);
  initAdjList(options);

  return { selectEdge };
}

(function run() {
  const rows = 5;
  const cols = 5;
  const app = document.getElementById("app");

  const { selectEdge } = createGame({ cols, rows });
  const { toggleEdge, toggleCell } = createBoard(app, {
    cols,
    rows,
    onEdgeSelect: (cellEdge) => {
      const closedCells = selectEdge(cellEdge);
      toggleEdge(cellEdge);

      for (const closedCell of closedCells) {
        toggleCell(closedCell);
      }
    },
  });
})();
