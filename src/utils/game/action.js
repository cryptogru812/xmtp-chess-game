import { ACTION_TYPES, CAPTURED_PIECE, GAME_STATUS, GAME_VALIDATION_MESSAGES, INDEX_TO_COL, INDEX_TO_ROW, PIECE_COLORS, PIECE_VALUES } from "../enum";
import { getPieceAt, movePiece, removePiece } from "./board";
import { areAllies, isDead, isPawn, isPiece, isWhite, ownsPiece } from "./piece";
import { extractCoords } from "./translate";

/**
 * Converts a position and action type into an action
 * 
 * @param {import("../../types").ChessPos} chessPos The position of the piece in chess notation
 * @param {ACTION_TYPES[keyof ACTION_TYPES]} actionType The action type being performed
 * @returns {import("../../types").Action} The position and type of action performed in chess notation
 */
export const convertToAction = (chessPos, actionType) => `${chessPos.slice(-2)}${actionType}`;

/**
 * Finds the first piece in a list of differences that was captured. A piece
 * is considered captured if it was alive in the last state and dead in the
 * current state.
 * 
 * @param {differences: import('../../types').TurnDifferences} diff The differences between the last and current board state
 * @returns {import("../../types").Piece | null} The piece that was captured or null if no piece was captured
 */
const findCapturedPiece = (diff) => {
    const entry = Object.entries(diff).find(([key, [lastPos, currentPos]]) => {
        return lastPos !== CAPTURED_PIECE && currentPos === CAPTURED_PIECE;
    });

    if (!entry) {
        return null;
    }

    return entry[0];
}

/**
 * Determines whether the differences between the last and current board state
 * represent a castle like move, by seeing if 2 pieces were moved and they are
 * both allies.
 * 
 * @param {differences: import('../../types').TurnDifferences} diff The differences between the last and current board state 
 * @returns {Boolean} Whether the differences represent a castle move
 */
const isCastle = (diff) => {
    const keys = Object.keys(diff);

    return keys.length === 2 && areAllies(keys[0], keys[1]);
}

/**
 * Determines whether the move is an en passant opening move. An en passant
 * opening move is a move where a pawn moves 2 spaces forward, leaving an 
 * opportunity for the opponent to capture it en passant.
 * 
 * @param {import("../../types").Piece} piece The piece that is being moved 
 * @param {import("../../types").ChessPos} start The starting position of the piece 
 * @param {import("../../types").ChessPos} end The ending position of the piece 
 * @returns {Boolean} Whether the move is an en passant move
 */
const isEnPassantOpening = (piece, start, end) => {
    // Ensures that the piece is a regular pawn
    if ([start, end].some((pos) => pos.length !== 2) || !isPawn(piece)) {
        return false;
    }

    const [startRow, startCol] = extractCoords(start);
    const [endRow, endCol] = extractCoords(end);

    // Figures out the forward direction based on the pawn color
    const [enPassantStart, enPassantEnd] = isWhite(piece) ? [1, 3] : [6, 4];

    return startRow === enPassantStart && endRow === enPassantEnd && startCol === endCol;
};

/**
 * Validates a move action by checking if the piece exists and is owned by the
 * the player. If the move is an en passant opening move, the en passant position
 * is also returned.
 * 
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} player The color of the player who made the action
 * @param {differences: import('../../types').TurnDifferences} diff The differences between the last and current board state
 * @returns {{
 *  error?: String,
 *  data?: {
 *    action: String,
 *    piecePos: String,
 *    enPassant: String | null,
 *  }
 * }} The result of the validation
 */
const validateMove = (player, diff) => {
    const piece = Object.keys(diff)[0];
    const [lastPos, currPos] = diff[piece];

    // Ensures that the piece exists and is owned by the player
    if (!piece || !ownsPiece(player, piece)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, player)
        };
    }

    // Checks if the piece is an en passant opening move
    const enPassant = isEnPassantOpening(piece, lastPos, currPos) ? currPos.slice(-2) : null;

    // Prepares the data on the move action
    const data = {
        action: convertToAction(currPos, ACTION_TYPES.MOVE),
        piecePos: lastPos.slice(-2),
        enPassant,
    }

    return { data }
}

/**
 * Validates a capture action by checking if the pieces end up in the right
 * positions and control of the pieces is correct.
 * 
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} color The color of the player who made the action
 * @param {import("../../types").Piece} captured The piece that was captured 
 * @param {import("../../types").Piece} capturer The piece that captured the other piece 
 * @param {differences: import('../../types').TurnDifferences} diff The differences between the last and current board state 
 * @returns {{
 *  error?: String,
 *  data?: {
 *    action: String,
 *    piecePos: String,
 *  }
 * }} The result of the validation
 */
