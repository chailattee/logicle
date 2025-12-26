// puzzles.js

const QUANTIFIERS = ["∀", "∃"];
const VARIABLES = ["x", "y", "z"];
const SETS = ["ℕ", "ℝ"];
const OPERATORS = ["=", "<", ">", "≤", "≥", "≠"];
const NUMBERS = ["0","1","2","3","4","5","6","7","8","9"];

const EASY_PUZZLES = [];

for (const q of QUANTIFIERS) {
  for (const v of VARIABLES) {
    for (const set of SETS) {
      for (const op of OPERATORS) {
        for (const n of NUMBERS) {

          // Avoid trivial or nonsensical cases
          if (op === "=" && n === "0" && set === "ℕ") continue;

          EASY_PUZZLES.push([
            q,          // quantifier
            v,          // bound variable
            "∈",        // membership
            set,        // set
            n,          // number
            op,         // operator
            v           // variable
          ]);
        }
      }
    }
  }
}


//  daily picker
function getDailyPuzzle() {
  const start = new Date(2025, 11, 24); // months indexed from 0 - 11
  const today = new Date();
  const daysSince =
    Math.floor((today - start) / (1000 * 60 * 60 * 24));

  return EASY_PUZZLES[daysSince % EASY_PUZZLES.length];
}

// random picker
function pickRandomPuzzle() {
  const index = Math.floor(Math.random() * EASY_PUZZLES.length);
  return EASY_PUZZLES[index];
}