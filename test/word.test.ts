import { readFileSync } from 'fs';
import { expect } from 'chai';

import { loadDict, heli, chaiju } from '../src/chaizi';
import { Trie } from '../src/trie';

/* trivial tests to make sure it works */
describe('calculate', function () {
  it('add', function () {
    let result = 5 + 2;
    expect(result).equal(7);
  });
});

/* load json and word txt */
describe('load data', function () {
  it('should load words txt from file', function () {
    let text = readFileSync('./data/w1.dict.utf8', 'utf-8');
    let words = text.split(/\n/);
    expect(words.length).equal(2415);
  });

  it('should load json word dictionary', function () {
    let words = loadDict();
    expect(words['左']['strokes']).equal(5);
  });
});

/* trie */
describe('build trie', function () {
  it('should insert and find the word', function () {
    const t = new Trie();
    t.insert('abc');

    expect(t.contains('a')).equal(false);
    expect(t.contains('abc')).equal(true);
  });

  it('should insert and start with', function () {
    const t = new Trie();
    t.insert('abc');

    expect(t.startsWith('a')).equal(true);
    expect(t.startsWith('ab')).equal(true);
    expect(t.startsWith('bc')).equal(false);
  });
});

/* validate input */
describe('validate characters', function () {
  it('should validate 5 chars', function () {
    const t = new Trie();
    t.insert('野火');
    t.insert('烧');
    t.insert('不尽');

    expect(heli('烧不尽', t)).equal(true);
    expect(heli('野火不尽', t)).equal(true);
    expect(heli('野火烧不尽', t)).equal(true);
    expect(heli('不合法字符', t)).equal(false);
  });

  it('should return status code for guess', function() {
    let status = chaiju('一天的结束', '一天的开始');
    // console.log("status: ", status);
    expect(status[0]).equal(0b1111);
    expect(status[1]).equal(0b1111);
    expect(status[2]).equal(0b1111);
    expect(status[3]).equal(0b0000);
    expect(status[4]).equal(0b0000);
  });
});
