const display = document.getElementById("display");

const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");
const clearButton = document.querySelector('[data-action="clear"]');
const backspaceButton = document.querySelector('[data-action="backspace"]');
const equalsButton = document.querySelector('[data-action="equals"]');

let currentInput = "0";
let expression = "";
let errorState = false;

// Update calculator display
function updateDisplay(value = currentInput) {
    display.textContent = value;
}

// Add number or decimal
function inputNumber(number) {
    if (errorState) {
        clearCalculator();
    }

    if (number === ".") {
        // Prevent more than one decimal in the current number
        const lastNumber = expression.split(/[+−×÷]/).pop();

        if (lastNumber.includes(".")) {
            return;
        }

        if (expression === "" || /[+−×÷]$/.test(expression)) {
            expression += "0.";
            currentInput = "0.";
        } else {
            expression += ".";
            currentInput += ".";
        }

        updateDisplay(expression);
        return;
    }

    if (expression === "" || /[+−×÷]$/.test(expression)) {
        expression += number;
        currentInput = number;
    } else {
        // Replace starting zero with the new number
        if (currentInput === "0") {
            expression = expression.slice(0, -1) + number;
        } else {
            expression += number;
        }

        currentInput += number;
    }

    updateDisplay(expression);
}

// Add operator
function inputOperator(operator) {
    if (errorState) {
        return;
    }

    // Don't allow an operator before entering a number
    if (expression === "") {
        return;
    }

    // Replace the last operator if user presses another operator
    if (/[+−×÷]$/.test(expression)) {
        expression = expression.slice(0, -1) + operator;
        updateDisplay(expression);
        return;
    }

    expression += operator;
    currentInput = "";
    updateDisplay(expression);
}

// Convert display operators to JavaScript-style operators
function normalizeExpression(value) {
    return value
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");
}

// Calculate expression without using eval()
function calculateExpression(value) {
    const normalized = normalizeExpression(value);

    // Split expression into numbers and operators
    const tokens = normalized.match(/(?:\d+(?:\.\d+)?|\.\d+|[+\-*/])/g);

    if (!tokens) {
        return null;
    }

    // Make sure the complete expression was parsed
    if (tokens.join("") !== normalized) {
        return null;
    }

    // First pass: multiplication and division
    const firstPass = [Number(tokens[0])];

    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const nextNumber = Number(tokens[i + 1]);

        if (!Number.isFinite(nextNumber)) {
            return null;
        }

        if (operator === "*" || operator === "/") {
            const previousNumber = firstPass.pop();

            if (operator === "/" && nextNumber === 0) {
                return null;
            }

            const result =
                operator === "*"
                    ? previousNumber * nextNumber
                    : previousNumber / nextNumber;

            if (!Number.isFinite(result)) {
                return null;
            }

            firstPass.push(result);
        } else {
            firstPass.push(operator);
            firstPass.push(nextNumber);
        }
    }

    // Second pass: addition and subtraction
    let result = firstPass[0];

    for (let i = 1; i < firstPass.length; i += 2) {
        const operator = firstPass[i];
        const nextNumber = firstPass[i + 1];

        if (operator === "+") {
            result += nextNumber;
        } else if (operator === "-") {
            result -= nextNumber;
        }
    }

    if (!Number.isFinite(result)) {
        return null;
    }

    return result;
}

// Format result to avoid unnecessary floating-point digits
function formatResult(result) {
    if (!Number.isFinite(result)) {
        return "Error";
    }

    return String(Number(result.toPrecision(12)));
}

// Perform calculation
function performCalculation() {
    if (errorState || expression === "") {
        return;
    }

    // Don't calculate if expression ends with an operator
    if (/[+−×÷]$/.test(expression)) {
        return;
    }

    const result = calculateExpression(expression);

    if (result === null) {
        showError();
        return;
    }

    currentInput = formatResult(result);
    expression = currentInput;

    updateDisplay(currentInput);
}

// Clear calculator
function clearCalculator() {
    currentInput = "0";
    expression = "";
    errorState = false;

    updateDisplay(currentInput);
}

// Delete last character
function deleteLastCharacter() {
    if (errorState) {
        clearCalculator();
        return;
    }

    if (expression.length === 0) {
        return;
    }

    expression = expression.slice(0, -1);

    if (expression === "") {
        currentInput = "0";
        updateDisplay(currentInput);
        return;
    }

    if (/[+−×÷]$/.test(expression)) {
        currentInput = "";
    } else {
        const numbers = expression.split(/[+−×÷]/);
        currentInput = numbers[numbers.length - 1];
    }

    updateDisplay(expression);
}

// Show error
function showError() {
    currentInput = "Error";
    expression = "";
    errorState = true;

    updateDisplay(currentInput);
}

// Number button events
numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
        inputNumber(button.dataset.number);
    });
});

// Operator button events
operatorButtons.forEach((button) => {
    button.addEventListener("click", () => {
        inputOperator(button.dataset.operator);
    });
});

// Clear button event
clearButton.addEventListener("click", () => {
    clearCalculator();
});

// Backspace button event
backspaceButton.addEventListener("click", () => {
    deleteLastCharacter();
});

// Equals button event
equalsButton.addEventListener("click", () => {
    performCalculation();
});

// Initial display
updateDisplay();