const validateCapture = (color, captured, capturer, diff) => {
    // Checks that both pieces exist and that the capturer is owned by the player and the captured is not
    if (!captured || !capturer || !ownsPiece(color, capturer) || ownsPiece(color, captured)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color)
        };
    }

    // Gets the last and current positions of the pieces
    const [lastCapPos, currCapPos] = diff[captured];
    const [lastAlivePos, currAlivePos] = diff[capturer];

    // Checks that the right positions are dead or alive positions
    if ([lastCapPos, lastAlivePos, currAlivePos].some((pos) => isDead(pos)) || !isDead(currCapPos)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color)
        };
    }

    // Checks that the capterer piece ends on the captured piece's position
    if (currAlivePos.slice(-2) !== lastCapPos.slice(-2)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color)
        };
    }

    // Prepares the data on the capture action
    const data = {
        action: convertToAction(currAlivePos, ACTION_TYPES.CAPTURE),
        piecePos: lastAlivePos.slice(-2),
    }

    return { data }
}

/**
 * Validates a transform action by checking if the piece exists and is owned by the
 * the player.
 *
 * @param {String} color The color of the player who made the action
 * @param {differences: import('../../types').TurnDifferences} diff The differences between the last and current board state
 * @returns {{
 *   error?: String,
 *   data?: {
 *     action: String,
 *     piecePos: String,
 *   }
 * }} The result of the validation
 */
const validateTransform = (color, diff) => {
    const transformer = Object.keys(diff).find((piece) => isPawn(piece));
    const [lastTrsPos, currTrsPos] = diff[transformer];

    // Checks that the piece exists and is owned by the player
    if (!transformer || !ownsPiece(color, transformer)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color)
        };
    }

    const data = {
        action: convertToAction(currTrsPos, ACTION_TYPES.TRANSFORM),
        piecePos: lastTrsPos,
    }

    return { data }
}

/**
 * Checks if the differences represent a valid castle move and returns the
 * action and the position of the king if so.
 * 
 * @param {String} color The color of the player who made the action
 * @param {differences: import('../../types').TurnDifferences} diff The differences between the last and current board state
 * @returns {{
 *   error?: String,
 *   data?: {
 *     action: String,
 *     piecePos: String,
 *   }
 * }} The result of the validation
 */
const validateCastle = (color, diff) => {
    const king = Object.keys(diff).find((piece) => isPiece(piece, PIECE_VALUES.KING) && ownsPiece(color, piece));
    const rook = Object.keys(diff).find((piece) => isPiece(piece, PIECE_VALUES.ROOK) && ownsPiece(color, piece));

    // Checks that the king and rook
    if (!king || !rook) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color)
        };
    }

    const [lastKingPos, currKingPos] = diff[king];
    const [lastRookPos, currRookPos] = diff[rook];

    // Checks that the right positions are alive positions
    if ([lastKingPos, currKingPos, lastRookPos, currRookPos].some((pos) => isDead(pos))) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color)
        };
    }

    return {
        data: {
            action: convertToAction(currKingPos, ACTION_TYPES.CASTLE),
            piecePos: lastKingPos,
        }
    }
}

/**
 * Validates an en passant action by checking if the pieces involved are in the
 * right positions and control of the pieces is correct.
 * 
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} color The color of the player who made the action
 * @param {import("../../types").Piece} captured The piece that was captured
 * @param {import("../../types").Piece} capturer The piece that captured the other piece
 * @param {differences: import('../../types').TurnDifferences} diff The differences between the last and current board state
 * @returns {{
 *   error?: String,
 *   data?: {
 *     action: String,
 *     piecePos: String,
 *   }
 * }} The result of the validation
 */
const validateEnPassant = (color, captured, capturer, diff) => {
    const [lastCapPos, currCapPos] = diff[captured];
    const [lastAlivePos, currAlivePos] = diff[capturer];

    // Checks that the capturer and captured pieces are owned by the right player and are pawns
    if (!ownsPiece(color, capturer) || ownsPiece(color, captured) || !isPawn(capturer) || !isPawn(captured)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color),
        };
    }

    // Checks that all pawns are not transformed pawns
    if ([lastAlivePos, currAlivePos, lastCapPos, currCapPos].some((pos) => pos.length > 2)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color),
        }
    }

    // Checks that the right positions are alive positions and the captured position is dead
    if ([lastCapPos, lastAlivePos, currAlivePos].some((pos) => isDead(pos)) || currCapPos !== CAPTURED_PIECE) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color),
        }
    }

    const [requiredStartRank, requiredEndRank] = color === PIECE_COLORS.WHITE ? [5, 6] : [4, 3];

    // Checks that the right ranks are involved in the en passant
    if ([lastAlivePos, lastCapPos].some((pos) => !pos.includes(requiredStartRank))) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color),
        }
    }

    // Checks that the end position is the right position for the en passant
    if (currAlivePos !== `${lastCapPos[0]}${requiredEndRank}`) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, color),
        }
    }

    const data = {
        action: convertToAction(currAlivePos, ACTION_TYPES.EN_PASSANT),
        piecePos: lastAlivePos,
    };

    return { data };
};

/**
 * Validates an action by checking if the differences between the last and current
 * board state represent a valid action and returns the action and original position of
 * the piece if so.
 *
 * @param {{
 *   player: PIECE_COLORS[keyof PIECE_COLORS],
 *   differences: import('../../types').TurnDifferences,
 *   transformed: Boolean
 * }} data Information about the action to validate
 * @returns {{
 *   error?: String,
 *   data?: {
 *     action: String,
 *     piecePos: String,
 *     enPassant?: String | null
 *   }
 * }} The result of the validation
 */
