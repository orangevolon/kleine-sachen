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

    const isLastCol = colIdx === options.width - 2;
    const isLastRow = rowIdx === options.height - 2;

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

    const isLastCol = colIdx === options.width - 2;
    const isLastRow = rowIdx === options.height - 2;

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
    for (let colIdx = 0; colIdx < options.width - 1; colIdx++) {
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
    for (let rowIdx = 0; rowIdx < options.height - 1; rowIdx++) {
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

  validateBoardSize(options);
  insertBoard(container);
}

function createGame(options) {
  const graph = new Map();

  function addNodes() {
    for (let rowIdx = 0; rowIdx < options.height; rowIdx++) {
      for (let colIdx = 0; colIdx < options.width; colIdx++) {
        const nodeIdx = rowIdx * options.width + colIdx;
        graph.set(nodeIdx, {
          edges: [],
        });
      }
    }
  }

  function checkForCycle({ startIdx, endIdx }) {
    const visitedNodes = new Set();

    // DFS for finding cycle
    function traverse(nodeIdx) {
      // Last edge
      if (!nodeIdx) return false;

      // Existing cycle
      if (visitedNodes.has(nodeIdx)) return false;

      // New cycle
      if (nodeIdx === startIdx) return true;

      const node = graph.get(nodeIdx);
      visitedNodes.add(nodeIdx);
      for (const edge of node.edges) {
        const doesEdgeLeadToCycle = traverse(edge);
        if (doesEdgeLeadToCycle) return true;
      }

      return false;
    }

    return traverse(endIdx);
  }

  function selectEdge({ start, end }) {
    const startIdx = start.y * options.width + start.x;
    const endIdx = end.y * options.width + end.x;

    const hasCycle = checkForCycle({ startIdx, endIdx });
    if (hasCycle) {
      console.log("Cycle detected!");
    }

    graph.get(startIdx).edges.push(endIdx);
    graph.get(endIdx).edges.push(startIdx);
  }

  addNodes();

  return {
    selectEdge,
  };
}

(function run() {
  const width = 20;
  const height = 10;
  const app = document.getElementById("app");

  const { selectEdge } = createGame({
    width,
    height,
  });

  createBoard(app, {
    width,
    height,
    onLineSelect: selectEdge,
  });
})();
