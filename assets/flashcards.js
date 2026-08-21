(function () {
  function normalize(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s\[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // "el hermano / la hermana" should also accept just one of the halves.
  function acceptedAnswers(spanish) {
    const parts = spanish.split("/").map((p) => p.trim()).filter(Boolean);
    return [spanish].concat(parts.length > 1 ? parts : []).map(normalize);
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function vocabUpTo(lessonId) {
    const vocab = window.lessonVocab || {};
    return Object.keys(vocab)
      .sort()
      .filter((id) => id <= lessonId)
      .reduce((all, id) => all.concat(vocab[id]), []);
  }

  function init() {
    const root = document.getElementById("flashcards");
    if (!root || !window.lessonVocab) {
      return;
    }

    const lessonId = root.getAttribute("data-lesson");
    const lessonCards = (window.lessonVocab[lessonId] || []).slice();
    const cumulativeCards = vocabUpTo(lessonId);

    const startLessonBtn = root.querySelector("[data-action='start-lesson']");
    const startAllBtn = root.querySelector("[data-action='start-cumulative']");
    const session = root.querySelector("[data-role='session']");
    const progress = root.querySelector("[data-role='progress']");
    const promptEl = root.querySelector("[data-role='prompt']");
    const input = root.querySelector("[data-role='answer']");
    const feedback = root.querySelector("[data-role='feedback']");
    const checkBtn = root.querySelector("[data-action='check']");
    const nextBtn = root.querySelector("[data-action='next']");
    const summary = root.querySelector("[data-role='summary']");

    let deck = [];
    let index = 0;
    let correct = 0;
    let answered = false;

    const MAX_CUMULATIVE = 20;

    function showCard() {
      answered = false;
      const card = deck[index];
      progress.textContent = "Card " + (index + 1) + " of " + deck.length;
      promptEl.textContent = card.en;
      input.value = "";
      input.disabled = false;
      feedback.textContent = "";
      feedback.className = "feedback";
      checkBtn.hidden = false;
      nextBtn.hidden = true;
      nextBtn.textContent = index === deck.length - 1 ? "Finish" : "Next";
      input.focus();
    }

    function check() {
      if (answered) {
        return;
      }
      answered = true;
      const card = deck[index];
      const isCorrect = acceptedAnswers(card.es).includes(normalize(input.value));
      if (isCorrect) {
        correct += 1;
        feedback.className = "feedback ok";
        feedback.textContent = "Correct: " + card.es;
      } else {
        feedback.className = "feedback warn";
        feedback.textContent = "Correct answer: " + card.es;
      }
      input.disabled = true;
      checkBtn.hidden = true;
      nextBtn.hidden = false;
      nextBtn.focus();
    }

    function next() {
      if (index === deck.length - 1) {
        finish();
        return;
      }
      index += 1;
      showCard();
    }

    function finish() {
      session.hidden = true;
      summary.hidden = false;
      summary.className = "feedback " + (correct === deck.length ? "ok" : "warn");
      summary.textContent = "Session complete: " + correct + "/" + deck.length + " correct.";
    }

    function start(cards, limit) {
      if (!cards.length) {
        return;
      }
      deck = shuffle(cards).slice(0, limit || cards.length);
      index = 0;
      correct = 0;
      summary.hidden = true;
      session.hidden = false;
      showCard();
    }

    startLessonBtn.addEventListener("click", () => start(lessonCards));
    startAllBtn.addEventListener("click", () => start(cumulativeCards, MAX_CUMULATIVE));
    checkBtn.addEventListener("click", check);
    nextBtn.addEventListener("click", next);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        check();
      }
    });

    startAllBtn.textContent =
      "Review flashcards (this + previous lessons, " +
      Math.min(MAX_CUMULATIVE, cumulativeCards.length) +
      " random cards)";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
