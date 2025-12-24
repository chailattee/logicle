
let currentRowIndex = 0;
let currentColIndex = 0;
let gameOver = false;
const MAX_COLS = 7;

// Easy Mode puzzles: arrays of 7 symbols each
const puzzles = [
  ["∀","x","∈","ℕ","5","=","x"],
  ["∃","y","∈","ℝ","7","<","y"],
  ["∀","z","∈","ℕ","3","≠","z"],
  ["∃","x","∈","ℝ","2","≥","x"]
  // add as many as you want
];

// Flip operator helper
function flipOperator(op) {
  const map = {
    "<": ">",
    ">": "<",
    "≤": "≥",
    "≥": "≤",
    "=": "=",
    "≠": "≠"
  };
  return map[op];
}

// Extract roles from row
function extractRoles(row) {
  return {
    quantifier: row[0],
    variable: row[1],
    membership: row[2], // ∈
    set: row[3], // ℝ or ℕ
    left: row[4],
    operator: row[5],
    right: row[6]
  };
}
function normalizeWithRoles(row) {
  const roles = extractRoles(row);
  const comparison = normalizeComparison(
    roles.left,
    roles.operator,
    roles.right
  );

  return {
    quantifier: roles.quantifier,
    variable: roles.variable,
    membership: roles.membership,
    set: roles.set,
    comparison
  };
}

// Normalize comparison helper
function normalizeComparison(left, operator, right) {
  const isVar = v => ["x","y","z"].includes(v);
  const isNum = v => "0123456789".includes(v);

  if (isVar(left) && isNum(right)) {
    return { left, operator, right };
  }

  if (isNum(left) && isVar(right)) {
    return {
      left: right,
      operator: flipOperator(operator),
      right: left
    };
  }

  return { left, operator, right };
}


function normalizeStatement(row) {
  return {
    quantifier: row[0],
    variable: row[1],
    setSymbol: row[3],
    comparison: normalizeComparison(row[4], row[5], row[6])
  };
}
/**
 * Returns feedback for the comparison segment 
 *  easy: 
 *      rowSegment: [left, operator, right]
 *      targetSegment: [left, operator, right]
 */

function getComparisonFeedback(rowSegment, targetSegment, mode = "easy") {
  const feedback = ["gray", "gray", "gray"];
  const [gL, gOp, gR] = rowSegment;
  const [tL, tOp, tR] = targetSegment;

  const guessNorm  = normalizeComparison(gL, gOp, gR);
  const targetNorm = normalizeComparison(tL, tOp, tR);

  if (mode === "easy") {

  // Operator match
  if (guessNorm.operator === targetNorm.operator) {
    feedback[1] = "green";
  }

   // Variable match — color the tile that contains the variable
  if (guessNorm.left === targetNorm.left) {
    if (["x","y","z"].includes(gL)) feedback[0] = "green";
    if (["x","y","z"].includes(gR)) feedback[2] = "green";
  }

  // Number match — color the tile that contains the number
  if (guessNorm.right === targetNorm.right) {
    if ("0123456789".includes(gL)) feedback[0] = "green";
    if ("0123456789".includes(gR)) feedback[2] = "green";
  }

  return feedback;
}}

// Typing handler
function handleKey(key) {
    if (gameOver) return;
  const rows = document.querySelectorAll(".row");
  const currentRow = rows[currentRowIndex];
  const cells = currentRow.querySelectorAll(".cell");

  // Clear error
  hideMessage();
  currentRow.classList.remove("invalid");

  // Special keys
  if (key === "Enter") { submitRow(); return; }
  if (key === "Backspace" || key === "Delete") {
    if (currentColIndex > 0) {
      currentColIndex--;
      cells[currentColIndex].textContent = "";
    }
    return;
  }

  if (currentColIndex >= MAX_COLS) return;

  // Insert key
  cells[currentColIndex].textContent = key;
  currentColIndex++;
}

//EXAMPLE TARGET STATEMENT
let targetStatement = ["∀","x","∈","ℕ","5","=","x"]; // example target
/////////////////////////////////////////////////////////


// Submit row

