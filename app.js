const cell1 = document.querySelector(".cell-1");
const cell2 = document.querySelector(".cell-2");
const cell3 = document.querySelector(".cell-3");
const cell4 = document.querySelector(".cell-4");
const cell5 = document.querySelector(".cell-5");
const cell6 = document.querySelector(".cell-6");
const cell7 = document.querySelector(".cell-7");
const cell8 = document.querySelector(".cell-8");
const cell9 = document.querySelector(".cell-9");

const fnSelect = document.getElementById("fns");

/*
SOLUCIONABLES 
[1, 2, 0],
[4, 5, 3],
[7, 8, 6],

[1, 2, 3],
[4, 0, 6],
[7, 5, 8],

[1, 2, 3],
[4, 5, 6],
[0, 7, 8],


[1, 2, 3],
[0, 5, 6],
[4, 7, 8],


[1, 2, 3],
[0, 4, 6],
[7, 5, 8],

// NO 
[2, 8, 3],
[1, 6, 4],
[7, 0, 5],

*/

let initialState = [
  [1, 2, 3],
  [0, 4, 6],
  [7, 5, 8],
];

const finalState = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

// Cuántos NO están en su lugar
const fn1 = (value, state3) => {
  const initPosition = getInitialPosition(state3);
  const possibleMove = searchPosition(value, state3);

  const newTemporalState = exchangeValues(initPosition, possibleMove, state3);
  let heuristic = 0;
  let len = newTemporalState[0].length - 1;
  for (let col = 0; col <= len; col++) {
    for (let row = 0; row <= len; row++) {
      const isZero = newTemporalState[col][row] === 0;
      const isTempNumberEqualsToFinal =
        newTemporalState[col][row] !== finalState[col][row];

      if (isTempNumberEqualsToFinal && !isZero) {
        heuristic += 1;
      }
    }
  }

  return heuristic;
};

// Distancias
const fn2 = (value, state3) => {
  const initPosition = getInitialPosition(state3);
  const possibleMove = searchPosition(value, state3);

  const newTemporalState = exchangeValues(initPosition, possibleMove, state3);
  let heuristic = 0;

  let len = newTemporalState[0].length - 1;
  for (let col = 0; col <= len; col++) {
    for (let row = 0; row <= len; row++) {
      const isZero = newTemporalState[col][row] === 0;
      if (!isZero) {
        const rightValue = finalState[col][row];
        const destPosition = searchPosition(rightValue, state3);
        const distance = getDistanceBetweenTwoPoints(
          destPosition.row,
          row,
          destPosition.col,
          col
        );

        heuristic += distance;
      }
    }
  }

  return heuristic;
};

const getDistanceBetweenTwoPoints = (x2, x1, y2, y1) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return distance;
};

const searchPosition = (value, state) => {
  let len = state[0].length - 1;

  for (let col = 0; col <= len; col++) {
    for (let row = 0; row <= len; row++) {
      if (state[col][row] === value) {
        return { row, col };
      }
    }
  }
  throw new Error("No fue encontrado :0");
};

const getInitialPosition = (state) => {
  return searchPosition(0, state);
};

const isFinalState = (state) => {
  const flatState = state.flat().toString();
  const flatFinalState = finalState.flat().toString();
  return flatState === flatFinalState;
};

const getPossibleMoves = (position, state) => {
  // There are max 4 moves for step
  // There are min 2 moves for step
  // So, there's no need for cycles (: Just watch errors.

  const move1 = { row: position.row - 1, col: position.col }; // izquierda
  const move2 = { row: position.row, col: position.col - 1 }; // arriba
  const move3 = { row: position.row + 1, col: position.col }; // derecha
  const move4 = { row: position.row, col: position.col + 1 }; // abajo

  const moves = [move1, move2, move3, move4];

  const possibleMoves = moves.filter((move) => {
    try {
      if (state[move.row][move.col]) return move;
    } catch (error) {
      console.info("Movimiento no válido");
    }
  });

  return possibleMoves;
};

function sortByheuristic(arr) {
  return arr.sort((a, b) => a.heuristic - b.heuristic);
}

const fnTypes = {
  F1: "F1",
  F2: "F2",
  BOTH: "Ambos",
};

const getBetterMove = (moves, state2) => {
  const xmoves = moves.map((move) => {
    const fnSelected = fnSelect.options[fnSelect.selectedIndex].value;
    let heuristic = 0;
    if (fnTypes.F1 === fnSelected || fnSelected === fnTypes.BOTH) {
      const _fn1 = fn1(state2[move.col][move.row], [...state2]);
      heuristic += _fn1;
    }
    if (fnSelected === fnTypes.F2 || fnSelected === fnTypes.BOTH) {
      const _fn2 = fn2(state2[move.col][move.row], [...state2]);
      heuristic += _fn2;
    }

    return { move, heuristic };
  });
  const orderedMoves = sortByheuristic(xmoves);
  return orderedMoves[0].move;
};

