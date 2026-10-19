/**
 * Retro Vintage Calculator - Chrome Extension MV3
 * 1980s Electronic Desktop Calculator Logic
 */

(function () {
  'use strict';

  // State
  let expressionTokens = [];
  let currentInput = '0';
  let isResultCalculated = false;
  let hasError = false;

  // DOM Elements
  const mainDisplay = document.getElementById('mainDisplay');
  const expressionDisplay = document.getElementById('expressionDisplay');
  const opIndicator = document.getElementById('opIndicator');
  const keypad = document.querySelector('.keypad-grid');

  // Math Evaluator without eval() using Shunting-Yard Algorithm
  function evaluateTokens(tokens) {
    if (!tokens || tokens.length === 0) return 0;

    // Normalize visual operators to standard arithmetic symbols
    const norm = tokens.map(t => {
      if (t === '×') return '*';
      if (t === '÷') return '/';
      if (t === '−') return '-';
      return t;
    });

    // Handle percentage in context (e.g., 100 + 10% => 100 + 10)
    const processed = [];
    for (let i = 0; i < norm.length; i++) {
      const token = norm[i];
      if (token === '%') {
        if (processed.length > 0) {
          const val = parseFloat(processed.pop());
          if (processed.length >= 2) {
            const op = processed[processed.length - 1];
            const base = parseFloat(processed[processed.length - 2]);
            if (op === '+' || op === '-') {
              processed.push((base * (val / 100)).toString());
            } else {
              processed.push((val / 100).toString());
            }
          } else {
            processed.push((val / 100).toString());
          }
        }
      } else {
        processed.push(token);
      }
    }

    // Shunting-Yard: Convert Infix to Postfix (RPN)
    const outputQueue = [];
    const opStack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

    for (const token of processed) {
      if (!isNaN(parseFloat(token)) && isFinite(token)) {
        outputQueue.push(parseFloat(token));
      } else if (token in precedence) {
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1] in precedence &&
          precedence[opStack[opStack.length - 1]] >= precedence[token]
        ) {
          outputQueue.push(opStack.pop());
        }
        opStack.push(token);
      }
    }

    while (opStack.length > 0) {
      outputQueue.push(opStack.pop());
    }

    // Evaluate Reverse Polish Notation (RPN)
    const evalStack = [];
    for (const item of outputQueue) {
      if (typeof item === 'number') {
        evalStack.push(item);
      } else {
        const b = evalStack.pop();
        const a = evalStack.pop();
        if (a === undefined || b === undefined) {
          throw new Error('Invalid Expression');
        }
        let res;
        if (item === '+') res = a + b;
        else if (item === '-') res = a - b;
        else if (item === '*') res = a * b;
        else if (item === '/') {
          if (b === 0) throw new Error('Cannot divide by 0');
          res = a / b;
        }
        evalStack.push(res);
      }
    }

    if (evalStack.length !== 1 || isNaN(evalStack[0])) {
      throw new Error('Invalid Expression');
    }

    return evalStack[0];
  }

  // Format numbers cleanly for retro LCD display (avoid floating point bugs)
  function formatResult(num) {
    if (isNaN(num) || !isFinite(num)) {
      return 'Error';
    }

    // Eliminate floating point representation errors
    const rounded = Number(num.toPrecision(12));

    // Handle very large or extremely small numbers with clean scientific notation
    if (Math.abs(num) >= 1e12 || (Math.abs(num) > 0 && Math.abs(num) < 1e-7)) {
      return Number(num.toPrecision(6)).toExponential().replace('+', '');
    }

    return rounded.toString();
  }

  // Update LCD Displays
  function updateDisplay() {
    if (hasError) {
      mainDisplay.classList.add('is-error');
      opIndicator.textContent = 'ERROR';
    } else {
      mainDisplay.classList.remove('is-error');
      if (isResultCalculated) {
        opIndicator.textContent = '= COMPLETE';
      } else if (expressionTokens.length > 0) {
        const lastOp = expressionTokens[expressionTokens.length - 1];
        if (['+', '−', '×', '÷'].includes(lastOp)) {
          opIndicator.textContent = `OP [ ${lastOp} ]`;
        } else {
          opIndicator.textContent = 'CALC';
        }
      } else {
        opIndicator.textContent = 'READY';
      }
    }

    // Format current input for main display
    mainDisplay.textContent = currentInput || '0';

    // Format expression line
    let exprText = expressionTokens.join(' ');
    if (isResultCalculated && exprText) {
      exprText += ' =';
    }
    expressionDisplay.textContent = exprText;
  }

  // Clear all calculator state
  function clearAll() {
    expressionTokens = [];
    currentInput = '0';
    isResultCalculated = false;
    hasError = false;
    updateDisplay();
  }

  // Delete last entered character
  function handleBackspace() {
    if (hasError) {
      clearAll();
      return;
    }

    if (isResultCalculated) {
      expressionTokens = [];
      isResultCalculated = false;
      updateDisplay();
      return;
    }

    if (currentInput.length > 1) {
      if (currentInput.length === 2 && currentInput.startsWith('-')) {
        currentInput = '0';
      } else {
        currentInput = currentInput.slice(0, -1);
      }
    } else if (currentInput.length === 1 && currentInput !== '0') {
      currentInput = '0';
    } else if (currentInput === '0' && expressionTokens.length > 0) {
      // If currentInput is 0, pop preceding operator to allow editing prior number
      expressionTokens.pop(); // remove operator
      if (expressionTokens.length > 0) {
        currentInput = expressionTokens.pop(); // recover prior number
      }
    }
    updateDisplay();
  }

  // Toggle positive/negative sign (±)
  function handleSign() {
    if (hasError) return;

    if (isResultCalculated) {
      expressionTokens = [];
      isResultCalculated = false;
    }

    if (currentInput === '0' || currentInput === '') {
      currentInput = '-0';
    } else if (currentInput === '-0') {
      currentInput = '0';
    } else if (currentInput.startsWith('-')) {
      currentInput = currentInput.slice(1);
    } else {
      currentInput = '-' + currentInput;
    }
    updateDisplay();
  }

  // Handle number input (0-9)
  function handleNumber(digit) {
    if (hasError) {
      clearAll();
    }

    if (isResultCalculated) {
      expressionTokens = [];
      currentInput = digit;
      isResultCalculated = false;
      updateDisplay();
      return;
    }

    // Limit maximum length to prevent visual overflow on LCD
    if (currentInput.replace(/[-.]/g, '').length >= 12) {
      return;
    }

    if (currentInput === '0') {
      currentInput = digit;
    } else if (currentInput === '-0') {
      currentInput = '-' + digit;
    } else {
      currentInput += digit;
    }
    updateDisplay();
  }

  // Handle decimal point (.)
  function handleDecimal() {
    if (hasError) {
      clearAll();
    }

    if (isResultCalculated) {
      expressionTokens = [];
      currentInput = '0.';
      isResultCalculated = false;
      updateDisplay();
      return;
    }

    if (!currentInput.includes('.')) {
      if (currentInput === '' || currentInput === '-') {
        currentInput += '0.';
      } else {
        currentInput += '.';
      }
    }
    updateDisplay();
  }

  // Handle arithmetic operator (+, −, ×, ÷)
  function handleOperator(op) {
    if (hasError) return;

    if (isResultCalculated) {
      // Chain previous result into new calculation
      expressionTokens = [currentInput, op];
      currentInput = '0';
      isResultCalculated = false;
      updateDisplay();
      return;
    }

    // If user has entered an operand
    if (currentInput !== '' && currentInput !== '-') {
      // Clean up trailing decimal if any
      let cleanNum = currentInput;
      if (cleanNum.endsWith('.')) {
        cleanNum = cleanNum.slice(0, -1);
      }
      expressionTokens.push(cleanNum);
      expressionTokens.push(op);
      currentInput = '0';
    } else if (expressionTokens.length > 0) {
      // If user presses operator consecutively, replace the previous operator
      const last = expressionTokens[expressionTokens.length - 1];
      if (['+', '−', '×', '÷'].includes(last)) {
        expressionTokens[expressionTokens.length - 1] = op;
      }
    } else {
      // Expression was empty, start with 0 and the operator
      expressionTokens.push('0');
      expressionTokens.push(op);
      currentInput = '0';
    }
    updateDisplay();
  }

  // Handle percentage (%)
  function handlePercent() {
    if (hasError) return;

    if (isResultCalculated) {
      expressionTokens = [];
      isResultCalculated = false;
    }

    // Push current input as operand with % token
    let cleanNum = currentInput;
    if (cleanNum.endsWith('.')) cleanNum = cleanNum.slice(0, -1);

    if (expressionTokens.length >= 2) {
      const prevOp = expressionTokens[expressionTokens.length - 1];
      const baseNum = parseFloat(expressionTokens[expressionTokens.length - 2]);
      const currentVal = parseFloat(cleanNum);

      if (prevOp === '+' || prevOp === '−') {
        const percValue = baseNum * (currentVal / 100);
        currentInput = formatResult(percValue);
      } else {
        const percValue = currentVal / 100;
        currentInput = formatResult(percValue);
      }
    } else {
      const percValue = parseFloat(cleanNum) / 100;
      currentInput = formatResult(percValue);
    }
    updateDisplay();
  }

  // Handle Equals (=)
  function handleEquals() {
    if (hasError) return;

    // If nothing entered yet, do nothing
    if (expressionTokens.length === 0 && !isResultCalculated) {
      return;
    }

    // If calculation was already completed, hitting equals again can re-evaluate or stay
    if (isResultCalculated) {
      return;
    }

    // Append current input to tokens if present
    let tokensToEvaluate = [...expressionTokens];
    if (currentInput !== '' && currentInput !== '-') {
      let cleanNum = currentInput;
      if (cleanNum.endsWith('.')) cleanNum = cleanNum.slice(0, -1);
      tokensToEvaluate.push(cleanNum);
    } else if (tokensToEvaluate.length > 0) {
      // If last item is an operator with no following number, drop it
      const last = tokensToEvaluate[tokensToEvaluate.length - 1];
      if (['+', '−', '×', '÷'].includes(last)) {
        tokensToEvaluate.pop();
      }
    }

    if (tokensToEvaluate.length === 0) return;

    try {
      const result = evaluateTokens(tokensToEvaluate);
      const formatted = formatResult(result);
      if (formatted === 'Error') {
        throw new Error('Math Error');
      }
      expressionTokens = tokensToEvaluate;
      currentInput = formatted;
      isResultCalculated = true;
      hasError = false;
    } catch (err) {
      hasError = true;
      currentInput = err.message === 'Cannot divide by 0' ? 'Cannot divide by 0' : 'Error';
    }

    updateDisplay();
  }

  // Button Click Handler
  function handleAction(action, value) {
    switch (action) {
      case 'number':
        handleNumber(value);
        break;
      case 'decimal':
        handleDecimal();
        break;
      case 'operator':
        handleOperator(value);
        break;
      case 'percent':
        handlePercent();
        break;
      case 'sign':
        handleSign();
        break;
      case 'clear':
        clearAll();
        break;
      case 'backspace':
        handleBackspace();
        break;
      case 'equals':
        handleEquals();
        break;
    }
  }

  // Trigger tactile button depression visual feedback
  function triggerButtonFeedback(buttonElement) {
    if (!buttonElement) return;
    buttonElement.classList.add('is-pressed');
    setTimeout(() => {
      buttonElement.classList.remove('is-pressed');
    }, 120);
  }

  // Attach Keypad Click Listeners
  keypad.addEventListener('click', (event) => {
    const button = event.target.closest('button.key');
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    triggerButtonFeedback(button);
    handleAction(action, value);
  });

  // Map Keyboard Input
  window.addEventListener('keydown', (event) => {
    const key = event.key;
    let targetButton = null;

    if (key >= '0' && key <= '9') {
      event.preventDefault();
      targetButton = document.querySelector(`.key-num[data-value="${key}"]`);
      handleNumber(key);
    } else if (key === '.') {
      event.preventDefault();
      targetButton = document.getElementById('btn-dot');
      handleDecimal();
    } else if (key === '+') {
      event.preventDefault();
      targetButton = document.getElementById('btn-add');
      handleOperator('+');
    } else if (key === '-') {
      event.preventDefault();
      targetButton = document.getElementById('btn-subtract');
      handleOperator('−');
    } else if (key === '*' || key.toLowerCase() === 'x') {
      event.preventDefault();
      targetButton = document.getElementById('btn-multiply');
      handleOperator('×');
    } else if (key === '/') {
      event.preventDefault();
      targetButton = document.getElementById('btn-divide');
      handleOperator('÷');
    } else if (key === '%') {
      event.preventDefault();
      targetButton = document.getElementById('btn-percent');
      handlePercent();
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      targetButton = document.getElementById('btn-equals');
      handleEquals();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
      event.preventDefault();
      targetButton = document.getElementById('btn-clear');
      clearAll();
    } else if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault();
      targetButton = document.getElementById('btn-backspace');
      handleBackspace();
    } else if (key === '_' || key === '#' || key === 'F9') {
      event.preventDefault();
      targetButton = document.getElementById('btn-sign');
      handleSign();
    }

    if (targetButton) {
      triggerButtonFeedback(targetButton);
    }
  });

  // Initialize Display
  clearAll();
})();
