import { loadDict, buildTrie } from './chaizi';
import { heli, chaiju } from './chaizi';
import { newAnswer } from './generator';

// game states
let states: any = {
  tile: 0,
  guess: 1,
  max_guess: 6,
  typing: false,
  input: null,
  answer: null,
  words: null,
  trie: null,
  over: false,
  win: false,
};

export function start() {
  // lock all tiles
  document.querySelectorAll('input[type=text]').forEach(function (e) {
    console.log('lock: ' + e);
    locked(e);
  });
  // enable first input
  const curr = currInput();
  wait(curr);
  setListeners(curr);
  curr.focus();
  // set submit button
  document.getElementById('submit').addEventListener('click', onFinishGuess);
  // load dict + trie
  states['words'] = loadDict();
  states['trie'] = buildTrie();
  states['answer'] = newAnswer(5, states['trie'], states['words']);

  console.log(states['answer']);
}

function setListeners(e: HTMLElement) {
  if (!e) return;
  e.addEventListener('compositionstart', onInputTyping);
  e.addEventListener('compositionend', onInputDone);
  e.addEventListener('keydown', onDeletePressed);
  e.addEventListener('keydown', OnEnterPressed);
}

function removeListeners(e: HTMLElement) {
  if (!e) return;
  e.removeEventListener('compositionstart', onInputTyping);
  e.removeEventListener('compositionend', onInputDone);
  e.removeEventListener('keydown', onDeletePressed);
  e.removeEventListener('keydown', OnEnterPressed);
}

function onInputTyping(e) {
  states['typing'] = true;
}

function onInputDone(e) {
  states['typing'] = false;
  const str = e.data ?? '';
  if (str.length > 0) {
    states['input'] = str.slice(0, 5);
    toNextInput();
  }
}

function onInputUpdate(e) {
  if (!states['typing']) {
    const str = e.data ?? '';
    if (str.length > 0) {
      toNextInput();
    }
  }
}

function OnEnterPressed(e) {
  if (e.key !== 'Enter') {
    return;
  }
  const curr = currInput();
  const next = nextInput();
  if (curr != null && curr.value) {
    if (next) toNextInput();
    else onFinishGuess();
  }
}

function onDeletePressed(e) {
  if (e.key !== 'Backspace') {
    return;
  }
  const curr = currInput();
  if (curr != null && !curr.value) {
    toPrevInput();
  }
}

function onFinishGuess() {
  const guess = inputString();

  if (guess.length === 5) {
    // the hint elem target
    const target = hintsElem();
    // validate chars
    if (!validChars(guess)) {
      clearHints();
      appendText(target, renderInvalidChars());
      return;
    }
    // validate phrases
    if (!heli(guess, states['trie'])) {
      clearHints();
      appendText(target, renderInvalidPhrase());
      return;
    }
    // give hints, update states
    renderHints(guess);

    if (states['guess'] >= states['max_guess']) {
      states['over'] = true;
    }
    if (!states['over']) {
      toNextGuess();
    } else {
      if (states['win']) renderSuccess();
      else renderAnswer();
    }
  }
}

// Set Game States
function toNextGuess() {
  // lock the last tile
  var curr = currInput();
  // checked(curr);
  removeListeners(curr);
  // change game states
  states['guess'] += 1;
  states['tile'] = 0;
  // enable next tile
  var curr = currInput();
  wait(curr);
  setListeners(curr);
  curr.focus();
}

// Validation
function validChars(s: string): boolean {
  [...s].forEach(function (c) {
    if (!states['words'][c]) return false;
  });
  return true;
}

// Error Message
function renderInvalidChars(): string {
  return '???????????????????????????????????????';
}

function renderInvalidPhrase(): string {
  return '???????????????????????????????????????';
}

function appendText(target: HTMLElement, s: string): HTMLElement {
  const p = document.createElement('p');
  target.appendChild(p);
  p.textContent = s;
  return p;
}

// Render Hints
function clearHints() {
  hintsElem().innerHTML = '';
}

