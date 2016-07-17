import React from 'react';
import AceEditor from 'react-ace';
import brace from 'brace';

import 'brace/mode/c_cpp';
import 'brace/theme/monokai';

import CompilerControls from './Compiler-Controls/Compiler-Controls';

export default class CodeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmission = this.handleSubmission.bind(this);
  }

  handleChange(newValue) {
    console.log('change', newValue);
    this.state = { text: newValue };
  }

  handleSubmission() {
    alert(this.state.text);
  }

  render() {
    return (
      <div id="editor">
        <AceEditor
          mode="c_cpp"
          theme="monokai"
          onChange={this.handleChange} />
        <CompilerControls
          onSubmit={this.handleSubmission} />
      </div>
    )
  }
}
