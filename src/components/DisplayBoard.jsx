import { INDEX_TO_COL, INDEX_TO_ROW } from '../utils/enum';
import BoardManager from '../utils/managers/BoardManager';

function Board({ board }) {
    const squares = [];

    for (let row = 0; row < 8; row += 1) {
        for (let col = 7; col > -1; col -= 1) {
            const chessRow = INDEX_TO_ROW[row];
            const chessCol = INDEX_TO_COL[col];
            const chessPos = chessCol + chessRow;
            const bgColor = (row + col) % 2 === 0 ? 'bg-checker1' : 'bg-checker2';

            const image = BoardManager.getImageClass(board[chessPos]);

            squares.push(
                <div
                    className={`${bgColor} ${image}`}
                />
            );
        }
    }

    return (
        <div className='display_board grid grid-cols-8 aspect-square rounded-md'>
            {...squares}
        </div>
    );
}

export default Board
