import { readFileSync } from 'fs';
import { Trie } from './trie';

import ws from '../data/word.min.json';
const w1 = readFileSync('./data/w1.dict.utf8', 'utf-8').split(/\n/);
const w2 = readFileSync('./data/w2.dict.utf8', 'utf-8').split(/\n/);

// load char dictionary
// build phrase trie
const words = loadDict();
const trie = buildTrie();

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

export function hanzi(curr: string) {}

// 部首正确: 0001
// 笔画正确: 0010
// 字符正确: 0111
// 位置正确: 1000
//
// assume they are both same length
// assume they are already validated, all in words dict
export function chaiju(guess: string, answer: string): number[] {
  const m = Math.min(guess.length, answer.length);
  let res: number[] = new Array(m);
  for (var i = 0; i < m; i++) {
    for (var j = 0; j < m; j++) {
      const c1 = guess.slice(i, i + 1);
      const c2 = answer.slice(j, j + 1);
      // exact match includes position
      if (c1 === c2 && i === j) {
        res[i] = 0b1111;
        continue;
      }
      // compare strokes and radicals
      res[i] |= chaizi(c1, c2, words);
    }
  }
  return res;
}

function chaizi(a: string, b: string, words: any): number {
  let status = 0b000;
  if (words[a]['radicals'] === words[b]['radicals']) {
    status |= 0b001;
  }
  if (words[a]['strokes'] === words[b]['strokes']) {
    status |= 0b010;
  }
  if (words[a] === words[b]) {
    status |= 0b111;
  }
  return status;
}

// check if guess is grammarly correct using a trie
export function heli(remain: string, t: Trie): boolean {
  return _heli(remain, t, 3);
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
