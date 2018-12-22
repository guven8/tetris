import * as React from 'react';
import { TetrisState } from './Tetris';

type P = {
  board: TetrisState["board"];
  shapeMappings: number[];
  linesCleared: TetrisState["linesCleared"];
  shapeLetter: TetrisState["shapeLetter"];
  gameOver: TetrisState["gameOver"];
  restartGame: () => void;
}

export class TetrisBoard extends React.Component<P> {
  public render() {
    const { board, shapeMappings, linesCleared, gameOver, restartGame } = this.props;
    const newBoard = [...board];
    shapeMappings.forEach(i => { newBoard[i] = 1; });
    return (
      <>
        <p>Lines: {linesCleared}</p>
        {gameOver && (
          <div className="tetris__game-over">
            <h4 className="tetris__game-over__heading">Game Over</h4>
            <p className="tetris__game-over__score">You scored: {linesCleared}</p>
            <button onClick={restartGame}>Play again ?</button>
          </div>
        )}
        <div className="tetris__board">
          {newBoard.map((cell, i) =>
            <span
              key={i}
              className={`tetris__cell ${cell === 1 ? '__shape' : ''}`}
            />
          )}
        </div>
      </>
    )
  }
}
