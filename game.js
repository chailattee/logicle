// --------------------------
// 1. Tokens and Symbols
// --------------------------
const variables = ["x", "y", "z"];
const sets = ["R", "N"];
const functions = ["f", "g", "h"];
const relations = ["=", "<", ">", "≤", "≥", "≠"];
const operators = ["+", "-", "*", "/", "^"];
const numbers = ["1","2","3","4","5"];

const SYMBOL_MAP = {
  "forall": "∀",
  "exists": "∃",
  "in": "∈",
  "such_that": "∋",
  "x": "x",
  "y": "y",
  "z": "z",
  "R": "ℝ",
  "N": "ℕ",
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
  "^": "^",
  "=": "=",
  "<": "<",
  ">": ">",
  "≤": "≤",
  "≥": "≥",
  "≠": "≠",
  "(": "(",
  ")": ")",
  ",": ",",
  "f": "f",
  "g": "g",
  "h": "h"
};

// --------------------------
// 2. Seeded Random Helper
// --------------------------
function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function choice(arr, seed){
    const idx = Math.floor(seededRandom(seed) * arr.length);
    return arr[idx];
}

// --------------------------
// 3. Puzzle Generator
// --------------------------
function generateComplex(seed) {
    const q1 = choice(["forall","exists"], seed+1);
    const var1 = choice(variables, seed+2);
    const set1 = choice(sets, seed+3);

    const q2 = choice(["forall","exists"], seed+4);
    const var2 = choice(variables.filter(v=>v!==var1), seed+5);
    const set2 = choice(sets, seed+6);

    const func = choice(functions, seed+7);
    const rel = choice(relations, seed+8);

    const nested = seededRandom(seed+9) < 0.3;
    let left;
    if(nested){
        const innerFunc = choice(functions, seed+10);
        left = [func,"(",innerFunc,"(",var1,")",")"];
    } else {
        left = [func,"(",var1,")"];
    }

    let right = [var2];
    const numOps = Math.floor(seededRandom(seed+11)*2)+1;
    for(let i=0;i<numOps;i++){
        const op = choice(operators, seed+12+i);
        const val = choice(variables.concat(numbers), seed+20+i);
        right.push(op,val);
    }

    const puzzle = [q1,var1,"in",set1,",",q2,var2,"in",set2,"such_that"]
                    .concat(left).concat([rel]).concat(right);
    return puzzle;
}

// --------------------------
// 4. Wordle Feedback
// --------------------------
function getFeedback(target, guess){
    let result = Array(guess.length).fill("gray");
    let counts = {};
    target.forEach(t => counts[t] = (counts[t]||0)+1);

    guess.forEach((g,i)=>{
        if(i<target.length && g===target[i]){
            result[i] = "green";
            counts[g]--;
        }
    });

    guess.forEach((g,i)=>{
        if(i<target.length && result[i]==="gray" && counts[g]>0){
            result[i] = "yellow";
            counts[g]--;
        }
    });

    return result;
}

// --------------------------
// 5. Simple Validator
// --------------------------
function isValid(tokens){
    if(tokens.length !== target.length) return false;
    if(!["forall","exists"].includes(tokens[0])) return false;
    if(!tokens.includes("in")) return false;
    if(!tokens.includes("such_that")) return false;
    return true;
}

// --------------------------
// 6. Grid & Keyboard Setup
// --------------------------
const maxGuesses = 6;
let currentGuess = [];
let currentRow = 0;

// Generate puzzle for today
const todaySeed = new Date().getDate() + new Date().getMonth()*31;
const target = generateComplex(todaySeed);

initGrid();
initKeyboard();

function initGrid(){
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    for(let i=0;i<maxGuesses;i++){
        const row = document.createElement("div");
        row.className = "row";
        for(let j=0;j<target.length;j++){
            const cell = document.createElement("div");
            cell.className = "cell";
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function initKeyboard(){
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";
    const symbols = ["forall","exists","in","such_that","x","y","z","R","N","f","g","h","+","-","*","/","^","=","<",">","≤","≥","≠","(",")",","];
    symbols.forEach(s=>{
        const btn = document.createElement("button");
        btn.innerText = SYMBOL_MAP[s] || s;
        btn.onclick = ()=> addToken(s);
        keyboard.appendChild(btn);
    });
}

// --------------------------
// 7. Game Logic
// --------------------------
function addToken(token){
    if(currentGuess.length < target.length){
        currentGuess.push(token);
        updateGrid();
    }
}

function updateGrid(){
    const row = document.getElementsByClassName("row")[currentRow];
    for(let i=0;i<target.length;i++){
        const token = currentGuess[i] || "";
        row.children[i].innerText = SYMBOL_MAP[token] || token;
    }
}

document.getElementById("submit").onclick = ()=>{
    if(currentGuess.length !== target.length){
        alert("Guess is incomplete!");
        return;
    }
    if(!isValid(currentGuess)){
        alert("Invalid guess!");
        return;
    }
    const fb = getFeedback(target,currentGuess);
    const row = document.getElementsByClassName("row")[currentRow];
    for(let i=0;i<fb.length;i++){
        row.children[i].classList.add(fb[i]);
    }

    if(fb.every(c=>"green"===c)){
        document.getElementById("message").innerText = "You solved it!";
        return;
    }

    currentRow++;
    currentGuess = [];
    if(currentRow>=maxGuesses){
        document.getElementById("message").innerText = "Game over! Puzzle was: "+target.map(t=>SYMBOL_MAP[t]||t).join(" ");
    }
}
