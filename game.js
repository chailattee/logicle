

let currentRowIndex = 0;
let currentColIndex = 0;
const MAX_COLS = 7;

// Typing handler
function handleKey(key) {
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
  const rows = document.querySelectorAll(".row");
  const currentRowEl = rows[currentRowIndex];
  const cells = currentRowEl.querySelectorAll(".cell");
  const row = Array.from(cells).map(cell => cell.textContent.trim());

  const result = validateEasyRow(row);
  if (!result.valid) {
    currentRowEl.classList.add("invalid");
    showMessage(result.message);
    return;
  }

  // ✅ Apply coloring feedback
  const targetCopy = [...targetStatement];
  const feedback = Array(7).fill("gray");

  // First pass: correct positions (green)
  row.forEach((val, idx) => {
    if (val === targetCopy[idx]) {
      feedback[idx] = "green";
      targetCopy[idx] = null; // mark as used
    }
  });

  // Second pass: present elsewhere (yellow)
  row.forEach((val, idx) => {
    if (feedback[idx] === "green") return;
    const foundIndex = targetCopy.indexOf(val);
    if (foundIndex !== -1) {
      feedback[idx] = "yellow";
      targetCopy[foundIndex] = null;
    }
  });

  // Apply colors to cells
  cells.forEach((cell, idx) => {
    cell.classList.add(feedback[idx]);
  });

  currentRowIndex++;
  currentColIndex = 0;
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
    ["0","1","2","3","4","5","6","7","8","9","x","y","z"], // 4 value
    ["=", "<", ">", "≤", "≥", "≠"],      // 5 relation
    ["0","1","2","3","4","5","6","7","8","9","x","y","z"]   // 6 value
  ];

  for (let i=0;i<7;i++){
    if (!allowed[i].includes(row[i]))
      return { valid:false, message:`Check your syntax (don't get too fancy, it's easy mode!)` };
  }

  const boundVar = row[1];
  const left = row[4];
  const right = row[6];
  const isDigit = s => "0123456789".includes(s);
  const isVar = s => ["x","y","z"].includes(s);

  if ((isDigit(left)&&isDigit(right)) || (isVar(left)&&isVar(right)))
    return { valid:false, message:"Easy mode supports one number and one variable per comparison." };

  if ((isVar(left)&&left!==boundVar) || (isVar(right)&&right!==boundVar))
    return { valid:false, message:"Easy mode supports only one variable." };

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
    "e": "∈",
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
