import React from 'react';

export default class CompilerControls extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit();
  }

  render() {
    return (
      <button className="compiler-controls" onClick={this.handleSubmit}>Submit</button>
    );
  }
}