function renderHints(guess: string) {
  // the hint elem target
  const target = hintsElem();
  target.innerHTML = '';
  // get hints
  const hints = chaiju(guess, states['answer'], states['words']);

  if (isWin(hints['exact'])) {
    console.log('you win!');
    states['over'] = true;
    states['win'] = true;
  }

  // render tile color
  const tiles = inputs();
  for (var i = 0; i < 5; i++) {
    const curr = tiles[i];
    checked(curr);
    // exact: ????????????
    if (hints['exact'][i]) {
      correct(curr);
      continue;
    }
    // displaced: ??????????????????????????????
    if (hints['exact'][i + 5]) {
      displaced(curr);
      continue;
    }
    const ss = hints['strokes'][i] || hints['strokes'][i + 5];
    const rs = hints['radicals'][i] || hints['radicals'][i + 5];

    // ????????????????????????
    if (ss && rs) {
      workharder(curr);
      continue;
    }
    // stroke: ????????????
    if (ss) {
      stroke(curr);
      continue;
    }
    // radical: ????????????
    if (rs) {
      radical(curr);
      continue;
    }
    // wrong: ???????????????
    wrong(curr);
  }
}

function renderAnswer() {
  const target = hintsElem();
  target.innerHTML = '';
  appendText(target, '??????????????????' + states['answer']);
}

function renderSuccess() {
  const target = hintsElem();
  target.innerHTML = '';
  appendText(target, '???????????????');
}

// Helper
function autofill(e: HTMLElement) {
  if (states['input']) {
    e.value = states['input'].slice(0, 1);
    states['input'] = states['input'].slice(1, 5 - states['tile']);
  } else {
    e.value = e.value.slice(0, 1);
  }
}
function isWin(hints: Array): boolean {
  for (var i = 0; i < 5; i++) {
    if (!hints[i]) return false;
  }
  return true;
}

// Move Cursor
function toNextInput() {
  const curr = currInput();
  const next = nextInput();

  if (next != null) {
    autofill(curr);

    removeListeners(curr);
    setListeners(next);

    checked(curr);
    wait(next);

    next.focus();
    states['tile'] += 1;

    while (states['input']) {
      toNextInput();
    }
  } else {
    autofill(curr);
    states['input'] = null;
  }
}

function toPrevInput() {
  const curr = currInput();
  const prev = prevInput();

  if (prev != null) {
    removeListeners(curr);
    setListeners(prev);

    locked(curr);
    wait(prev);

    prev.focus();
    states['tile'] -= 1;
  }
}

// Get Input Element
function currGuess(): HTMLElement | null {
  return document.getElementById(states['guess'].toString());
}
function currInput(): HTMLElement | null {
  return inputs()[states['tile']];
}
function nextInput(): HTMLElement | null {
  return inputs()[states['tile'] + 1];
}
function prevInput(): HTMLElement | null {
  return inputs()[states['tile'] - 1];
}
function hintsElem(): HTMLElement | null {
  return document.getElementById('hints');
}
function inputs(): array {
  return document.querySelectorAll('form#guess' + states['guess'] + ' input[type=text]');
}
function inputString(): string {
  return Array.from(inputs())
    .map((e) => e.value)
    .join('');
}

// Change CSS
function wait(e: HTMLElement) {
  if (!e) return;
  e.className = '';
  e.classList.add('wait');
  e.disabled = false;
}

function checked(e: HTMLElement) {
  if (!e) return;
  e.className = '';
  e.classList.add('checked');
  e.disabled = true;
}

function locked(e: HTMLElement) {
  if (!e) return;
  e.className = '';
  e.classList.add('locked');
  e.disabled = true;
}

// Grid Hint Color
function correct(e: HTMLElement) {
  if (!e) return;
  e.classList.add('correct');
}
function radical(e: HTMLElement) {
  if (!e) return;
  e.classList.add('radical');
}
function stroke(e: HTMLElement) {
  if (!e) return;
  e.classList.add('stroke');
}
function wrong(e: HTMLElement) {
  if (!e) return;
  e.classList.add('wrong');
}
function displaced(e: HTMLElement) {
  if (!e) return;
  e.classList.add('displaced');
}
function workharder(e: HTMLElement) {
  if (!e) return;
  e.classList.add('workharder');
}

// Answers
function generateAns() {
  // local mode
}

function fetchAns() {
  // online mode
}
