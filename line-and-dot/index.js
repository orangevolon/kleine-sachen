const MIN_BOARD_WIDTH = 2;
const MIN_BOARD_HEIGHT = 2;
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

  function appendCellEdges(cell, rowIdx, colIdx) {
    const cssVars = { "--edge-thickness": `${EDGE_THICKNESS}px` };

    const isLastCol = colIdx === options.width - 1;
    const isLastRow = rowIdx === options.height - 1;

    function createClickHandler(side) {
      function getLinePos() {
        switch (side) {
          case "left":
            return {
              start: { x: colIdx, y: rowIdx },
              end: { x: colIdx, y: rowIdx + 1 },
            };
          case "right":
            return {
              start: { x: colIdx + 1, y: rowIdx },
              end: { x: colIdx + 1, y: rowIdx + 1 },
            };
          case "top":
            return {
              start: { x: colIdx, y: rowIdx },
              end: { x: colIdx + 1, y: rowIdx },
            };
          case "bottom":
            return {
              start: { x: colIdx, y: rowIdx + 1 },
              end: { x: colIdx + 1, y: rowIdx + 1 },
            };
        }
      }

      return function handleClick(event) {
        const linePos = getLinePos();
        options?.onLineSelect?.(linePos);
        event.target.classList.add("selected");
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

    const isLastCol = colIdx === options.width - 1;
    const isLastRow = rowIdx === options.height - 1;

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
    for (let colIdx = 0; colIdx < options.width; colIdx++) {
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
    for (let rowIdx = 0; rowIdx < options.height; rowIdx++) {
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

  validateBoardSize(options);
  createBoard(container);
}

(function run() {
  const app = document.getElementById("app");

  function onLineSelect({ start, end }) {
    console.log("Line selected", { start, end });
  }

  createBoard(app, {
    width: 20,
    height: 10,
    onLineSelect,
  });
})();
