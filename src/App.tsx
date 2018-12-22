import * as React from 'react';
import './App.css';

import { Tetris } from './component/Tetris';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Tetris />
      </div>
    );
  }
}

export default App;
