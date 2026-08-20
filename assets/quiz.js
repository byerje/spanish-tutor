function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreQuiz(items) {
  let correct = 0;
  const details = [];

  items.forEach((item) => {
    const user = normalize(item.userAnswer());
    const answers = item.accepted.map(normalize);
    const isCorrect = answers.includes(user);
    if (isCorrect) {
      correct += 1;
    }
    details.push({ prompt: item.prompt, isCorrect, expected: item.accepted[0], user: item.userAnswer() });
  });

  return { correct, total: items.length, details };
}

window.quizHelpers = { scoreQuiz };
