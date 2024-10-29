import { BOARD_COL_LABELS, BOARD_ROW_LABELS } from "../enum";
import {
    PIECE_COLORS, PIECE_VALUES, GAME_STATUS,
    INDEX_TO_ROW, INDEX_TO_COL, ROW_TO_INDEX,
    COL_TO_INDEX, CAPTURED_PIECE, ACTION_TYPES
} from "../enum";
import { executeAction, isAction, isTurn, noMoreActions, validateAction } from "../game/action";
import { getPieceAt, getTurnInfo, isSafe, validateMove } from "../game/board";
import { getNextTurn, getPlayerFromMessage, validateTurnContinuity } from "../game/message";
import { getEnemyColor, isPawn, isPiece, isWhite, ownsPiece } from "../game/piece";
import { translateTurnToMessage } from "../game/translate";

class BoardManager {
    /**
     * Gets the image class for the given piece
     * 
     * @param {import("../../types").Piece?} piece The piece to get the image class for
     * @param {import("../../types").PawnRegistry} pawnRegistry The pawn registry to get the transformed value from
     * @returns {String} The image class for the given piece
     */
    static getImageClass(piece, pawnRegistry = {}) {
        if (!piece) {
            return "";
        }

        // Determines the color of the piece
        const color = isWhite(piece) ? "white" : "black";

        // If the piece is not a pawn, the image class is the color and type of the piece
        // otherwise check the pawn registry for the transformed value or use the pawn value
        if (!isPawn(piece)) {
            const type = Object.entries(PIECE_VALUES).find(([, value]) => value === piece[1]);

            if (color && type) {
                return `${color}_${type[0].toLowerCase()}`;
            }
        } else {
            const transformedType = pawnRegistry[piece] || piece[1];
            const type = Object.entries(PIECE_VALUES).find(([, value]) => value === transformedType);

            if (color && type) {
                return `${color}_${type[0].toLowerCase()}`;
            }
        }
    }

    /**
     * The constructor for the BoardManager class
     * 
     * @param {import("../../types").GameMessage} lastMove The last move made in the game
     * @param {import("../../types").GameMessage} currentMove The current move made in the game
     * @param {String} selectedTile The tile selected by the player
     * @param {GAME_STATUS[keyof GAME_STATUS]} status The current status of the game
     * @param {PIECE_COLORS[keyof PIECE_COLORS]} player The player's color
     * @param {Boolean} gameOver Whether the game is over or not
     * @param {String} enPassant The position of the pawn that gave an en passant opportunity
     */
    constructor(lastMove, currentMove, selectedTile, status, player, gameOver, enPassant) {
        this.lastMove = lastMove;
        this.currentMove = currentMove;
        this.selectedTile = selectedTile;
        this.status = status;
        this.player = player;
        this.actions = {};
        this.gameOver = gameOver;
        this.enPassant = enPassant;
    }

    /**
     * Validates the last and current moves
     * 
     * @param {PIECE_COLORS[keyof PIECE_COLORS]} playerColor The color of the player who made the move
     * @param {Function} setEnPassant The function to set the en passant position
     * @returns {String?} The error message if the move is invalid
     */
    validatePlayerMove(playerColor, setEnPassant) {
        // Validates the continuity of the turn
        const { error: cError, data: cData } = validateTurnContinuity(this.lastMove, this.currentMove);
        if (cError) {
            return cError;
        }

        // Validates the action made
        const { error: pError, data: pData } = validateAction(cData);
        if (pError) {
            return pError;
        }

        // Generates the last turn board
        const lastBoard = Object.entries(cData.last.positions).reduce((acc, [piece, pos]) => {
            if (pos !== CAPTURED_PIECE) {
                acc[pos] = piece;
            }

            return acc;
        }, {});

        // Validates the action executed
        const { error: mError } = validateMove(
            lastBoard,
            pData,
            cData.last.canCastle[playerColor],
            cData.last.pawnRegistry,
            cData.last.positions[playerColor + PIECE_VALUES.KING],
            undefined,
            this.enPassant,
        );
        if (mError) {
            return mError;
        }

        // Generates the current turn board
        this.board = Object.entries(cData.curr.positions).reduce((acc, [piece, pos]) => {
            if (pos !== CAPTURED_PIECE) {
                acc[pos] = piece;
            }

            return acc;
        }, {});
        this.positions = cData.curr.positions;
        this.pawnRegistry = cData.curr.pawnRegistry;
        this.canCastle = cData.curr.canCastle;
        this.enPassant = pData.enPassant;

        // Updates the en passant position if an opening move was made
        setEnPassant(pData.enPassant);
    }

