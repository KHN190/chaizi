import { buildTrie, w2 } from './chaizi';

var fs = require('fs');

// 停用词
const stops = '一二三四五六七八九十个了的之是吗嘛哈有那哪这';

function randomPick(lst: Array, range: number): string {
  return lst[Math.min(lst.length, range) * Math.random() << 0]
}

function randomWord(words: any): string {
  const keys = Object.keys(words);
  return randomPick(keys, keys.length);
}

function randomWordExceptStops(words: any): string {
  var res = randomWord(words);
  while (stops.includes(res)) {
    res = randomWord(words);
  }
  return res
}

// brute force generator
export function newAnswer(len: number, t: Trie, words: any): string {
  const all = fs.readFileSync('./data/huajian.utf8', 'utf-8').split(/\n/);
  return randomPick(all, all.length);
}
