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