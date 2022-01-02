// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let operation;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';


// Scroll
let valueY = 0;

function bestScoresToDOM() {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
}

// Check local storage for best scores, set bestScoreArray
function getSavedBestScores() {
  if (localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else{
    bestScoreArray = [
      {questions: 10, bestScore: finalTimeDisplay}, 
      {questions: 25, bestScore: finalTimeDisplay}, 
      {questions: 50, bestScore: finalTimeDisplay}, 
      {questions: 99, bestScore: finalTimeDisplay}
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

// Update Best Score Array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    if (questionAmount == score.questions) {
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  bestScoresToDOM();
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

function playAgain() {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

function resetTimers() {
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
}

function calculatePenalty() {
  equationsArray.forEach((equation, index) => {
    if (equation.evaluated !== playerGuessArray[index]) {
      penaltyTime += 0.5
    }
  });
}

function showScorePage() {
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
}

// Format & Display Time in DOM 
function scoresToDOM() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent =  `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  // Scroll to top and go to Score Page
  itemContainer.scrollTo({top: 0, behavior: 'instant'})
  showScorePage();
}

function checkTime() {
  if (playerGuessArray.length === questionAmount) {
    clearInterval(timer);
    calculatePenalty();
    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
}

function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// Start timer when game page is clicked
function startTimer() {
  resetTimers();
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer)
}

// Populate the playerGuessArray
function select(guessedTrue) {
  valueY += 80;
  itemContainer.scroll(0, valueY);
  guessedTrue? playerGuessArray.push('true') : playerGuessArray.push('false');
}

function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomOperation() {
  const operations = ['+','-','x']
  return operations[getRandomInt(3)]
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    operation = getRandomOperation();
    let equationValue;
    if (operation === '+') {
      equationValue = firstNumber + secondNumber;
    }else if (operation === '-') {
      equationValue = firstNumber - secondNumber;
    }else if (operation === 'x') {
      equationValue = firstNumber * secondNumber;
    }
    const equation = `${firstNumber} ${operation} ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    operation = getRandomOperation();
    if (operation === '+') {
      equationValue = firstNumber + secondNumber;
    }else if (operation === '-') {
      equationValue = firstNumber - secondNumber;
    }else if (operation === 'x') {
      equationValue = firstNumber * secondNumber;
    }
    wrongFormat[0] = `${firstNumber} ${operation} ${secondNumber + 1} = ${Math.round(equationValue)}`;
    wrongFormat[1] = `${firstNumber} ${operation} ${secondNumber} = ${Math.round(equationValue - 1)}`;
    wrongFormat[2] = `${firstNumber + 1} ${operation} ${secondNumber} = ${Math.round(equationValue)}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffleArray(equationsArray);
}

function equationsToDOM() {
  for (let equation of equationsArray) {
    const item = document.createElement('div');
    item.classList.add('item');
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  }
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}


// Displays 3,2,1, GO!
function countdownStart() {
  let count = 3;
  countdown.textContent = count;
  const timeCountDown = setInterval(() => {
    count--;
    if (count === 0) {
      countdown.textContent = "GO!";
    }else if (count === -1) {
      showGamePage();
      clearInterval(timeCountDown);
    }else{
      countdown.textContent = count;
    }
  }, 1000);
}

// Navigate from Splash Page to Countdown Page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
}

// Get the value from selected radio button
function getRadioValue() {
  let radioValue;
  for (let radioInput of radioInputs){
    if (radioInput.checked) {
      radioValue = radioInput.value;
      return radioValue;
    }
  }
}

function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = Number(getRadioValue());
  if (questionAmount) {
    showCountdown();
  }
}

startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    radioEl.classList.remove('selected-label');
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
    }
  });
})


// Event Listeners
startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

// On-load
getSavedBestScores();