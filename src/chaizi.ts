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
export function validate(guess: string, t: Trie): boolean {
  // dfs if we can reach the end
  // @todo
  return true;
}

function dfsValid(remain: string, t: Trie): boolean {
  if (remain.length === 0) {
    return true;
  }
  // @todo
  return false;
}