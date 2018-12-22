import * as React from 'react';
import { range, last, random, chunk, flatten } from 'lodash';
import { TetrisBoard } from './TetrisBoard';
import './tetris.css';

type P = {};
export type TetrisState = {
  tick: number;
  board: number[];
  shapeLetter: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
  shapeCoords: { x: number; y: number; };
  orientation: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  gameSpeed: number;
  linesCleared: number;
  gameOver: boolean;
};

const SHAPE_LETTERS: Array<TetrisState["shapeLetter"]> = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
const ORIENTATIONS: Array<TetrisState["orientation"]> = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
const INITIAL_SHAPE_COORDS = { x: 4, y: 1 };
const SHAPE_MAPPINGS = {
  I: {
    UP: [0, -1, 1, 2],
    DOWN: [10, 9, 11, 12],
    LEFT: [0, -10, 10, 20],
    RIGHT: [1, -9, 11, 21]
  },
  O: {
    UP: [0, -10, -9, 1],
    DOWN: [0, -10, -9, 1],
    LEFT: [0, -10, -9, 1],
    RIGHT: [0, -10, -9, 1]
  },
  T: {
    UP: [0, -1, 1, -10],
    DOWN: [0, -1, 1, 10],
    LEFT: [0, -10, 10, -1],
    RIGHT: [0, -10, 10, 1]
  },
  S: {
    UP: [0, -1, -10, -9],
    DOWN: [0, 1, 10, 9],
    LEFT: [0, 1, -10, 11],
    RIGHT: [0, 1, -10, 11]
  },
  Z: {
    UP: [0, -10, -11, 1],
    DOWN: [0, -1, 10, 11],
    LEFT: [0, 1, 10, -9],
    RIGHT: [0, 1, 10, -9]
  },
  J: {
    UP: [0, -1, 1, -11],
    DOWN: [0, -1, 1, 11],
    LEFT: [0, -10, 10, 9],
    RIGHT: [0, -10, 10, -9]
  },
  L: {
    UP: [0, -1, 1, -9],
    DOWN: [0, -1, 1, 9],
    LEFT: [0, -10, 10, -11],
    RIGHT: [0, -10, 10, 11]
  }
}

export class Tetris extends React.Component<P, TetrisState> {
  constructor(props: P) {
    super(props);
    this.state = this.getInitialState();
  }


  public componentDidMount() {
    addEventListener('keydown', this.handleKeyPress);
    this.updateBoard();
  }

  public componentWillUnmount() {
    removeEventListener('keydown', this.handleKeyPress);
  }

  public componentDidUpdate(prevProps: P, prevState: TetrisState) {
    if (this.state.tick !== prevState.tick) {
      this.updateBoard();
    }
  }

  public render() {
    const shapeMappings = this.getShapeMappings();
    return (
      <TetrisBoard
        board={this.state.board}
        shapeMappings={shapeMappings}
        linesCleared={this.state.linesCleared}
        shapeLetter={this.state.shapeLetter}
        gameOver={this.state.gameOver}
        restartGame={this.restartGame}
      />
    )
  }

  private getInitialState = () => ({
    tick: 0,
    board: range(0, 150, 0),
    shapeCoords: INITIAL_SHAPE_COORDS,
    shapeLetter: this.getRandomShape(),
    orientation: 'UP' as TetrisState["orientation"],
    gameSpeed: 1000,
    linesCleared: 0,
    gameOver: false
  });

  private restartGame = () => {
    this.setState({ ...this.getInitialState() })
  }

  // private runGameLoop = (gameSpeed = this.state.gameSpeed) =>
  //   setTimeout(() => this.setState(prevState => ({ tick: prevState.tick + 1 })), gameSpeed);

  private getShapeMappings = (
    shapeCoords: TetrisState["shapeCoords"] = this.state.shapeCoords,
    orientation: TetrisState["orientation"] = this.state.orientation
  ) => {
    const { shapeLetter } = this.state;
    const shapeMappings = SHAPE_MAPPINGS[shapeLetter][orientation] as number[];
    return shapeMappings.map((item) => shapeCoords.x + (shapeCoords.y * 10) + item)
  }

