
// ----------------------------
// CONFIGURATION
// ----------------------------
const ROWS = 6;
const COLS = 8;

// ----------------------------
// GAME STATE
// ----------------------------
let currentRow = 0;
let currentCol = 0;

let puzzles = [];
let currentPuzzle = [];

// ----------------------------
// DOM REFERENCES
// ----------------------------
const rows = document.querySelectorAll(".row");

// ----------------------------
// ALLOWED SYMBOLS
// ----------------------------
const allowedSymbols = [
  "∀","∃",":",
  "x","y","z",
  "∈","ℝ","ℕ",
  "=","<",">","≤","≥","≠",
  "0","1","2","3","4","5","6","7","8","9"
];

const EASY_GRAMMAR = [
  ["∀", "∃"],          // 1 quantifier
  ["x", "y", "z"],     // 2 bound variable
  ["∈ℝ", "∈ℕ"],       // 3 membership
  [":"],               // 4 separator
  ["x", "y", "z", "0","1","2","3","4","5","6","7","8","9"], // 5 value
  ["=", "<", ">", "≤", "≥", "≠"], // 6 relation
  ["x", "y", "z", "0","1","2","3","4","5","6","7","8","9"]  // 7 value
];

// ----------------------------
// EASY MODE VALIDATION
// ----------------------------
function validateEasyRow(row) {
  // row: array of 7 strings, from DOM cells
  // positions: 0=quantifier, 1=bound variable, 2=membership, 3=:, 4=value, 5=relation, 6=value

  // Check that all cells are filled
  if (row.includes("") || row.length !== 7) {
    return { valid: false, message: "Complete the entire statement before submitting." };
  }

  // Allowed symbols per position
  const allowed = [
    ["∀", "∃"],                        // 0 quantifier
    ["x", "y", "z"],                    // 1 bound variable
    ["∈ℕ", "∈ℝ"],                       // 2 membership
    [":"],                               // 3 separator
    ["0","1","2","3","4","5","6","7","8","9","x","y","z"], // 4 value
    ["=", "<", ">", "≤", "≥", "≠"],     // 5 relation
    ["0","1","2","3","4","5","6","7","8","9","x","y","z"]  // 6 value
  ];

  // Check each position
  for (let i = 0; i < 7; i++) {
    if (!allowed[i].includes(row[i])) {
      return { valid: false, message: `Symbol '${row[i]}' is invalid in position ${i+1}.` };
    }
  }

  const boundVar = row[1];
  const left = row[4];
  const right = row[6];

  // helper functions
  const isDigit = s => "0123456789".includes(s);
  const isVar = s => ["x","y","z"].includes(s);

  // Exactly one variable and one digit between positions 4 & 6
  if ((isDigit(left) && isDigit(right)) || (isVar(left) && isVar(right))) {
    return { valid: false, message: "One side must be a number and the other must be the quantified variable." };
  }

  // Variable must match bound variable
  if ((isVar(left) && left !== boundVar) || (isVar(right) && right !== boundVar)) {
    return { valid: false, message: "The comparison must use the quantified variable." };
  }

  // Passed all checks
  return { valid: true };
}



// for error message box
function showMessage(text) {
  const box = document.getElementById("message-box");
  box.textContent = text;
  box.classList.remove("hidden");
}

function hideMessage() {
  const box = document.getElementById("message-box");
  box.classList.add("hidden");
}


// ----------------------------
// LOAD PUZZLES
// ----------------------------
fetch("puzzles.json")
  .then(res => res.json())
  .then(data => {
    puzzles = data;
    pickRandomPuzzle();
  });

function pickRandomPuzzle() {
  const i = Math.floor(Math.random() * puzzles.length);
  currentPuzzle = puzzles[i];
  console.log("Puzzle:", currentPuzzle); // for debugging
}

// ----------------------------
// INSERT / DELETE
// ----------------------------
function insertSymbol(symbol) {
  if (currentCol >= COLS) return;
  const cell = rows[currentRow].children[currentCol];
  cell.textContent = symbol;
  currentCol++;
}

function deleteLast() {
  if (currentCol === 0) return;
  currentCol--;
  const cell = rows[currentRow].children[currentCol];
  cell.textContent = "";
}

// ----------------------------
// SYNTAX VALIDATION
// ----------------------------
function isValidStatement(symbols) {
  /*
    Required format (8 symbols):

    0: ∀ or ∃
    1: x y z
    2: ∈
    3: ℝ or ℕ
    4: :
    5: x y z
    6: relation (= < > ≤ ≥ ≠)
    7: digit
  */

  if (!["∀","∃"].includes(symbols[0])) return false;
  if (!["x","y","z"].includes(symbols[1])) return false;
  if (symbols[2] !== "∈") return false;
  if (!["ℝ","ℕ"].includes(symbols[3])) return false;
  if (symbols[4] !== ":") return false;
  if (!["x","y","z"].includes(symbols[5])) return false;
  if (!["=","<",">","≤","≥","≠"].includes(symbols[6])) return false;
  if (isNaN(parseInt(symbols[7]))) return false;

  return true;
}

// ----------------------------
// SUBMIT ROW
// ----------------------------
function submitRow() {
  const rows = document.querySelectorAll(".row");
  const currentRowEl = rows[currentRowIndex];
  const cells = currentRowEl.querySelectorAll(".cell");

  const row = Array.from(cells).map(cell => cell.textContent.trim());

  const result = validateEasyRow(row);

  if (!result.valid) {
    currentRowEl.classList.add("invalid");
    showMessage(result.message);
    return; // stop submission
  }

  // ✅ Valid row → continue game logic
  advanceRow();
}


  // Wordle-style feedback
  for (let i = 0; i < COLS; i++) {
    if (guess[i] === currentPuzzle[i]) {
      cells[i].classList.add("correct");
    } else if (currentPuzzle.includes(guess[i])) {
      cells[i].classList.add("present");
    } else {
      cells[i].classList.add("absent");
    }
  }

  // Win check
  if (guess.join("") === currentPuzzle.join("")) {
    alert("You solved it!");
    return;
  }

  // Advance row
  currentRow++;
  currentCol = 0;

  if (currentRow >= ROWS) {
    alert("Out of guesses!");
    return;
  }
}

// ----------------------------
// ON-SCREEN KEYBOARD
// ----------------------------


document.querySelectorAll(".keyboard button").forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.textContent;
    if (value === "Delete") deleteLast();
    else if (value === "Submit") submitRow();
    else insertSymbol(value);
  });
});

// ----------------------------
// PHYSICAL KEYBOARD
// ----------------------------
document.addEventListener("keydown", e => {
  const k = e.key;
  let sym = null;

  switch (k) {
    case "a": sym = "∀"; break;
    case "e": sym = "∃"; break;
    case ":": sym = ":"; break;
    case "x": sym = "x"; break;
    case "y": sym = "y"; break;
    case "z": sym = "z"; break;
    case "r": sym = "ℝ"; break;
    case "n": sym = "ℕ"; break;
    case "=": sym = "="; break;
    case "<": sym = "<"; break;
    case ">": sym = ">"; break;
    case "l": sym = "≤"; break;
    case "g": sym = "≥"; break;
    case "!": sym = "≠"; break;
    default:
      if (!isNaN(parseInt(k))) sym = k;
  }

  if (sym) {
    insertSymbol(sym);
    e.preventDefault();
  } else if (k === "Backspace") {
    deleteLast();
    e.preventDefault();
  } else if (k === "Enter") {
    submitRow();
    e.preventDefault();
  }
});
