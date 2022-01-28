// game states
let states: any = {
  tile: 0,
  guess: 0,
  typing: false,
  input: null,
};

export function start() {
  // lock all tiles
  document.querySelectorAll("input[type=text]").forEach(function(e) {
    console.log("lock: " + e);
    locked(e);
  });
  // enable first input
  const curr = currInput();
  wait(curr);
  setListeners(curr);
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
  if (curr != null && curr.value) {
    toNextInput();
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

function autofill(e: HTMLElement) {
  if (states['input']) {
    e.value = states['input'].slice(0, 1);
    states['input'] = states['input'].slice(1, 5 - states['tile']);
  } else {
    e.value = e.value.slice(0, 1);
  }
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

    if (states['input']) {
      curr.value = states['input'].slice(0, 1);
    }
    if (curr.value) {
      curr.value = curr.value.slice(0, 1);
    }
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
function currInput(): HTMLElement | null {
  return document.getElementById(states['tile'].toString());
}

function nextInput(): HTMLElement | null {
  return document.getElementById((states['tile'] + 1).toString());
}

function prevInput(): HTMLElement | null {
  return document.getElementById((states['tile'] - 1).toString());
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

// set tile status

// give hints (text)

// send guess

// fetch answer

// del char
