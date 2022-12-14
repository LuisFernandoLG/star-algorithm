// {
//   state : [[123],[456],[780]],
//   heuristic: 20,
//   zeroPosition : {x2:y:2},
//   ParentState: null or [[123],[456],[780]]
// }

const $Hlist = document.querySelector(".list");
const $L2 = document.querySelector(".L2");
const $iterations = document.querySelector(".iterations");
const $array = document.querySelector(".array");
const $fnSelector = document.getElementById("fns");

const addHeuristicToHTML = (L1) => {
  let x = [];
  L1.forEach((item) => {
    x.push(item.heuristic);
  });

  $Hlist.innerHTML = x.toString();
};

const addL2ToHTML = (L2) => {
  let x = "";
  L2.forEach((item) => {
    x += `<p>${item.state}</p> <br>`;
  });

  $Hlist.innerHTML = x;
};

const hTypes = {
  F1: "F1",
  F2: "F2",
  BOTH: "BOTH",
};

class Star {
  constructor(initArray, finalArray, hType) {
    this.finalArray = finalArray;
    this.size = 2;
    this.currentState = this.formatState(initArray);
    this.finalState = this.formatState(finalArray);
    this.L1 = [this.currentState]; //Lista abierta
    this.L2 = []; //Lista cerrada
    this.hType = hType || hTypes.BOTH;
  }

  // isIn;

  formatState(state, _parentState) {
    const zeroPosition = this.searchPosition(state, 0);
    const heuristicMissedTales = this.fn1({ state });
    const heuristicManhattan = this.fn2({ state });

    let heuristic = 0
    if(this.hType === hTypes.F1) heuristic = heuristicMissedTales
    if(this.hType === hTypes.F2) heuristic = heuristicManhattan
    if(this.hType === hTypes.BOTH) heuristic = heuristicManhattan + heuristicMissedTales;

    // console.log({ heuristicManhattan, heuristicMissedTales });
    const parentState = _parentState;
    return {
      state,
      heuristic,
      zeroPosition,
      parentState,
      parentNode: null || this.currentState,
    };
  }

  searchPositionByValue(state, _value) {
    let _position = {};
    this.forEachCell(state, ({ value, position }) => {
      if (_value === value) _position = position;
    });

    return _position;
  }

  fn2(possibleState) {
    let heuristic = 0;

    this.forEachCell(possibleState.state, ({ value, position }) => {
      const isZero = value === 0;
      if (!isZero) {
        const rightPosition = this.searchPosition(this.finalArray, value);

        const distance = this.getDistanceBetweenTwoPoints(
          rightPosition.x,
          position.x,
          rightPosition.y,
          position.y
        );

        heuristic += distance;
      }
    });

    return heuristic;
  }

  getDistanceBetweenTwoPoints(x2, x1, y2, y1) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    // const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);

