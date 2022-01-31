import { loadDict, buildTrie } from './chaizi';
import { heli, chaiju, buildHintsText } from './chaizi';
import { hintExact, hintStroke, hintRadical } from './chaizi';

// game states
let states: any = {
  tile: 0,
  guess: 1,
  max_guess: 6,
  typing: false,
  input: null,
  answer: '一三二四五',
  dict: null,
  trie: null,
  over: false,
  win: false,
};

// 停用词
const stops = '一二三四五六七八九十个了的之是吗嘛哈有那哪这';

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
  states['dict'] = loadDict();
  states['trie'] = buildTrie();
}

function restart() {
  // @todo
  states['answer'] = '';
  states['over'] = false;
  // clear all tiles
  // reload page?
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
    if (!states['dict'][c]) return false;
  });
  return true;
}

// Error Message
function renderInvalidChars(): string {
  return '答案包含的字符不在字典里。';
}

function renderInvalidPhrase(): string {
  return '答案包含的词语不在字典里。';
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
  const hints = chaiju(guess, states['answer']);

  if (isWin(hints)) {
    states['over'] = true;
    states['win'] = true;
  }

  // render tile color
  const tiles = inputs();
  for (var i = 0; i < 5; i++) {
    const curr = tiles[i];
    checked(curr);
    // exact: 字符正确
    if (hints['exact'][i]) {
      correct(curr);
      continue;
    }
    // displaced: 字符正确，但位置错误
    if (hints['exact'][i + 5]) {
      displaced(curr);
      continue;
    }
    const ss = hints['strokes'][i] || hints['strokes'][i + 5];
    const rs = hints['radicals'][i] || hints['radicals'][i + 5];

    // 笔画和部首都正确
    if (ss && rs) {
      workharder(curr);
      continue;
    }
    // stroke: 笔画正确
    if (ss) {
      stroke(curr);
      continue;
    }
    // radical: 部首正确
    if (rs) {
      radical(curr);
      continue;
    }
    // wrong: 完全不正确
    wrong(curr);
  }
}

function renderAnswer() {
  const target = hintsElem();
  target.innerHTML = '';
  appendText(target, '正确答案是：' + states['answer']);
}

function renderSuccess() {
  const target = hintsElem();
  target.innerHTML = '';
  appendText(target, '回答正确！');
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
