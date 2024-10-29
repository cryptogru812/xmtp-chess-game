import { CONNECT_STATUS, GAME_STATUS, MESSAGE, PIECE_COLORS } from "../enum";
import { getContent, isGameContent, isConnectStatus, createGameMessage } from "../message/message";
import BoardManager from "./BoardManager";

class GameManager {
    /**
     * The constructor for the GameManager class
     * 
     * @param {import("../../types").GameMessage} lastMove The last move made by the opponent
     * @param {import("../../types").GameMessage} currMove The current move made by the opponent
     * @param {CONNECT_STATUS[keyof CONNECT_STATUS]} status The current status of the game 
     * @param {String} playerAddr The address of the player
     * @param {PIECE_COLORS[keyof PIECE_COLORS]} playerColor The color of the player
     * @param {String} hash The hash of the game
     */
    constructor(lastMove, currMove, status, playerAddr, playerColor, hash) {
        this.lastMove = lastMove;
        this.currMove = currMove;
        this.status = status;
        this.playerAddr = playerAddr;
        this.playerColor = playerColor;
        this.hash = hash;
    }

    /**
     * Determines the connect status of the game. If the game is over, it will determine
     * the game status that caused the end of the game.
     * 
     * @private
     * @param {{
     *   setLastMove: Function,
     *   setCurrMove: Function,
     *   setSendData: Function,
     * }} sets The object containing the functions to set the last move, current move, and send data
     * @param {String} content The content of the message
     * @param {import('@xmtp/react-sdk').MessageV2} nextMessage The next message
     */
    determineStatus(sets, content, nextMessage) {
        if (this.isGameOver() || nextMessage.senderAddress === this.playerAddr) {
            return;
        }

        const [connectStatus,] = content.split(MESSAGE.GAME_DELIMITER);

        if (connectStatus === CONNECT_STATUS.GAME_OVER) {
            let determinedGameStatus = this.determineGameStatus();

            sets.setSendData(createGameMessage(this.hash, CONNECT_STATUS.GAME_OVER, determinedGameStatus));
        }
    }

    /**
     * Determines the game status that caused the end of the game
     * 
     * @private
     * @returns {GAME_STATUS[keyof GAME_STATUS]} The game status that caused the end of the game
     */
    determineGameStatus() {
        const manager = new BoardManager(this.lastMove, this.currMove, undefined, this.status, this.playerColor);
        let gameStatus = undefined;

        manager.getStatus((status) => gameStatus = status, () => { }, () => { }, () => { });

        return gameStatus;
    }

    /**
     * Updates the information of the game
     * 
     * @param {{
     *   setLastMove: Function,
     *   setCurrMove: Function,
     *   setStatus: Function,
     *   setSendData: Function,
     * }} sets The object containing the functions to set the last move, current move, status, and send data
     * @param {import('@xmtp/react-sdk').MessageV2} nextMessage The next message
     */
    updateStatus(sets, nextMessage) {
        if (isGameContent(nextMessage.content)) {
            if (getContent(nextMessage.content) !== this.currMove) {
                sets.setLastMove(this.currMove);
                sets.setCurrMove(getContent(nextMessage.content));
                this.lastMove = this.currMove;
                this.currMove = getContent(nextMessage.content);
            }
        } else if (isConnectStatus(nextMessage.content)) {
            const content = getContent(nextMessage.content);

            this.determineStatus(sets, content, nextMessage);
        } else {
            sets.setStatus(CONNECT_STATUS.END);
        }
    }

    /**
     * Ends the game
     * 
     * @param {{
     *   setStatus: Function,
     *   setSendData: Function,
     * }} sets The object containing the functions to set the status and send data
     * @param {GAME_STATUS[keyof GAME_STATUS]} gameStatus The game status that caused the end of the game
     */
    endGame(sets, gameStatus) {
        if (!this.isGameOver()) {
            this.status = CONNECT_STATUS.GAME_OVER;
            sets.setStatus(CONNECT_STATUS.GAME_OVER);

            sets.setSendData(createGameMessage(this.hash, this.status, gameStatus));
        }
    }

    /**
     * Determines if the game is over
     * 
     * @returns {Boolean} Whether the game is over
     */
    isGameOver() {
        return [CONNECT_STATUS.GAME_OVER, CONNECT_STATUS.END].includes(this.status);
    }
}

export default GameManager;
