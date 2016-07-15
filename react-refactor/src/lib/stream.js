export class Stream {
  constructor() {
    this.chunkBuffer = [];
    this.bufSize = 0;
    this.pos = 0;
    this.pendingReads = [];
  }

  bufferChunk(chunk) {
    this.chunkBuffer.push(chunk);
  }

  chunkSize(chunk) { return 1; }
  partialChunk(chunk, size) { return chunk; }

  write(chunks, size=null) {
    let sizeWritten = 0;

    if (size === null) {
      for (c of (Array.isArray(chunks) ? chunks : [chunks])) {
        this.bufferChunk(c);
        sizeWritten += this.chunkSize(c);
      }
    } else {
      for (c of (Array.isArray(chunks) ? chunks : [chunks])) {
        if ((sizeWritten + this.chunkSize(c)) <= size) {
          this.bufferChunk(c);
          sizeWritten += this.chunkSize(c);
        } else {
          let remainingSize = size - sizeWritten;
          if (remainingSize === 0) break;
          this.bufferChunk(c.substr(0, remainingSize));
          sizeWritten += remainingSize;
          break;
        }
      }
    }

    this.bufSize += sizeWritten;
    return sizeWritten;
  }

  read(size) {

  }
}