const exchangeValues = (initPosition, destination, state4) => {
  // here's the problem
  // [...array] doen't make a new copy of subArrays :( which means that if I change anything, the original array will be changed too
  const stateCopy = JSON.parse(JSON.stringify(state4));
  const init = parseInt(
    stateCopy[initPosition.col][initPosition.row].toString()
  );
  const dest = parseInt(stateCopy[destination.col][destination.row].toString());

  // position
  stateCopy[initPosition.col][initPosition.row] = dest;
  stateCopy[destination.col][destination.row] = init;

  return stateCopy;
};

// REMOVE LAS CHILD AND I'd be DONE, I THINK SO
const removeLastMove = (L1, move2, L2) => {
  console.log({ previousMove: move2 });
  const cleanMoves = L1.filter((move) => {
    isDifferent = move.col !== move2.col || move.row !== move2.row;

    if (isDifferent) {
      return move;
    }
  });

  return cleanMoves;
};

const solve = async (x, L1, L2) => {
  const currentZeroPosition = getInitialPosition([...x]);
  L2.push(currentZeroPosition);
  loadNumbersToHtml(x);

  if (isFinalState(x)) {
    console.log("FINAL-----------");
    return { L1, L2, x };
  } else {
    L1.push(...getPossibleMoves(currentZeroPosition, x));
    console.log({ moves: L1 });

    if (L2.at(-2)) {
      L1 = removeLastMove(L1, L2.at(-2), L2);
      console.log({ cleanMoves: L1 });
    } else {
      console.log({ cleanMovesFirst: L1 });
    }

    const betterMove = getBetterMove(L1, x);
    console.log({ betterMove });
    L1 = removeNodeFromList(betterMove.x, betterMove.y, L1);
    const newState = [...exchangeValues(currentZeroPosition, betterMove, x)];
    // await sleep(20000);
    await sleep(1000);
    console.log("-----------------------------------------------------------");
    return solve(newState, L1, L2);
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const removeNodeFromList = (x, y, array) => {
  return array.filter((item) => item.x !== x && item.y === y);
};

const loadNumbersToHtml = (array) => {
  cell1.textContent = array[0][0];
  if (array[0][0] === 0) {
    cell1.classList.add("zero");
  } else {
    cell1.classList.remove("zero");
  }

  cell2.textContent = array[0][1];
  if (array[0][1] === 0) {
    cell2.classList.add("zero");
  } else {
    cell2.classList.remove("zero");
  }

  cell3.textContent = array[0][2];
  if (array[0][2] === 0) {
    cell3.classList.add("zero");
  } else {
    cell3.classList.remove("zero");
  }

  cell4.textContent = array[1][0];
  if (array[1][0] === 0) {
    cell4.classList.add("zero");
  } else {
    cell4.classList.remove("zero");
  }

  cell5.textContent = array[1][1];
  if (array[1][1] === 0) {
    cell5.classList.add("zero");
  } else {
    cell5.classList.remove("zero");
  }

  cell6.textContent = array[1][2];
  if (array[1][2] === 0) {
    cell6.classList.add("zero");
  } else {
    cell6.classList.remove("zero");
  }

  cell7.textContent = array[2][0];
  if (array[2][0] === 0) {
    cell7.classList.add("zero");
  } else {
    cell7.classList.remove("zero");
  }

  cell8.textContent = array[2][1];
  if (array[2][1] === 0) {
    cell8.classList.add("zero");
  } else {
    cell8.classList.remove("zero");
  }

  cell9.textContent = array[2][2];
  if (array[2][2] === 0) {
    cell9.classList.add("zero");
  } else {
    cell9.classList.remove("zero");
  }
};

// solve(initialState, [], []);

const solveBtn = document.getElementById("solveBtn");
const shuffleBtn = document.getElementById("shuffleBtn");

loadNumbersToHtml(initialState);
solveBtn.addEventListener("click", () => {
  solve(initialState, [], []);
});

shuffleBtn.addEventListener("click", () => {
  initialState = getRandomPuzzle();
  loadNumbersToHtml(initialState);
});

const getRandomPuzzle = () => {
  const possiblePuzzles = [
    [
      [1, 2, 0],
      [4, 5, 3],
      [7, 8, 6],
    ],
    [
      [1, 2, 3],
      [4, 0, 6],
      [7, 5, 8],
    ],
    [
      [1, 2, 3],
      [4, 5, 6],
      [0, 7, 8],
    ],
    [
      [1, 2, 3],
      [0, 5, 6],
      [4, 7, 8],
    ],
    [
      [1, 2, 3],
      [0, 4, 6],
      [7, 5, 8],
    ],
  ];
  return possiblePuzzles[Math.floor(Math.random() * possiblePuzzles.length)];
};
