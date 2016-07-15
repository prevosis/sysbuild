const noop = () => {};

export class Stream {
  constructor(processChunk) {
    this.processChunk = processChunk;
    this.chunkList = null;
    this._tail = null;
  }

  _newNode(chunk) {
    return { chunk, next: null };
  }

  empty() {
    return !this.chunkList;
  }

  write(chunk) {
    let newNode = this._newNode(chunk);

    if (!this.empty()) {
      this._tail = this._tail.next = newNode;
    } else {
      this.chunkList = this._tail = newNode;
    }

    return this;
  }

  advance(n) {
    let i;
    for (i = 0; this.chunkList && (i < n); ++i) {
      this.processChunk = this.processChunk(this.chunkList.chunk)
      this.chunkList = this.chunkList.next;
    }
     
    return i;
  }
}
