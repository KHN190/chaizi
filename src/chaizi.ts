import { Trie } from './trie';
import ws from './data/word.min.json';

var fs = require('fs');
const w1 = fs.readFileSync('./data/w1.dict.utf8', 'utf-8').split(/\n/);
const w2 = fs.readFileSync('./data/w2.dict.utf8', 'utf-8').split(/\n/);

// load char dictionary
// build phrase trie
const words = loadDict();
const trie = buildTrie();

const notNull = (e: any) => e != null;

// load character dictionary with strokes + radicals
export function loadDict(): any {
  let words: any = {};
  ws.forEach(function (w) {
    words[w['word']] = {
      strokes: Number(w['strokes']),
      radicals: w['radicals'],
    };
  });
  return words;
}

// build trie using phrases
export function buildTrie(): Trie {
  const t = new Trie();
  w1.forEach(function (w) {
    t.insert(w);
  });
  w2.forEach(function (w) {
    t.insert(w);
  });
  return t;
}

// assume they are both same length
// assume they are already validated, all in words dict
//
// exact match?
// 0..m 是位置正确的匹配，m..2m 是笔画正确但位置不正确
export function chaiju(curr: string, answer: string): any {
  const m = curr.length;

  let hints: any = {
    radicals: new Array(m * 2),
    strokes: new Array(m * 2),
    exact: new Array(m * 2),
  };

  for (var i = 0; i < m; i++) {
    for (var j = 0; j < m; j++) {
      const c1 = curr.slice(i, i + 1);
      const c2 = answer.slice(j, j + 1);

      if (hintExact(c1, c2)) {
        if (i === j) {
          hints['exact'][i] = true;
          hints['exact'][i + m] = false;
        } else {
          hints['exact'][i] = false;
          hints['exact'][i + m] = true;
        }
      }
      if (hintRadical(c1, c2)) {
        if (i === j) {
          hints['radicals'][i] = words[c1]['radicals'];
          hints['radicals'][i + m] = null;
        } else {
          hints['radicals'][i + m] = words[c1]['radicals'];
          hints['radicals'][i] = null;
        }
      }
      if (hintStroke(c1, c2)) {
        if (i === j) {
          hints['strokes'][i] = words[c1]['strokes'];
          hints['strokes'][i + m] = null;
        } else {
          hints['strokes'][i + m] = words[c1]['strokes'];
          hints['strokes'][i] = null;
        }
      }
    }
  }
  return hints;
}

export function buildHintsText(hints: any): string {
  const m = hints['exact'].length / 2;
  let res: string = '';

  // chars
  res += '正确：';
  for (var i = 0; i < m; i++) {
    res += hints['exact'][i] ?? '﹏';
    res += ' ';
  }
  res += '\n';

  // radicals
  res += '部首：';
  res += hints['radicals']
    .slice(0, m)
    .map(function (v: string) {
      if (v === null) return '﹏';
      return v;
    })
    .join(' ');

  if (hints['radicals'].slice(m).some(notNull)) {
    res += ' (其他部首：';
    res += [...new Set(hints['radicals'].slice(m).filter(notNull))].join(' ');
    res += ')';
  }
  res += '\n';

  // strokes
  res += '笔画：';
  res += hints['strokes']
    .slice(0, m)
    .map(function (v: number) {
      if (v === null) return '﹏';
      // if (v < 10) return '0' + v;
      return v;
    })
    .join(' ');

  if (hints['strokes'].slice(m).some(notNull)) {
    res += ' (其他笔画：';
    res += [...new Set(hints['strokes'].slice(m).filter(notNull))].join(' ');
    res += ')';
  }
  res += '\n';

  return res;
}

function hintExact(c1: string, c2: string): boolean {
  return c1 === c2;
}

function hintStroke(c1: string, c2: string): boolean {
  return words[c1]['strokes'] === words[c2]['strokes'];
}

function hintRadical(c1: string, c2: string): boolean {
  return words[c1]['radicals'] === words[c2]['radicals'];
}

function chaizi(c1: string, c2: string): number {
  let status = 0b000;
  if (words[c1]['radicals'] === words[c2]['radicals']) {
    status |= 0b001;
  }
  if (words[c1]['strokes'] === words[c2]['strokes']) {
    status |= 0b010;
  }
  if (words[c1] === words[c2]) {
    status |= 0b111;
  }
  return status;
}

// check if guess is grammarly correct using a trie
export function heli(remain: string, t: Trie): boolean {
  return _heli(remain, t, 5);
}

// dfs if we can reach the end
function _heli(remain: string, t: Trie, iter: number): boolean {
  // if contains remain, return true
  // if contains prefix, return validate(remain - prefix)
  const n = remain.length;
  if (n === 0) return true;
  if (iter <= 0) return false;

  if (t.contains(remain)) {
    return true;
  }

  if (n >= 1 && t.contains(remain.slice(0, 1))) {
    return _heli(remain.slice(1), t, iter - 1);
  }
  if (n >= 2 && t.contains(remain.slice(0, 2))) {
    return _heli(remain.slice(2), t, iter - 1);
  }
  return false;
}
