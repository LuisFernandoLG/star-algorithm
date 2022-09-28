
const cell1 = document.querySelector(".cell-1");
const cell2 = document.querySelector(".cell-2");
const cell3 = document.querySelector(".cell-3");
const cell4 = document.querySelector(".cell-4");
const cell5 = document.querySelector(".cell-5");
const cell6 = document.querySelector(".cell-6");
const cell7 = document.querySelector(".cell-7");
const cell8 = document.querySelector(".cell-8");
const cell9 = document.querySelector(".cell-9");

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

[1, 2, 5],
[3, 4, 0],
[6, 7, 8],

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

const heuricticTypes = {
  F1: "F1",
  F2: "F1",
  BOTH: "BOTH",
};

const finalState = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

class StarAlgorithm {
  constructor(heuricticType, initState) {
    this.L1 = []; // list
    this.L2 = []; // list
    this.lastMove = null; // {x, y}
    this.betterMove = null;
    this.state = initState; // matrix
    this.size = 2; // 3x3 starts from 0
    this.finalState = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 0],
    ];
    this.heuristicType = heuricticType;
  }

  sortL1ByHeuristicValues() {
    return this.L1.sort((a, b) => a.heuristic - b.heuristic);
  }

  searchValueByMove(x, y) {
    this.forEachCell(({ value, p = position }) => {
      const isSamePosition = p.x === x && p.y === y;
      if (isSamePosition) return value;
    });
  }

  searchPositionByValue(_value) {
    let pos = null;
    this.forEachCell(({ value, position }) => {
      const isSameValue = value === _value;
      if (isSameValue) {
        pos = position;
      }
    });

    if (pos) return pos;

    throw new Error("No encontrado :0 ");
  }

  
  searchPositionInFinalStateByValue(_value) {
    let pos = null;
    this.forEachCellWithOwnArray(this.finalState, ({ value, position }) => {
      const isSameValue = value === _value;
      if (isSameValue) {
        pos = position;
      }
    });

    if (pos) return pos;

    throw new Error("No encontrado :0 ");
  }

  

  forEachCellWithOwnArray(array, callback) {
    const x = array || this.state;
    const stateCopy = JSON.parse(JSON.stringify(x));
    for (let col = 0; col <= this.size; col++) {
      for (let row = 0; row <= this.size; row++) {
        const value = stateCopy[col][row];
        const isZero = value === 0;
        if (!isZero) {
          callback({ value, position: { x: row, y: col } });
        }
      }
    }
  }

  forEachCell(callback) {
    const stateCopy = JSON.parse(JSON.stringify(this.state));
    for (let col = 0; col <= this.size; col++) {
      for (let row = 0; row <= this.size; row++) {
        const value = stateCopy[col][row];
        const isZero = value === 0;
        if (!isZero) {
          callback({ value, position: { x: row, y: col } });
        }
      }
    }
  }

  getZeroPosition() {
    const stateCopy = JSON.parse(JSON.stringify(this.state));
    for (let col = 0; col <= this.size; col++) {
      for (let row = 0; row <= this.size; row++) {
        const value = stateCopy[col][row];
        const isZero = value === 0;
        if (isZero) {
          return { x: row, y: col };
        }
      }
    }
  }

  getDistanceBetweenTwoPoints(x2, x1, y2, y1) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance;
  }

  getPossibleMoves(position) {
    // There are max 4 moves for step
    // There are min 2 moves for step
    // So, there's no need for cycles (: Just watch errors.

    const move1 = { x: position.x - 1, y: position.y }; // izquierda
    const move2 = { x: position.x, y: position.y - 1 }; // arriba
    const move3 = { x: position.x + 1, y: position.y }; // derecha
    const move4 = { x: position.x, y: position.y + 1 }; // abajo

    const moves = [move1, move2, move3, move4];

    // Clear of invalid moves like [3][1] which is out of range jeje
    const validMoves = moves.filter((move) => {
      try {
        if (this.state[move.y][move.x]) return move;
      } catch (error) {
        console.info("Movimiento no válido");
      }
    });

    return validMoves;
  }

  isFinalState() {
    // Both are converted to string, so they can be compared as normal strings (:
    const flatState = this.state.flat().toString();
    const flatFinalState = finalState.flat().toString();
    return flatState === flatFinalState;
  }

  getBetterMove() {
    this.L1 = this.L1.map((move) => {
      let heuristic = 0;
      if (
        this.heuristicType === heuricticTypes.F1 ||
        this.heuristicType === heuricticTypes.BOTH
      ) {
        const _fn1 = this.getF1ByPossibleMove(move);
        heuristic += _fn1;
      }
      if (
        this.heuristicType === heuricticTypes.F2 ||
        this.heuristicType === heuricticTypes.BOTH
      ) {
        const _fn2 = this.getF2ByPossibleMove(move);
        heuristic += _fn2;
      }

      return { move, heuristic };
    });

    this.sortL1ByHeuristicValues();
    return this.L1[0];
  }

  getTemporalStateWithExchangedValues(initPosition, destPosition) {
    // here's the problem
    // [...array] doen't make a new copy of subArrays :( which means that if I change anything, the original array will be changed too
    const copyState = JSON.parse(JSON.stringify(this.state));

    const initValue = parseInt(
      copyState[initPosition.y][initPosition.x].toString()
    );
    const destValue = parseInt(
      copyState[destPosition.y][destPosition.x].toString()
    );

    // position
    copyState[initPosition.y][initPosition.x] = initValue;
    copyState[destPosition.y][destPosition.x] = destValue;

    return copyState;
  }

  // REMOVE LAS CHILD AND I'd be DONE, I THINK SO
  // moves are calculated again, so I've got to remove the previous position
  removeLastMoveFromL1() {
    let cleanMoves = [];
    this.forEachCell(({ value, position }) => {
      const isDifferent =
        position.y !== this.lastMove.move.y ||
        position.x !== this.lastMove.move.x;
      if (isDifferent) {
        cleanMoves.push(position);
      }
    });

    this.L1 = cleanMoves;
  }

  getF1ByPossibleMove = (possibleMove) => {
    const zeroPosition = this.getZeroPosition();
    const newTemporalState = this.getTemporalStateWithExchangedValues(
      zeroPosition,
      possibleMove
    );

    let heuristic = 0;
    this.forEachCellWithOwnArray(
      newTemporalState,
      ({ value, position }) => {
        const isZero = newTemporalState[position.y][position.x] === 0;
        const isTempNumberEqualsToFinal =
          newTemporalState[position.y][position.x] !==
          finalState[position.y][position.x];
        if (isTempNumberEqualsToFinal && !isZero) {
          heuristic += 1;
        }
      },
      newTemporalState
    );

    return heuristic;
  };

  getF2ByPossibleMove(possibleMove) {
    const zeroPosition = this.getZeroPosition();

    const newTemporalState = this.getTemporalStateWithExchangedValues(
      zeroPosition,
      possibleMove
    );

    let heuristic = 0;

    this.forEachCellWithOwnArray(
      newTemporalState,
      ({ value, position }) => {
        const isZero = newTemporalState[position.y][position.x] === 0;
        if (!isZero) {
          const rightPosition = this.searchPositionInFinalStateByValue(value);
          const currentPosition = this.searchPositionByValue(value);

          const distance = this.getDistanceBetweenTwoPoints(
            rightPosition.x,
            currentPosition.x,
            rightPosition.y,
            currentPosition.y
          );

          heuristic += distance;
        }
      },
      newTemporalState
    );


    return heuristic;
  }

  removeMoveFromL1ByPosition = (move) => {
    this.L1 = this.L1.filter((item) => {
      console.log({ITEM:item.move, move})
      if(item.move.x !== move.x || item.move.y === move.y){
        console.log("devolviendo")
        return item
      }
    });
  
  };

  solve() {
    const x = async () => {
      let hasFinished = false;
      while (!hasFinished) {
        const currentZeroPosition = this.getZeroPosition();
        this.L2.push(currentZeroPosition);
        loadNumbersToHtml(this.state);

        if (this.isFinalState()) {
          console.log("FINAL-----------");
          hasFinished = true;
          return { L1: this.L1, L2: this.L2, state: this.state };
        } else {
          const possibleMoves = this.getPossibleMoves(currentZeroPosition);
          this.L1 = [...possibleMoves, ...this.L1];

          // console.l
          if (this.lastMove) {
            // It can go back to the previous move
            this.removeLastMoveFromL1();
          }
          console.log({L1:this.L1})

          this.lastMove = this.getBetterMove();
          this.removeMoveFromL1ByPosition(this.lastMove.move);

          this.state = this.getTemporalStateWithExchangedValues(
            currentZeroPosition,
            this.lastMove.move
          );
          console.log({L1:this.L1})
          console.log({ move: this.lastMove });
          console.log({ x: this.state });

          console.log("finish");
          await sleep(2000);
        }
      }
    };

    x();
  }
}


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
  shuffleNumbers();
});

const shuffleNumbers = () => {
  initialState[0] = shuffledArray(initialState[0]);

  initialState[1] = shuffledArray(initialState[1]);
  initialState[2] = shuffledArray(initialState[2]);

  loadNumbersToHtml(initialState);
};

const shuffledArray = (array) => {
  return array.sort((a, b) => 0.5 - Math.random());
};

const initMatrix = initialState;
let starAlgorithm = new StarAlgorithm(heuricticTypes.BOTH, initMatrix);

starAlgorithm.solve();
