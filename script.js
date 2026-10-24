
const passageElement = document.getElementById("passage");
const typingInput = document.getElementById("typingInput");
const durationSelect = document.getElementById("duration");

const timeElement = document.getElementById("time");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const mistakesElement = document.getElementById("mistakes");
const statusElement = document.getElementById("status");

const resultCard = document.getElementById("result");
const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalMistakes = document.getElementById("finalMistakes");
const finalChars = document.getElementById("finalChars");
const resultMessage = document.getElementById("resultMessage");

const restartBtn = document.getElementById("restartBtn");
const newPassageBtn = document.getElementById("newPassageBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");

const passages = [
  "Learning a new skill takes time and regular practice. Start with small steps and focus on accuracy before trying to increase your speed. With patience and effort, you can improve every day.",

  "Technology has changed the way people learn, communicate, and work. Computers and the internet provide useful tools for students who want to explore new ideas and develop practical skills.",

  "Reading every day can improve vocabulary, concentration, and writing skills. Choose a topic that interests you, take your time, and enjoy learning something new with every practice session.",

  "A good routine makes learning easier. Set a clear goal, remove distractions, and practice for a short period each day. Small improvements can lead to better results over time.",

  "Typing accurately is an important skill for students and professionals. Keep your hands relaxed, look at the screen, and focus on typing each word correctly before increasing your speed.",

  "The internet connects people across the world and gives them access to information. Learning how to use digital tools responsibly can help people study, create, and solve everyday problems."
];

let targetText = "";
let timerId = null;
let timeLeft = 60;
let startTime = null;
let testRunning = false;
let testFinished = false;
let previousPassageIndex = -1;

function choosePassage() {
  if (passages.length === 1) {
    return passages[0];
  }

  let index;

  do {
    index = Math.floor(Math.random() * passages.length);
  } while (index === previousPassageIndex);

  previousPassageIndex = index;
  return passages[index];
}

function renderPassage() {
  passageElement.replaceChildren();

  for (let i = 0; i < targetText.length; i++) {
    const span = document.createElement("span");
    span.textContent = targetText[i];
    span.dataset.index = i;
    passageElement.appendChild(span);
  }

  updatePassageHighlight();
}

function updatePassageHighlight() {
  const typedText = typingInput.value;
  const spans = passageElement.children;

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    span.className = "";

    if (i < typedText.length) {
      span.classList.add(
        typedText[i] === targetText[i] ? "correct" : "incorrect"
      );
    } else if (i === typedText.length && !testFinished) {
      span.classList.add("current");
    }
  }
}

function getStats() {
  const typedText = typingInput.value;
  let correctChars = 0;
  let mistakes = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === targetText[i]) {
      correctChars++;
    } else {
      mistakes++;
    }
  }

  const totalTyped = typedText.length;
  const accuracy = totalTyped === 0
    ? 100
    : Math.round((correctChars / totalTyped) * 100);

  let elapsedSeconds = 0;

  if (startTime !== null) {
    elapsedSeconds = Math.max(
      1,
      (Date.now() - startTime) / 1000
    );
  }

  const wpm = elapsedSeconds > 0
    ? Math.round((totalTyped / 5) / (elapsedSeconds / 60))
    : 0;

  return {
    totalTyped,
    correctChars,
    mistakes,
    accuracy,
    wpm
  };
}

function updateStats() {
  const stats = getStats();

  wpmElement.textContent = stats.wpm;
  accuracyElement.textContent = stats.accuracy;
  mistakesElement.textContent = stats.mistakes;
}

function startTimer() {
  if (testRunning || testFinished) return;

  testRunning = true;
  startTime = Date.now();
  statusElement.textContent = "Test in progress. Keep typing!";

  timerId = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;

    timeLeft = Math.max(
      0,
      Number(durationSelect.value) - Math.floor(elapsed)
    );

    timeElement.textContent = `${timeLeft}s`;
    updateStats();

    if (timeLeft <= 0) {
      finishTest();
    }
  }, 200);
}

function finishTest() {
  if (testFinished) return;

  testFinished = true;
  testRunning = false;

  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }

  typingInput.disabled = true;
  timeLeft = Math.max(0, timeLeft);
  timeElement.textContent = `${timeLeft}s`;

  const stats = getStats();

  wpmElement.textContent = stats.wpm;
  accuracyElement.textContent = stats.accuracy;
  mistakesElement.textContent = stats.mistakes;

  finalWpm.textContent = stats.wpm;
  finalAccuracy.textContent = `${stats.accuracy}%`;
  finalMistakes.textContent = stats.mistakes;
  finalChars.textContent = stats.totalTyped;

  if (stats.totalTyped === 0) {
    resultMessage.textContent =
      "No characters typed. Try again when you are ready.";
  } else if (stats.accuracy >= 95) {
    resultMessage.textContent =
      "Great accuracy! Keep practicing to build consistency.";
  } else {
    resultMessage.textContent =
      "Keep practicing. Focus on accuracy and your speed can improve over time.";
  }

  statusElement.textContent = "Test completed. Your results are ready.";
  resultCard.hidden = false;

  updatePassageHighlight();
  resultCard.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

function resetTest(useNewPassage = false) {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }

  timeLeft = Number(durationSelect.value);
  startTime = null;
  testRunning = false;
  testFinished = false;

  if (useNewPassage || !targetText) {
    targetText = choosePassage();
  }

  typingInput.value = "";
  typingInput.disabled = false;

  timeElement.textContent = `${timeLeft}s`;
  wpmElement.textContent = "0";
  accuracyElement.textContent = "100";
  mistakesElement.textContent = "0";

  resultCard.hidden = true;
  statusElement.textContent =
    "Ready when you are. Start typing to begin!";

  renderPassage();
}

typingInput.addEventListener("input", () => {
  if (testFinished) return;

  // Do not allow typing beyond the displayed passage.
  if (typingInput.value.length > targetText.length) {
    typingInput.value = typingInput.value.slice(
      0,
      targetText.length
    );
  }

  if (typingInput.value.length > 0 && !testRunning) {
    startTimer();
  }

  updatePassageHighlight();
  updateStats();

  if (typingInput.value.length === targetText.length) {
    finishTest();
  }
});

restartBtn.addEventListener("click", () => {
  resetTest(false);
  typingInput.focus();
});

newPassageBtn.addEventListener("click", () => {
  resetTest(true);
  typingInput.focus();
});

tryAgainBtn.addEventListener("click", () => {
  resetTest(false);
  typingInput.focus();
});

durationSelect.addEventListener("change", () => {
  if (!testRunning && !testFinished) {
    resetTest(false);
  }
});

document.getElementById("year").textContent =
  new Date().getFullYear();

resetTest(true);
