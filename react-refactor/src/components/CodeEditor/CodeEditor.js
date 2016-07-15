import React from 'react';
import AceEditor from 'react-ace';
import brace from 'brace';

import 'brace/mode/c_cpp';
import 'brace/theme/monokai';

export default class CodeEditor extends React.Component {
  render() {
    return (
      <div>
        <AceEditor
          mode="c_cpp"
          theme="monokai"/>
      </div>
    )
  }
}