    return distance;
  }

  isL1Empty() {
    return this.L1.length === 0;
  }

  forEachCell(state, callback) {
    const stateCopy = JSON.parse(JSON.stringify(state));

    // this.size wasn't defined yet
    for (let y = 0; y <= this.size; y++) {
      for (let x = 0; x <= this.size; x++) {
        const value = stateCopy[y][x];
        const position = { x, y };
        callback({ value, position });
      }
    }
  }

  searchPosition(state, _value) {
    let positionFound = {};
    this.forEachCell(state, ({ value, position }) => {
      if (value === _value) {
        positionFound = position;
      }
    });
    return positionFound;
  }

  fn1(possibleState) {
    let heuristic = 0;

    this.forEachCell(possibleState.state, ({ value, position }) => {
      const isZero = value === 0;

      const isPositionOk = value === this.finalArray[position.y][position.x];
      // const isPositionOk = false;

      if (!isPositionOk && !isZero) {
        heuristic += 1;
      }
    });

    return heuristic;
  }

  generatePossibleMoves() {
    // There are max 4 moves for step
    // There are min 2 moves for step
    // So, there's no need for cycles (: Just watch errors.

    const move1 = {
      x: this.currentState.zeroPosition.x - 1,
      y: this.currentState.zeroPosition.y,
    }; // izquierda
    const move2 = {
      x: this.currentState.zeroPosition.x,
      y: this.currentState.zeroPosition.y - 1,
    }; // arriba
    const move3 = {
      x: this.currentState.zeroPosition.x + 1,
      y: this.currentState.zeroPosition.y,
    }; // derecha
    const move4 = {
      x: this.currentState.zeroPosition.x,
      y: this.currentState.zeroPosition.y + 1,
    }; // abajo

    // Obtengo los posibles estados en las 4 direcciones
    // Algunos de ellos se salen fuera del tablero
    // asi que los quito.
    const moves = [move1, move2, move3, move4];
    const validMoves = moves.filter((move) => {
      try {
        if (this.currentState.state[move.x][move.y]) return move;
      } catch (error) {
        // console.info("Movimiento no v??lido");
      }
    });

    const v = validMoves.map((move) => {
      return this.generateStateByMove(move);
    });
    return v;
  }

  generateStateByMove(destPosition) {
    // here's the problem
    // [...array] doen't make a new copy of subArrays :( which means that if I change anything, the original array will be changed too
    const copyState = JSON.parse(JSON.stringify(this.currentState.state));

    const initValue = parseInt(
      copyState[this.currentState.zeroPosition.y][
        this.currentState.zeroPosition.x
      ].toString()
    );

    const destValue = parseInt(
      copyState[destPosition.y][destPosition.x].toString()
    );

    // position
    copyState[this.currentState.zeroPosition.y][
      this.currentState.zeroPosition.x
    ] = destValue;

    copyState[destPosition.y][destPosition.x] = initValue;
    const newState = this.formatState(copyState, this.currentState.state);
    return newState;
  }

  isLastNodeOfL2TheFinalState() {
    // Both are converted to string, so they can be compared as normal strings (:
    const flatState = this.L2.at(-1).state.flat().toString();
    const flatFinalState = this.finalState.state.toString();
    return flatState === flatFinalState;
  }

  orderL1ByHeuristic() {
    return this.L1.sort((a, b) => a.heuristic - b.heuristic);
  }

  isInL1(state) {
    const isInL1 = this.L1.some((item) => {
      if (
        item.state.flat().toString() === state.state.flat().toString() &&
        item.parentState.flat().toString() ===
          state.parentState.flat().toString()
      )
        return item;
    });
    return isInL1;
  }

  isInL2(state) {
    const isInL2 = this.L2.some((item) => {
      // console.log({item})
      const isSameState =
        item.state.flat().toString() === state.state.flat().toString();
      const isSameParentState = item?.parentState
        ? item.parentState.flat().toString() ===
          state.parentState.flat().toString()
        : false;

      return isSameState && isSameParentState;
    });
    // console.log(`is in L2 ? : ${isInL2}`);
    return isInL2;
  }

  removeLowestNodeOfL1() {
    this.L1 = this.L1.filter((item, index) => index > 0);
  }

  async solve(speed) {
    let hasFished = false;
    let iterations = 0;
    while (!hasFished) {
      // console.log({ LastNode: this.L2.at(-1) });
      iterations++;
      if (this.isL1Empty()) throw new Error("No hay nuevos movimientos");
      else {
        this.orderL1ByHeuristic();
        const lowestFnNode = this.L1.at(0);
        this.L2.push(lowestFnNode);
        this.currentState = lowestFnNode;

        // Load moves to HTML
        // loadNumbersToHtml(lowestFnNode.state);
        addHeuristicToHTML(this.L1);
        this.removeLowestNodeOfL1();

        // Remover node de L1 al pasarlo a L2
      }

      if (this.isLastNodeOfL2TheFinalState()) {
        console.log("Final state YES");
        hasFished = true;
        $iterations.innerHTML = iterations;

        const L2Copy = JSON.parse(JSON.stringify(this.L2));
        const reverseL2 = L2Copy.reverse();
        let path = generatePath(reverseL2.at(0));
        path = path.reverse();
        loadPathToHtml(path);
        break;
      }
      // Add posibles moves to L1, expandir L1
      const possibleStates = this.generatePossibleMoves();

      // Si el nuevo Estado no pertenece ni a L1 ni a L2
      // Etiquetar N como padre de n
      // Calcular F(n)
      // Insertar n en la lista abierta (L1)
      possibleStates.forEach((item) => {
        if (!this.isInL1(item) && !this.isInL2(item)) {
          // console.log("No est?? en ninguna");
          this.L1.push(item);
        } else if (this.isInL1(item) && !this.isInL2(item)) {
          // console.log("Actualizando");
          this.L1 = this.L1.map((L1item) => {
            // Nunna actualizo la heuristic que pedo
            // console.log(`${item.heuristic}  --- L1Item:${L1item.heuristic }`);

            // el error podr??a estar aqu??
            const isSameState =
              item.state.flat().toString() === L1item.state.flat().toString();
            const isSameParentState = item?.parentState
              ? item.parentState.flat().toString() ===
                L1item.parentState.flat().toString()
              : false;
            if (
              item.heuristic < L1item.heuristic &&
              isSameState &&
              isSameParentState
            ) {
              // console.log("Agregado");
              return item;
            } else {
              // console.log("NO agregado");
              return L1item;
            }
          });
        }
        //  else {
        //   this.L1.push(item);
        // }
      });

      // Si el nuevo nodo se encuentra ya en ambas lista, removerla de L1
      await sleep(speed * 1000);
      console.log(`---------------------------------------------------`);
      // Volver al paso 3
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let initialState = [
  // [6, 1, 8],
  // [2, 0, 7],
  // [4, 3, 5],

  // [6, 5, 4],
  // [2, 3, 1],
  // [0, 7, 8],

  [4, 1, 0],
  [8, 5, 3],
  [2, 7, 6],
];

const finalState = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

// --------------------- UI

const generatePath = (lastNode, path = []) => {
  path.push(lastNode);

  if (lastNode.parentState) {
    lastNode = lastNode.parentNode;
  } else {
    console.log({ path });
    return path;
  }

  return generatePath(lastNode, path);
};

const solveBtn = document.getElementById("solveBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const $restartBtn = document.getElementById("restartBtn");

$restartBtn.addEventListener("click", ()=>{
  loadNumbersToHtml(initialState)
})

addEventListener("DOMContentLoaded", () => {
  loadNumbersToHtml(initialState);
  loadArray();
});

const loadArray = () => {
  $array.innerHTML = initialState.flat().join("");
};

solveBtn.addEventListener("click", () => {
  console.log({ initialState });
  const fnOption = $fnSelector.options[$fnSelector.selectedIndex].value;
  const star = new Star(initialState, finalState, fnOption);
  const speed = 0 // speed of iterations
  star.solve(0);
});

shuffleBtn.addEventListener("click", () => {
  initialState = getRandomPuzzle();
  loadNumbersToHtml(initialState);
  loadArray();
});

const getRandomPuzzle = () => {
  let list = [1, 2, 3, 4, 5, 6, 7, 8, 0].sort(() => Math.random() - 0.5);
  let cell1 = list[0];
  let cell2 = list[1];
  let cell3 = list[2];
  let cell4 = list[3];
  let cell5 = list[4];
  let cell6 = list[5];
  let cell7 = list[6];
  let cell8 = list[7];
  let cell9 = list[8];

  let column1 = [cell1, cell2, cell3];
  let column2 = [cell4, cell5, cell6];
  let column3 = [cell7, cell8, cell9];

  return [column1, column2, column3];
};

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

const loadNumbersToHtml = (array) => {
  cell1.textContent = array[0][0];
  if (array[0][0] === 0) {
    cell1.classList.add(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  } else {
    cell1.classList.remove(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  }

  cell2.textContent = array[0][1];
  if (array[0][1] === 0) {
    cell2.classList.add(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  } else {
    cell2.classList.remove(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  }

  cell3.textContent = array[0][2];
  if (array[0][2] === 0) {
    cell3.classList.add(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  } else {
    cell3.classList.remove(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  }

  cell4.textContent = array[1][0];
  if (array[1][0] === 0) {
    cell4.classList.add(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  } else {
    cell4.classList.remove(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  }

  cell5.textContent = array[1][1];
  if (array[1][1] === 0) {
    cell5.classList.add(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  } else {
    cell5.classList.remove(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  }

  cell6.textContent = array[1][2];
  if (array[1][2] === 0) {
    cell6.classList.add(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  } else {
    cell6.classList.remove(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  }

  cell7.textContent = array[2][0];
  if (array[2][0] === 0) {
    cell7.classList.add(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  } else {
    cell7.classList.remove(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  }

  cell8.textContent = array[2][1];
  if (array[2][1] === 0) {
    cell8.classList.add(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  } else {
    cell8.classList.remove(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  }

  cell9.textContent = array[2][2];
  if (array[2][2] === 0) {
    cell9.classList.add(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  } else {
    cell9.classList.remove(...["hover:text-gray-700", "bg-gray-50", "cursor-pointer"]);
  }
};

/**
 * 
 
 // IMPOSIBLES?
 [0, 2, 3],
 [4, 5, 6],
 [7, 8, 1],
 
 */
const loadPathToHtml = async (path) => {
  const stepSpeed = 1000
  for (let index = 0; index < path.length; index++) {
    const element = path[index];
    loadNumbersToHtml(element.state);
    await sleep(stepSpeed);
  }
};
