from logicle_main import TOKENS

import random

variables = ["x", "y", "z"]
sets = ["R", "N"]
functions = ["f", "g", "h"]
relations = ["=", "<", ">", "≤", "≥", "≠"]
operators = ["+", "-", "*", "/", "^"]
numbers = ["1", "2", "3", "4", "5"]

def generate(seed):
    random.seed(seed)  # deterministic
    
    # Choose quantifiers, variables, sets
    q1 = random.choice(["forall", "exists"])
    var1 = random.choice(variables)
    set1 = random.choice(sets)
    
    q2 = random.choice(["forall", "exists"])
    var2 = random.choice([v for v in variables if v != var1])
    set2 = random.choice(sets)
    
    # Build exactly 13 tokens: [q1, var1, "in", set1, ",", q2, var2, "in", set2, "such_that", var1, rel, var2]
    rel = random.choice(relations)
    
    puzzle = [q1, var1, "in", set1, ",", q2, var2, "in", set2, "such_that", var1, rel, var2]
    
    return puzzle

import json

puzzles = [generate(i) for i in range(500)]

with open("puzzles.json", "w") as f:
    json.dump(puzzles, f)