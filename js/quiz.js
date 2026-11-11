// Learn tab: a short quiz built from the same rules as the checker.
import { makeQuiz, quizAnswer } from "./engine.js";
import { esc, pairCard } from "./render.js";
import { t, pName } from "./i18n.js";

const $box = document.getElementById("quiz");
const TOTAL = 8;
let questions = [];
let index = 0;
let score = 0;

function start() {
  questions = makeQuiz(TOTAL);
  index = 0;
  score = 0;
  ask();
}

function ask() {
  const q = questions[index];
  $box.innerHTML = `
    <p class="meta">${t("quiz.progress", { n: index + 1, total: questions.length })}</p>
    <article class="card quiz-q">
      <p class="quiz-pair"><strong>${esc(pName(q.a))}</strong> + <strong>${esc(pName(q.b))}</strong></p>
      <p>${t("quiz.q")}</p>
      <div class="row">
        <button class="primary" data-answer="no">${t("quiz.no")}</button>
        <button class="primary alt" data-answer="ok">${t("quiz.ok")}</button>
      </div>
    </article>
    <div id="quiz-feedback" aria-live="polite"></div>`;
  $box.querySelector("[data-answer]").focus();
}

function answer(choice) {
  const q = questions[index];
  const right = choice === quizAnswer(q.level);
  if (right) score++;
  for (const b of $box.querySelectorAll("[data-answer]")) b.disabled = true;
  const last = index === questions.length - 1;
  document.getElementById("quiz-feedback").innerHTML = `
    <p class="quiz-mark ${right ? "good" : "bad"}">${right ? "✔ " + t("quiz.right") : "✘ " + t("quiz.wrong")}</p>
    ${pairCard(q.result)}
    <div class="row"><button class="primary" id="quiz-next">${t(last ? "quiz.finish" : "quiz.next")}</button></div>`;
  document.getElementById("quiz-next").focus();
}

function finish() {
  $box.innerHTML = `
    <article class="card ${score >= 6 ? "info" : "warning"}" role="status">
      <p class="verdict">${t("quiz.score", { score, total: questions.length })}</p>
      <p>${t(score >= 6 ? "quiz.great" : "quiz.ok2")}</p>
    </article>
    <div class="row"><button class="primary" id="quiz-start">${t("quiz.again")}</button></div>`;
  document.getElementById("quiz-start").focus();
}

$box.addEventListener("click", (e) => {
  const a = e.target.closest("[data-answer]");
  if (a) return answer(a.dataset.answer);
  if (e.target.closest("#quiz-next")) {
    index++;
    return index < questions.length ? ask() : finish();
  }
  if (e.target.closest("#quiz-start")) start();
});
