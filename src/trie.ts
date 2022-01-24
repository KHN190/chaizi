// Reference: https://github.com/chriswheeldon/trie.ts

class TrieNode {
  public terminal: boolean;
  public children: Map<string, TrieNode>;

  constructor() {
    this.terminal = false;
    this.children = new Map();
  }
}

export class Trie {
  private root: TrieNode;
  private elements: number;

  constructor() {
    this.root = new TrieNode();
    this.elements = 0;
  }

  public get length(): number {
    return this.elements;
  }

  // check if we find a word
  public contains(key: string): boolean {
    const node = this.getNode(key);
    return node !== null && node.terminal;
  }

  // start with a pattern?
  public startsWith(key: string): boolean {
    const node = this.getNode(key);
    return node !== null;
  };

  // insert a word by char
  public insert(key: string): void {
    let node = this.root;
    let remain = key;

    while (remain.length > 0) {
      let child: TrieNode = null;
      let childKey: string = remain.slice(0, 1);
      child = node.children.get(childKey);
      if (!child) {
        child = new TrieNode();
        node.children.set(childKey, child);
      }
      remain = remain.slice(1);
      node = child;
    }

    if (!node.terminal) {
      node.terminal = true;
      this.elements += 1;
    }
  }

  private getNode(key: string): TrieNode | null {
    let node = this.root;
    let remain = key;

    while (node && remain.length > 0) {
      let child = null;
      for (let i = 1; i <= remain.length; i += 1) {
        child = node.children.get(remain.slice(0, i));
        if (child) {
          remain = remain.slice(i);
          break;
        }
      }
      node = child;
    }
    return remain.length === 0 ? node : null;
  }
}