export const validateAction = ({ player, differences: diff, transformed }) => {
    // Validates a transform action if a known transform is made
    if (transformed) {
        return validateTransform(player, diff);
    }

    const diffValues = Object.values(diff);

    // The only action that always has one difference is a move
    if (diffValues.length === 1) {
        return validateMove(player, diff);
    }

    // Checks if a piece was captured 
    const capturedPiece = findCapturedPiece(diff);
    if (capturedPiece) {
        const capturer = Object.keys(diff).find((key) => key !== capturedPiece);
        const captuererPostPos = diff[capturer][1].slice(-2);
        const capturedPrePos = diff[capturedPiece][0].slice(-2);

        // A en passasnt capture happens when the end position of the capturer is different from the captured piece's position
        if (captuererPostPos !== capturedPrePos) {
            return validateEnPassant(player, capturedPiece, capturer, diff);
        } else {
            return validateCapture(player, capturedPiece, capturer, diff);
        }
    }

    // Checks if the move is a castle move
    const isCastled = isCastle(diff);
    if (isCastled) {
        return validateCastle(player, diff);
    }

    return {
        error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_ACTION, player)
    };
}

/**
 * Executes an action on the board and returns the new board state
 * 
 * @param {import("../../types").Board} board The board to execute the action on
 * @param {import("../../types").ChessPos} originalChessPos The current position of the piece
 * @param {import("../../types").Action} action The action to execute
 * @param {import("../../types").Positions} positions The positions of the pieces on the board
 * @returns {import("../../types").Board} The board after the action has been executed
 */
export const executeAction = (board, originalChessPos, action, positions) => {
    const actionChessPos = action.slice(0, 2);
    const actionType = action.slice(2);

    if (actionType === ACTION_TYPES.CASTLE) {
        // Determines whether a left or right castle is being performed
        const rookCol = actionChessPos[0] === 'C' ? 'A' : 'H';
        const rookEndCol = actionChessPos[0] === 'C' ? 'D' : 'F';
        const rookRow = actionChessPos[1];
        const rookChessPos = `${rookCol}${rookRow}`;
        const rookChessEndPos = `${rookEndCol}${rookRow}`;

        // Gets the king and rook pieces
        const king = getPieceAt(board, originalChessPos);
        const rook = getPieceAt(board, rookChessPos);

        // Updates the positions of the king and rook
        positions[king] = actionChessPos;
        positions[rook] = rookChessEndPos;

        // Moves the king and rook to their new positions
        movePiece(board, originalChessPos, actionChessPos);
        movePiece(board, rookChessPos, rookChessEndPos);
    } else if (actionType === ACTION_TYPES.EN_PASSANT) {
        // Gets the pawn and captured pawn pieces
        const actionPiece = getPieceAt(board, originalChessPos);
        const capturedPiece = getPieceAt(board, `${actionChessPos[0]}${originalChessPos[1]}`);

        // Updates the positions of the pawn and captured pawn and the board
        movePiece(board, originalChessPos, actionChessPos);
        removePiece(board, `${actionChessPos[0]}${originalChessPos[1]}`);
        positions[actionPiece] = actionChessPos;
        positions[capturedPiece] = 'XX';
    } else {
        // Gets the piece and possible capture piece
        const actionPiece = getPieceAt(board, originalChessPos);
        const capturedPiece = getPieceAt(board, actionChessPos);

        // Updates the positions of the piece and possible capture piece
        positions[actionPiece] = actionChessPos;
        if (capturedPiece) {
            positions[capturedPiece] = 'XX';
        }

        // Updates the board
        movePiece(board, originalChessPos, actionChessPos);
    }

    return board;
}

/**
 * Checks if there are no more actions available to be performed
 *
 * @param {{
 *   [piece: String]: import("../../types").Action[]
 * }} actionsList A list of actions that can be performed by each piece
 * @returns {Boolean} Whether there are no more actions to be performed
 */
export const noMoreActions = (actionsList) => {
    return Object.values(actionsList).every((actions) => actions.length === 0);
}

/**
 * Checks if the current status is the color's turn
 * 
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} color The color of the player to check
 * @param {GAME_STATUS[keyof GAME_STATUS]} status The status of the game
 * @returns {Boolean} Whether it is the color's turn
 */
export const isTurn = (color, status) => {
    const turn = color === PIECE_COLORS.WHITE ? GAME_STATUS.WHITE_TURN : GAME_STATUS.BLACK_TURN;

    return status === turn;
}

/**
 * Checks if an action is of a given type
 * 
 * @param {import("../../types").Action} action The action to check
 * @param {ACTION_TYPES[keyof ACTION_TYPES]} actionType The action type to check against
 * @returns {Boolean} Whether the action is of the given type
 */
export const isAction = (action, actionType) => {
    return action[2] === actionType;
}