    /**
     * Validates the last and current moves for the opponent. Additionally, checks if the player's
     * king is in danger
     * 
     * @param {PIECE_COLORS[keyof PIECE_COLORS]} opponentColor The color of the opponent
     * @param {Function} setEnPassant The function to set the en passant position
     * @returns {String?} The error message if the move is invalid
     */
    validateOpponentMove(opponentColor, setEnPassant) {
        const error = this.validatePlayerMove(opponentColor, setEnPassant);
        if (error) {
            return error;
        }

        // Checks if the player's king is in danger
        if (!isSafe(this.board, this.positions[opponentColor + PIECE_VALUES.KING])) {
            return GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.CHECKMATE, this.player);
        }
    }

    /**
     * Gets the status of the game
     * 1. Get who made the current move
     *  2. If it was the player
     *  2a. Check the validity of the move, if it's not valid, the status is CHEAT
     *  2b. If it is valid, the status is the opponent's turn
     *  3. If it was the opponent
     *  3a. Check the validity of the move, if it's not valid, the status is CHEAT
     *  3b. Generate all possible moves for the player
     *  3c. If the player has no moves, and the king is in danger, the status is CHECKMATE
     *  3d. If the player has no moves, and the king is not in danger, the status is STALEMATE
     *  3e. If the player has moves, the status is the player's turn
     * 
     * @param {Function} setStatus The function to set the status of the game
     * @param {Function} setMessage The function to set the message of the game
     * @param {Function} endGame The function to end the game
     * @param {Function} setEnPassant The function to set the en passant position
     */
    getStatus(setStatus, setMessage, endGame, setEnPassant) {
        if (this.gameOver) {
            return;
        }

        const currentMoveMaker = getPlayerFromMessage(this.currentMove);
        const nextMoveMaker = getEnemyColor(currentMoveMaker);
        const nextTurn = getNextTurn(this.currentMove);

        if (currentMoveMaker === this.player) {
            const error = this.validatePlayerMove(currentMoveMaker, setEnPassant);

            // If the move is invalid, the status is CHEAT
            if (error) {
                setMessage(error)
                this.status = GAME_STATUS.CHEAT;
                return setStatus(GAME_STATUS.CHEAT);
            }

            const { actions, isKingSafe } = getTurnInfo(
                this.board,
                nextMoveMaker,
                this.positions,
                this.pawnRegistry,
                this.canCastle[nextMoveMaker],
                this.enPassant
            );

            // If the player has no moves, and the king is in danger, the status is CHECKMATE
            // If the player has no moves, and the king is not in danger, the status is STALEMATE
            // Otherwise, the status is the opponent's turn
            if (noMoreActions(actions) && !isKingSafe) {
                this.status = GAME_STATUS.CHECKMATE;
                return setStatus(GAME_STATUS.CHECKMATE);
            } else if (noMoreActions(actions) && isKingSafe) {
                this.status = GAME_STATUS.STALEMATE;
                return setStatus(GAME_STATUS.STALEMATE);
            } else {
                this.status = nextTurn;
                return setStatus(nextTurn);
            }
        } else {
            const error = this.validateOpponentMove(currentMoveMaker, setEnPassant);

            // If the move is invalid, the status is CHEAT
            if (error) {
                setMessage(error)
                this.status = GAME_STATUS.CHEAT;
                setStatus(GAME_STATUS.CHEAT);

                return endGame(this.status);
            }

            const { actions, isKingSafe } = getTurnInfo(
                this.board,
                this.player,
                this.positions,
                this.pawnRegistry,
                this.canCastle[this.player],
                this.enPassant
            );
            this.actions = actions;

            // If the player has no moves, and the king is in danger, the status is CHECKMATE
            // If the player has no moves, and the king is not in danger, the status is STALEMATE
            // Otherwise, the status is the player's turn
            if (noMoreActions(actions) && !isKingSafe) {
                this.status = GAME_STATUS.CHECKMATE;
                setStatus(GAME_STATUS.CHECKMATE);

                return endGame(this.status);
            } else if (noMoreActions(actions) && isKingSafe) {
                this.status = GAME_STATUS.STALEMATE;
                setStatus(GAME_STATUS.STALEMATE);

                return endGame(this.status);
            } else {
                this.status = nextTurn;
                return setStatus(nextTurn);
            }
        }
    }

    /**
     * Sets the selected tile
     * 
     * @param {import("../../types").ChessPos} tile The tile to set as the selected tile
     */
    setSelectedTile(tile) {
        this.selectedTile = tile;
    }

    /**
     * Gets the details of the tile at the given position
     * 
     * @param {import("../../types").ChessPos} chessPos The position to get the details for
     * @return {{
     *   piece: import("../../types").Piece?,
     *   selectable: Boolean,
     *   action: String?
     * }} The details of the tile at the given position
     */
    getTileDetails(chessPos) {
        const details = {};
        const piece = getPieceAt(this.board, chessPos);

        // If it's not the player's turn, or the game is over, the piece is not selectable
        if (!isTurn(this.player, this.status) || this.gameOver) {
            return { piece, selectable: false };
        }

        // The piece can be selectable if it's the player's piece
        if (piece) {
            details.piece = piece;
            details.selectable = ownsPiece(this.player, piece);
        }

        // If the player has selected a piece, and the position is an action, the action is selectable
        if (this.selectedTile) {
            const actionPiece = getPieceAt(this.board, this.selectedTile);
            const action = this.actions[actionPiece].find((action) => action.includes(chessPos))
            if (action) {
                details.action = action;
                details.selectable = true;
            }
        }

        details.selectable ??= false;

        return details;
    }

    /**
     * Translates the current turn to a message
     * 
     * @return {import("../../types").GameMessage} The message of the current turn
     */
    translateTurn() {
        return translateTurnToMessage(this.positions, this.pawnRegistry, this.player, this.canCastle);
    }

    /**
     * Toggles the selected tile. If the tile is the selected tile, deselect it, otherwise select it
     * 
     * @param {import("../../types").ChessPos} tile The tile to toggle
     */
    toggleTile(tile, setSelected) {
        if (this.selectedTile === tile) {
            setSelected(undefined);
            this.selectedTile = undefined;
        } else {
            setSelected(tile);
            this.selectedTile = tile;
        }
    }

    /**
     * Marks a pawn's transformed value
     * 
     * @param {import("../../types").Piece} pawn The pawn to mark
     * @param {PIECE_VALUES[keyof PIECE_VALUES]} to The transformed value
     */
    updateRegistry(pawn, to) {
        if (isPawn(pawn) && ownsPiece(this.player, pawn)) {
            if (this.pawnRegistry[pawn] === undefined) {
                this.pawnRegistry[pawn] = to;
            }
        }
    }

    /**
     * Executes the given action. If the action is a transform, note the need for the user's input.
     * If the action is a castle, note that the player can no longer castle. Otherwise, make the move.
     * 
     * @param {import("../../types").Action} action The action to execute
     * @param {Function} makeMove The function to make the move
     */
    executeAction(action, makeMove) {
        executeAction(this.board, this.selectedTile, action, this.positions);

        if (isAction(action, ACTION_TYPES.TRANSFORM)) {
            makeMove(this.translateTurn(), action.substring(0, 2));
        } else if (isAction(action, ACTION_TYPES.CASTLE)) {
            this.canCastle[this.player] = { 1: false, 2: false };

            makeMove(this.translateTurn());
        } else {
            makeMove(this.translateTurn());
        }
    }

    /**
     * Gets the order of the labels for the board based on the player's color
     *
     * @returns {{
     *   rowLabels: String[],
     *   colLabels: String[],
     * }} The order of the labels for the board
     */
    getLabelOrder() {
        const rowLabels = this.player === PIECE_COLORS.BLACK ? BOARD_ROW_LABELS : BOARD_ROW_LABELS.slice().reverse();
        const colLabels = this.player === PIECE_COLORS.BLACK ? BOARD_COL_LABELS.slice().reverse() : BOARD_COL_LABELS;

        return { rowLabels, colLabels }
    }

    /**
     * Gets the details of the board
     * 
     * @returns {{
     *   [key: import("../../types").ChessPos]: {
     *     piece: import("../../types").Piece?,
     *     selectable: Boolean,
     *     action: String?
     *   }
     * }} The details of the board
     */
    getBoardDetails() {
        const tiles = {};

        // Generates the details for each tile
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const chessRow = INDEX_TO_ROW[row];
                const chessCol = INDEX_TO_COL[col];
                const chessPos = chessCol + chessRow;

                tiles[chessPos] = this.getTileDetails(chessPos);
            }
        }

        return tiles;
    }

    /**
     * Determines the background color of the tile at the given position
     *
     * @param {import("../../types").ChessPos} chessPos The position to get the background for
     * @returns {1 | 2} The background color of the tile at the given position
     */
    getTileBackground(chessPos) {
        const row = ROW_TO_INDEX[chessPos[1]];
        const col = COL_TO_INDEX[chessPos[0]];

        if ((row + col) % 2 === 0) {
            return 1;
        } else {
            return 2;
        }
    }

    /**
     * Checks if the given position is the selected piece
     * 
     * @param {import("../../types").ChessPos} chessPos The position to check
     * @returns {Boolean} Whether the given position is the selected piece
     */
    isSelectedPiece(chessPos) {
        return this.selectedTile === chessPos;
    }

    /**
     * Gets the piece at the given position
     * 
     * @param {import("../../types").ChessPos} chessPos The position to get the piece from
     * @returns {import("../../types").Piece} The piece at the given position
     */
    getPieceAt(chessPos) {
        return getPieceAt(this.board, chessPos);
    }

    /**
     * Sets the last move
     * 
     * @param {import("../../types").GameMessage} lastMove The move to set as the last move
     */
    setLastMove(lastMove) {
        this.lastMove = lastMove;
    }

    /**
     * Sets the current move
     * 
     * @param {import("../../types").GameMessage} currentMove The move to set as the current move
     */
    setCurrMove(currentMove) {
        this.currentMove = currentMove;
    }

    /**
     * Gets the image class for the given piece
     * 
     * @param {import("../../types").Piece?} piece The piece to get the image class for
     * @returns {String} The image class for the given piece
     */
    getImageClass(piece) {
        return BoardManager.getImageClass(piece, this.pawnRegistry);
    }
}

export default BoardManager;
