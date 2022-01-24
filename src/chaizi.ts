import { readFileSync } from 'fs';
import { Trie } from './trie';

import ws from '../data/word.min.json';
const w1 = readFileSync('./data/w1.dict.utf8', 'utf-8').split(/\n/);
const w2 = readFileSync('./data/w2.dict.utf8', 'utf-8').split(/\n/);

// build trie using w1, w2

// load character dictionary
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

export function hanzi(curr: string) {}

export function chaizi(guess: string[]): boolean {
  // 1 2 2
  // 2 1 2
  // 2 2 1
  return false;
}

// check if guess is grammarly correct using a trie
// dfs if we can reach the end
export function validate(remain: string, t: Trie): boolean {
  // if contains remain, return true
  // if contains prefix, return dfsValid(remain - prefix)
  const n = remain.length;
  if (n === 0) {
    return true;
  }
  if (t.contains(remain)) {
    return true;
  }
  if (t.contains(remain.slice(0, 1))) {
    return validate(remain.slice(1), t);
  }
  if (n >= 2 && t.contains(remain.slice(0, 2))) {
    return validate(remain.slice(2), t);
  }
  return false;
}