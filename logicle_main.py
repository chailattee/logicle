TOKENS = [
    "forall", "exists", "in", "such_that",
    "x", "y", "z",
    "R", "N",
    "+", "-", "*", "/", "^", "=", "<", ">", "≤", "≥", "≠",
    "(", ")", ",",
    "f", "g", "h"   # function names
]

def feedback(target, guess):
    result = ["gray"] * len(guess)
    counts = {}
    
    for t in target:
        counts[t] = counts.get(t, 0) + 1

    # Green first
    for i, g in enumerate(guess):
        if i < len(target) and g == target[i]:
            result[i] = "green"
            counts[g] -= 1
    
    # Yellow
    for i, g in enumerate(guess):
        if i < len(target) and result[i] == "gray" and counts.get(g,0) > 0:
            result[i] = "yellow"
            counts[g] -= 1
    
    return result


def is_valid(tokens):
    
    if len(tokens) < 10:
        return False
    
    # Step 1: Check quantifiers
    if tokens[0] not in ["forall", "exists"]:
        return False
    
    # Step 2: Must have 'in' for first variable
    if "in" not in tokens[:4]:
        return False
    
    # Step 3: Must have 'such_that'
    if "such_that" not in tokens:
        return False
    
    # Step 4: Check parentheses balance
    stack = []
    for t in tokens:
        if t == "(":
            stack.append("(")
        elif t == ")":
            if not stack:
                return False
            stack.pop()
    if stack:
        return False
    
    # Step 5: Check function calls: function must be followed by '('
    functions = ["f", "g", "h"]
    for i, t in enumerate(tokens[:-1]):
        if t in functions and tokens[i+1] != "(":
            return False
    
    # Step 6: Check operators
    operators = ["+", "-", "*", "/", "^", "=", "<", ">", "≤", "≥", "≠"]
    variables_numbers = ["x","y","z","1","2","3","4","5"]
    for i, t in enumerate(tokens[:-1]):
        if t in operators:
            if tokens[i+1] not in variables_numbers:
                return False
    
    return True
