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

function createBoard(container, options) {
  function validateBoardSize(boardSize) {
    if (boardSize?.width < MIN_BOARD_WIDTH)
      throw new Error(`Grid width must be at least ${MIN_BOARD_WIDTH}`);

    if (boardSize?.height < MIN_BOARD_HEIGHT)
      throw new Error(`Grid height must be at least ${MIN_BOARD_HEIGHT}`);
  }

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
  // TODO: implement the game
}

(function run() {
  const rows = 5;
  const cols = 5;
  const app = document.getElementById("app");

  const { toggleEdge } = createBoard(app, {
    cols,
    rows,
    onEdgeSelect: ({ row, col, edge }) => {
      toggleEdge({ row, col, edge });
    },
  });
})();
