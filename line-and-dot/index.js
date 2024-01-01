const MIN_BOARD_WIDTH = 2;
const MIN_BOARD_HEIGHT = 2;
const DOT_QUARTERS_PER_CELL = 4;
const DOT_SIZE_PX = 8;

function appendElement(type, parent, { classes, id, cssVars } = {}) {
  const element = document.createElement(type);

  if (classes) {
    for (const className of classes) {
      element.classList.add(className);
    }
  }

  if (id) element.setAttribute("id", id);

  if (cssVars) {
    for (const [cssVarKey, cssVarValue] of Object.entries(cssVars)) {
      element.style.setProperty(cssVarKey, cssVarValue);
    }
  }

  parent.appendChild(element);
  return element;
}

function createBoard(container, boardSize) {
  function validateBoardSize(boardSize) {
    if (boardSize?.width < MIN_BOARD_WIDTH)
      throw new Error(`Grid width must be at least ${MIN_BOARD_WIDTH}`);

    if (boardSize?.height < MIN_BOARD_HEIGHT)
      throw new Error(`Grid height must be at least ${MIN_BOARD_HEIGHT}`);
  }

  function appendCellDots(cell, rowIdx, colIdx) {
    for (let dotIdx = 0; dotIdx < DOT_QUARTERS_PER_CELL; dotIdx++) {
      appendElement("div", cell, {
        classes: ["cell-dot"],
        cssVars: { "--dot-size": `${DOT_SIZE_PX}px` },
      });

      const isLastCol = colIdx === boardSize.width - 1;
      const isLastRow = rowIdx === boardSize.height - 1;

      if (isLastCol && isLastRow) {
        appendElement("div", cell, {
          classes: ["cell-dot", "align-right", "align-bottom"],
          cssVars: { "--dot-size": `${DOT_SIZE_PX}px` },
        });
      }

      if (isLastCol) {
        appendElement("div", cell, {
          classes: ["cell-dot", "align-right"],
          cssVars: { "--dot-size": `${DOT_SIZE_PX}px` },
        });
      }

      if (isLastRow) {
        appendElement("div", cell, {
          classes: ["cell-dot", "align-bottom"],
          cssVars: { "--dot-size": `${DOT_SIZE_PX}px` },
        });
      }
    }
  }

  function appendCells(row, rowIdx) {
    for (let colIdx = 0; colIdx < boardSize.width; colIdx++) {
      const cell = appendElement("td", row, {
        classes: ["cell"],
        id: `cell-${rowIdx}-${colIdx}`,
      });

      const cellSpacer = appendElement("div", cell, {
        classes: ["cell-spacer"],
      });

      appendCellDots(cellSpacer, rowIdx, colIdx);
    }
  }

  function appendRows(container) {
    for (let rowIdx = 0; rowIdx < boardSize.height; rowIdx++) {
      const row = appendElement("tr", container, {
        classes: ["board-row"],
      });

      appendCells(row, rowIdx);
    }
  }

  function createBoard(container) {
    container.innerHTML = "";

    const board = appendElement("table", container, {
      classes: ["board"],
      id: "board",
    });

    appendRows(board);
  }

  validateBoardSize(boardSize);
  createBoard(container);
}

(function run() {
  const app = document.getElementById("app");

  createBoard(app, {
    width: 20,
    height: 10,
  });
})();
