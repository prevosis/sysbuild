import React from 'react';

import TerminalComponent from '../TerminalComponent/TerminalComponent';
import CodeEditor from '../CodeEditor/CodeEditor';
import CompilerControls from '../CodeEditor/Compiler-Controls/Compiler-Controls';

import Jor1kRuntime from '../../lib/jor1k-runtime';

export default function AppComponent() {
  return (<div><CodeEditor /><TerminalComponent /><CompilerControls /></div>);
}
