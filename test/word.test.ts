import { readFileSync } from 'fs';
import { expect } from 'chai';

import { loadDict, chaizi, validate } from '../src/chaizi';
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
describe('build trie', function() {
  it('should insert and find the word', function() {
    const t = new Trie();
    t.insert('abc');
    expect(t.contains('a')).equal(false);
    expect(t.contains('abc')).equal(true);
  });

  it('should insert and start with', function() {
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
    expect(validate('野火烧不尽', t)).equal(true);
  });
});