  private checkBoundaries = (
    shapeCoords: TetrisState["shapeCoords"] = this.state.shapeCoords,
    orientation: TetrisState["orientation"] = this.state.orientation
  ) => {
    const { board } = this.state;
    const shapeMappings = this.getShapeMappings(shapeCoords, orientation);
    const directionClear = (shapeBoundary: number[], boardBoundary: number[]) => shapeBoundary
      .filter((i) => shapeMappings.indexOf(i) === -1)
      .map((i) => board[i] === 0 && boardBoundary.indexOf(i) === -1)
      .every(Boolean);
    return {
      leftClear: directionClear(shapeMappings.map(i => i - 1), range(9, 150, 10)),
      rightClear: directionClear(shapeMappings.map(i => i + 1), range(0, 150, 10)),
      bottomClear: directionClear(shapeMappings.map(i => i + 10), range(0, 10, 1))
    }
  }

  private handleKeyPress = (e: any) => {
    const { shapeCoords } = this.state;
    const { leftClear, rightClear, bottomClear } = this.checkBoundaries();
    if (e.code === 'ArrowRight' && rightClear) {
      const newShapeCoords = { ...shapeCoords, x: shapeCoords.x + 1 };
      this.setState({ shapeCoords: newShapeCoords });
    } else if (e.code === 'ArrowLeft' && leftClear) {
      const newShapeCoords = { ...shapeCoords, x: shapeCoords.x - 1 }
      this.setState({ shapeCoords: newShapeCoords });
    } else if (e.code === 'ArrowUp') {
      this.rotateShape();
    } else if (e.code === 'ArrowDown' && bottomClear) {
      this.moveShapeDown();
    }
  }

  private rotateShape = () => {
    const { orientation } = this.state;
    const newOrientation = orientation === last(ORIENTATIONS)
        ? ORIENTATIONS[0]
        : ORIENTATIONS[ORIENTATIONS.indexOf(orientation) + 1];
    
    console.log(
      this.getShapeMappings(),
      this.getShapeMappings(undefined, newOrientation)
    );
    this.setState({ orientation: newOrientation });
  }

  private getRandomShape = () => SHAPE_LETTERS[random(0, SHAPE_LETTERS.length - 1)]

  private moveShapeDown = () => this.setState(prevState => ({
    shapeCoords: { ...prevState.shapeCoords, y: prevState.shapeCoords.y + 1 }
  }));

  private checkForLines = (board: number[]) => {
    const emptyRows = chunk(board, 10).filter(row =>
      row.reduce((acc, curr) => acc + curr, 0) !== 10
    );
    const linesCleared = 15 - emptyRows.length;
    if (linesCleared !== 0) {
      this.setState(prevState => ({
        linesCleared: prevState.linesCleared + linesCleared,
        gameSpeed: prevState.gameSpeed - (10 * linesCleared)
      }));
      for (let i = emptyRows.length; i < 15; i++) {
        emptyRows.unshift(range(0, 10, 0));
      }
    }
    return flatten(emptyRows);
  }

  private updateBoard = () => {
    const { shapeCoords } = this.state;
    const { bottomClear } = this.checkBoundaries();
    let gameOver = false;
    if (bottomClear) {
      this.moveShapeDown();
    } else if (!bottomClear && shapeCoords.y === 1) {
      gameOver = true;
      this.setState({ gameOver });
    } else {
      let newBoard = [...this.state.board];
      const shapeMappings = this.getShapeMappings();
      shapeMappings.forEach(item => newBoard[item] = 1)
      newBoard = this.checkForLines(newBoard);
      this.setState({
        board: newBoard,
        orientation: 'UP',
        shapeCoords: INITIAL_SHAPE_COORDS,
        shapeLetter: this.getRandomShape()
      });
    }
    if (!gameOver) {
      // this.runGameLoop();
      const newBoard = [...this.state.board];
      newBoard[30] = 1;
      newBoard[31] = 1;
      this.setState({ board: newBoard });
    }
  }
}
