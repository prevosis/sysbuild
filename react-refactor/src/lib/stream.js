export class StringStream {
  constructor() {
    this.chunkBuffer = [];
    this.bufSize = 0;
    this.pos = 0;
  }

  _bufferChunk(chunk) {
    this.chunkBuffer.push(chunk);
  }

  write(chunks, size=null) {
    let sizeWritten = 0;

    if (size === null) {
      for (c of (Array.isArray(chunks) ? chunks : [chunks])) {
        this._bufferChunk(c);
        sizeWritten += c.length;
      }
    } else {
      for (c of (Array.isArray(chunks) ? chunks : [chunks])) {
        if ((sizeWritten + c.length) <= size) {
          this._bufferChunk(c);
          sizeWritten += c.length;
        } else {
          let remainingSize = size - sizeWritten;
          if (size === 0) break;
          this._bufferChunk(c.substr(0, remainingSize));
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
