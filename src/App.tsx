import { useCallback, useState, useRef } from "react";
import { produce } from "immer";
import "./App.css";

const numRows = 45;
const numCols = 50;

const ops = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];

const genEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
};

function App() {
  const genRandomGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(
        Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
      );
    }
    setGrid(rows);
    // return rows;
  };
  const [running, setRunning] = useState<boolean>(false);
  const runningRef = useRef(running);
  runningRef.current = running;

  const [grid, setGrid] = useState<number[][]>(() => {
    return genEmptyGrid();
  });

  const runSim = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            let neighbors = 0;
            ops.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;
              if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
                neighbors += g[newI][newJ];
              }
            });
            // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
            // Any live cell with two or three live neighbours lives on to the next generation.
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][j] = 0;
              // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
              // Any live cell with more than three live neighbours dies, as if by overpopulation.
            } else if (g[i][j] === 0 && neighbors === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      });
    });
    setTimeout(runSim, 50);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          setRunning((prev) => !prev);
          if (!running) {
            runningRef.current = true;
            runSim();
          } else {
            runningRef.current = false;
          }
        }}
      >
        {running ? "Stop" : "Start"}
      </button>

      <button
        onClick={() => {
          setGrid(genEmptyGrid());
        }}
      >
        Clear
      </button>
      <button
        onClick={() => {
          genRandomGrid();
        }}
      >
        Random
      </button>
      <div
        className="game-container"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 20px)`,
        }}
      >
        {grid.map((rows, i) =>
          rows.map((_col, k) => {
            return (
              <div
                key={`${i}-${k}`}
                onClick={() => {
                  const newGrid = produce(grid, (gridCopy) => {
                    gridCopy[i][k] = grid[i][k] ? 0 : 1;
                  });
                  setGrid(newGrid);
                }}
                className="cell"
                style={{ backgroundColor: grid[i][k] ? "red" : undefined }}
              />
            );
          })
        )}
      </div>
    </>
  );
}

export default App;
