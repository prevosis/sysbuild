import React from 'react';

import jor1kGUI from '../../../jor1k/js/master/master';

export default class TerminalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.canvasElem = null;
  }

  render() {
    return (
      <canvas ref={canvasElem => this.canvasElem = canvasElem} />
    );
  }
}
