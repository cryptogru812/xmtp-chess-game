import { useState } from "react";

import GameBoard from "./GameBoard";
import { CONNECT_STATUS, GAME_STATUS } from "../utils/enum";

function GameContainer({ connectStatus, currMove, lastMove, sendMove, player, gameOver, endGame }) {
    const connectToGameStatus = {
        [CONNECT_STATUS.INVITE]: GAME_STATUS.WAITING,
        [CONNECT_STATUS.ACCEPT]: GAME_STATUS.PLAYING,
        [CONNECT_STATUS.DECLINE]: GAME_STATUS.OVER,
        [CONNECT_STATUS]: GAME_STATUS.OVER,
    };
    const statusToMessage = {
        [GAME_STATUS.WHITE_TURN]: "White's turn",
        [GAME_STATUS.BLACK_TURN]: "Black's turn",
        [GAME_STATUS.WAITING]: "Waiting on opponent to accept",
        [GAME_STATUS.CHEAT]: "Game Over: Player Cheated",
        [GAME_STATUS.CHECKMATE]: 'Game Over: Checkmate',
        [GAME_STATUS.STALEMATE]: "Game Over: Stalemate",
    };

    const [gameStatus, setGameStatus] = useState(connectToGameStatus[connectStatus]);
    const message = statusToMessage[gameStatus]

    return (
        <div className="w-[85%] md:w-[85%] xl:w-[75%] h-full mx-auto">
            <div className="text-center text-xl pb-2">
                {message}
            </div>
            <GameBoard
                status={gameStatus}
                currMove={currMove}
                lastMove={lastMove}
                sendMove={sendMove}
                player={player}
                setStatus={setGameStatus}
                gameOver={gameOver}
                endGame={endGame}
            />
        </div>
    );
}

export default GameContainer;
