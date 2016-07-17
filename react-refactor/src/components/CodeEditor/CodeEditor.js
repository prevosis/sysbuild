import React from 'react';
import AceEditor from 'react-ace';
import brace from 'brace';

import 'brace/mode/c_cpp';
import 'brace/theme/monokai';

import CompilerControls from './Compiler-Controls/Compiler-Controls';

console.log(CompilerControls);

export default class CodeEditor extends React.Component {
  render() {
    return (
      <div id="editor">
        <AceEditor
          mode="c_cpp"
          theme="monokai" />
        <CompilerControls />
      </div>
    )
  }
}