function submitRow() {
  if (gameOver) return;

  const rows = document.querySelectorAll(".row");
  const currentRowEl = rows[currentRowIndex];
  const cells = currentRowEl.querySelectorAll(".cell");
  const row = Array.from(cells).map(cell => cell.textContent.trim());
  let won = false; // track whether the player won this row


  const result = validateEasyRow(row);
  if (!result.valid) {
    currentRowEl.classList.add("invalid");
    showMessage(result.message);
    return;
  }

  // --- FEEDBACK COLORING (position-based, NOT flipped) ---
  const feedback = Array(7).fill("gray");
  
  if (row[0] === targetStatement[0]) feedback[0] = "green"; // quantifier
  if (row[1] === targetStatement[1]) feedback[1] = "green"; // bound variable
  if (row[2] === targetStatement[2]) feedback[2] = "green"; // ∈
  if (row[3] === targetStatement[3]) feedback[3] = "green"; // set
  
  // Comparison (role-based)
  const comparisonFeedback = getComparisonFeedback(
    row.slice(4,7),
    targetStatement.slice(4,7),
    "easy"
  );
  feedback.splice(4,3,...comparisonFeedback);

 // Apply feedback colors to cells
  cells.forEach((cell, i) => {
    cell.classList.remove("green","gray");
    cell.classList.add(feedback[i]);
  });

 const [guessLeft, guessOp, guessRight] = row.slice(4,7);
  const [targetLeft, targetOp, targetRight] = targetStatement.slice(4,7);

  const leftRightMatch = 
    (guessLeft === targetLeft && guessRight === targetRight) || 
    (guessLeft === targetRight && guessRight === targetLeft); // flipped

  const operatorMatch =
    guessOp === targetOp || guessOp === flipOperator(targetOp);

  const isWin =
    row[0] === targetStatement[0] &&
    row[1] === targetStatement[1] &&
    row[2] === targetStatement[2] &&
    row[3] === targetStatement[3] &&
    leftRightMatch &&
    operatorMatch;

  if (isWin) {
    showMessage("Correct! Logically equivalent statement.");
    gameOver = true;
    return;
  }

  // Move to next row
  currentRowIndex++;
  currentColIndex = 0;

  // end game after 6 guesses
  if (currentRowIndex >= 6 && !gameOver) {
    showMessage(
      `Game over. Correct statement: ${targetStatement.join(" ")}`
    );
    gameOver = true;
  }
}


// Validator with separate membership cells
function validateEasyRow(row) {
  if (row.includes("") || row.length !== 7)
    return { valid: false, message: "Complete the entire statement before submitting." };

  const allowed = [
    ["∀", "∃"],                          // 0 quantifier
    ["x","y","z"],                        // 1 variable
    ["∈"],                                // 2 membership symbol
    ["ℝ","ℕ"],                             // 3 set
    ["x","y","z", "0","1","2","3","4","5","6","7","8","9"], // 4 value
    ["=", "<", ">", "≤", "≥", "≠"],      // 5 relation
    ["x","y","z", "0","1","2","3","4","5","6","7","8","9"]   // 6  value
  ];

  for (let i=0;i<7;i++){
    if (!allowed[i].includes(row[i]))
      return { valid:false, message:`Check your syntax (see instructions)` };
  }

  const boundVar = row[1];
  const left = row[4];
  const right = row[6];
  const isDigit = s => "0123456789".includes(s);
  const isVar = s => ["x","y","z"].includes(s);

  if ((isDigit(left)&&isDigit(right)) || (isVar(left)&&isVar(right)))
    return { valid:false, message:"Easy mode supports one number and one variable per comparison." };

  return { valid:true };
}

// Message box helpers
function showMessage(text) {
  const box = document.getElementById("message-box");
  box.textContent = text;
  box.classList.remove("hidden");
}
function hideMessage() {
  const box = document.getElementById("message-box");
  box.classList.add("hidden");
}

// Physical keyboard support
document.addEventListener("keydown", (event) => {
  const key = event.key;

  // Map physical keys to symbols
  const keyMap = {
    "a": "∀",
    "e": "∃",
    "x": "x",
    "y": "y",
    "z": "z",
    "b": "∈",
    "r": "ℝ",
    "n": "ℕ",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "0": "0",
    "=": "=",
    "<": "<",
    ">": ">",
    "l": "≤",
    "g": "≥",
    "!": "≠",
    "Enter": "Enter",
    "Backspace": "Backspace",
    "Delete": "Backspace"
  };

  if (keyMap[key]) {
    handleKey(keyMap[key]);
  }
});

