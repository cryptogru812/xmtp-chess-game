import { INITIAL_BOARD_POSITIONS, PIECES } from "../enum";
import { GAME_STATUS, GAME_VALIDATION_MESSAGES, MESSAGE, PIECE_COLORS, PIECE_MESSAGE_ORDER, PIECE_VALUES } from "../enum";
import { isPiece, isWhite } from "./piece";
import { translateTurnToMessage } from "./translate";

const pawnTypes = PIECE_VALUES.QUEEN + PIECE_VALUES.ROOK + PIECE_VALUES.BISHOP + PIECE_VALUES.KNIGHT;
const validRows = "ABCDEFGH";
const validCols = "12345678";

/**
 * Translates a message canCastle property to a boolean
 * 
 * @param {String} rookCanCastle The value of the rook's canCastle property
 * @returns {Boolean | undefined} Whether or not the rook can castle
 */
const translateCastleInfo = (rookCanCastle) => {
    if (rookCanCastle === MESSAGE.TRUE) {
        return true;
    } else if (rookCanCastle === MESSAGE.FALSE) {
        return false;
    } else {
        return undefined;
    }
}

/**
 * Extracts individual details from a move
 * 
 * @param {GameMessage} move The move to extract details from
 * @returns {{ 
 *  board: String, 
 *  player: PIECE_COLORS[keyof PIECE_COLORS],
 *  canCastle: {
 *     [PIECE_COLORS[keyof PIECE_COLORS]]: {
 *       1: Boolean | undefined,
 *       2: Boolean | undefined,
 *     }
 *   },
 * }}
 */
export const extractMoveDetails = (move) => {
    const details = move.split(MESSAGE.GAME_DELIMITER);
    const castleDetails = details[2];
    const canCastle = {
        [PIECE_COLORS.WHITE]: {
            1: translateCastleInfo(castleDetails[0]),
            2: translateCastleInfo(castleDetails[1]),
        },
        [PIECE_COLORS.BLACK]: {
            1: translateCastleInfo(castleDetails[2]),
            2: translateCastleInfo(castleDetails[3]),
        },
    }

    return {
        board: details[0],
        player: details[1],
        canCastle,
    };
}

/**
 * Checks to see if a move was made by the player
 * 
 * @param {GameMessage} move The move to check
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} player
 * @returns {Boolean} Whether or not the move was made by the player
 */
export const getPlayerFromMessage = (move) => {
    const { player: movePlayer } = extractMoveDetails(move);

    return movePlayer;
};

/**
 * Checks to see if a move was made by the opponent
 * 
 * @param {GameMessage} move The move to check
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} opponent 
 * @returns {Boolean} Whether or not the move was made by the opponent
 */
export const isOpponentMove = (move, opponent) => {
    const { player: movePlayer } = extractMoveDetails(move);

    return PIECE_COLORS.isEnemy(movePlayer, opponent);
}

/**
 * Checks to see which color's turn is next in the game
 * 
 * @param {GameMessage} move The move to check
 * @returns {GAME_STATUS['WHITE_TURN'] | GAME_STATUS['BLACK_TURN']} The next turn
 */
export const getNextTurn = (move) => {
    const { player } = extractMoveDetails(move);

    return isWhite(player) ? GAME_STATUS.BLACK_TURN : GAME_STATUS.WHITE_TURN;
}

/**
 * Checks to see if a board length is too long or too short
 * 
 * @param {String} board The board to check
 * @returns {Boolean} Whether or not the board length is valid
 */
const validBoardLength = (board) => {
    return 64 <= board.length && board.length <= 80;
};

/**
 * Checks to see if a player has reenabled castling. Re-enabling castling is when a player 
 * loses the ability to castle, but then regains it
 *
 * @param {{
 *   canCastle: {
 *     [PIECE_COLORS[keyof PIECE_COLORS]]: {
 *       1: Boolean | undefined,
 *       2: Boolean | undefined,
 *     }
 *   }
 * }} currTurnDetails Details about the turn 
 * @param {{
 *   canCastle: {
*     [PIECE_COLORS[keyof PIECE_COLORS]]: {
*       1: Boolean | undefined,
*       2: Boolean | undefined,
*     }
*   }
* }} lastTurnDetails Details about the turn
 * @returns {Boolean} Whether or not the player has reenabled castling
 */
const hasReverseCastleEnable = ({ canCastle: lastCanCastle }, { canCastle: currentCanCastle }) => {
    const lastWhiteRook1 = lastCanCastle[PIECE_COLORS.WHITE][1];
    const lastWhiteRook2 = lastCanCastle[PIECE_COLORS.WHITE][2];
    const lastBlackRook1 = lastCanCastle[PIECE_COLORS.BLACK][1];
    const lastBlackRook2 = lastCanCastle[PIECE_COLORS.BLACK][2];
    const currentWhiteRook1 = currentCanCastle[PIECE_COLORS.WHITE][1];
    const currentWhiteRook2 = currentCanCastle[PIECE_COLORS.WHITE][2];
    const currentBlackRook1 = currentCanCastle[PIECE_COLORS.BLACK][1];
    const currentBlackRook2 = currentCanCastle[PIECE_COLORS.BLACK][2];

    return (
        (!lastWhiteRook1 && currentWhiteRook1) ||
        (!lastWhiteRook2 && currentWhiteRook2) ||
        (!lastBlackRook1 && currentBlackRook1) ||
        (!lastBlackRook2 && currentBlackRook2)
    );
};

/**
 * Checks to see if a pawn is in a transformed position
 * 
 * @param {import("../../types").Piece} pawn The pawn to check
 * @returns {Boolean} Whether or not the pawn is in a transformed position
 */
const isTransformedPawnPos = (pawn) => {
    const hasPawnType = pawnTypes.includes(pawn[0]);
    const hasValidRow = validRows.includes(pawn[1]);
    const hasValidCol = validCols.includes(pawn[2]);

    return hasPawnType && hasValidRow && hasValidCol;
}

/**
 * Checks to see if a piece is in a valid position
 * 
 * @param {import("../../types").ChessPos} chessPos The piece to check
 * @returns {Boolean} Whether or not the piece is in a valid position
 */
const isPiecePos = (chessPos) => {
    const hasValidRow = validRows.includes(chessPos[0]);
    const hasValidCol = validCols.includes(chessPos[1]);
    const isDead = chessPos === 'XX'

    return (hasValidRow && hasValidCol) || isDead;
}

/**
 * Extracts the board information from a board string
 * 
 * @param {String} board The board to extract information from
 * @param {String} blame The player to blame for the error
 * @returns {{
 *   piecePositions: import("../../types").Positions,
 *   pawnRegistry: import("../../types").PawnRegistry,
 *   error: String,
 * }} The extracted board information
 */
const extractBoardInfo = (board, blame = '') => {
    const piecePositions = {};
    const pawnRegistry = {};
    let pieceCount = 0;
    let transformCount = 0;

    // Validates the board length
    if (!validBoardLength(board)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_BOARD_SIZE, blame)
        };
    }

    // Goes through the board and extracts the piece positions
    for (let i = 0; i < board.length; i += 2) {
        // Gets the expected piece
        const piece = PIECE_MESSAGE_ORDER[pieceCount];

        // Checks to see if the piece is in a transformed position or a regular position
        if (isPiece(piece, PIECE_VALUES.PAWN) && isTransformedPawnPos(board.substring(i, i + 3))) {
            pawnRegistry[piece] = board.substring(i, i + 1);
            piecePositions[piece] = board.substring(i + 1, i + 3);
            pieceCount++;
            transformCount++;
            i += 1;
        } else if (isPiecePos(board.substring(i, i + 2))) {
            piecePositions[piece] = board.substring(i, i + 2);
            pieceCount++;
        } else {
            return {
                error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_PIECE_POS, blame)
            };
        }
    }

    // There should be exactly 32 pieces on the board
    if (pieceCount !== 32) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_PIECE_COUNT, blame)
        };
    }

    // There can only be 16 transformed pawns at most
    if (transformCount > 16) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_TRANSFORM_COUNT, blame)
        };
    }

    return { piecePositions, pawnRegistry };
}

/**
 * Checks to see if the castle details are valid. Castle details are valid if they contain
 * boolean values for each rook
 *
 * @param {{
 *   [PIECE_COLORS[keyof PIECE_COLORS]]: {
 *     1: {
 *       [PIECE_COLORS[keyof PIECE_COLORS]]: String,
 *     },
 *     2: {
 *       [PIECE_COLORS[keyof PIECE_COLORS]]: String,
 *     }
 *   }
 * }} castleDetails The details about the castling
 * @returns {Boolean} Whether or not the castle details are valid
 */
const isValidCastleDetails = (castleDetails) => {
    return Object.values(castleDetails).every((player) => {
        return player['1'] !== undefined && player['2'] !== undefined;
    })
}

/**
 * Gets the differences between two game messages
 * 
 * @param {String} lastBoard The last board
 * @param {String} currBoard The current board
 * @returns {{
 *   differences: {
 *     [PIECE_VALUES[keyof PIECE_VALUES]]: [String, String],
 *   },
 *   currPositions: import("../../types").Positions | undefined,
 *   lastPositions: import("../../types").Positions | undefined,
 *   lastPawnRegistry: import("../../types").PawnRegistry | undefined,
 *   currPawnRegistry: import("../../types").PawnRegistry | undefined,
 *   transformed: Boolean | undefined,
 *   error: String | undefined,
 * }} The differences between the two game messages
 */
const getGameDifferences = (lastBoard, currBoard) => {
    const { piecePositions: lastPositions, error: lastError, pawnRegistry: lastPawnRegistry } = extractBoardInfo(lastBoard);
    const { piecePositions: currPositions, error: currError, pawnRegistry: currPawnRegistry } = extractBoardInfo(currBoard);
    const differences = {};

    // Stops if there was an error extracting any board information
    if (lastError || currError) {
        return {
            error: lastError || currError
        };
    }

    // Goes through each piece and checks to see if there was a difference
    PIECE_MESSAGE_ORDER.forEach((piece) => {
        const lastPos = lastPositions[piece];
        const currentPos = currPositions[piece];

        if (lastPos !== currentPos) {
            differences[piece] = [
                lastPos,
                currentPos,
            ];
        }
    })

    const lastPawnKeys = Object.keys(lastPawnRegistry);
    const currPawnKeys = Object.keys(currPawnRegistry);
    let transformed = false;

    // Ensures that there was only at most one difference in the pawn registries
    if (Math.abs(lastPawnKeys.length - currPawnKeys.length) > 1) {
        return { error: GAME_VALIDATION_MESSAGES.INVALID_TRANSFORM_DIFFERENCE };
    }

    // Checks to see if a pawn was transformed
    if (currPawnKeys.length - lastPawnKeys.length === 1) {
        transformed = true;
    }

    return { differences, currPositions, lastPositions, lastPawnRegistry, currPawnRegistry, transformed };
}

const hasSameColor = ({ player: lastPlayer }, { player: currentPlayer }) => PIECE_COLORS.isAlly(lastPlayer, currentPlayer);

export const validateTurnContinuity = (lastMove, currentMove) => {
    const lastMoveDetails = extractMoveDetails(lastMove);
    const currentMoveDetails = extractMoveDetails(currentMove);

    if (!lastMoveDetails.player || !currentMoveDetails.player) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_MESSAGE, currentMoveDetails.player)
        };
    }

    if (!isValidCastleDetails(lastMoveDetails.canCastle) || !isValidCastleDetails(currentMoveDetails.canCastle)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_MESSAGE, currentMoveDetails.player)
        };
    }

    if (!lastMoveDetails.board || !currentMoveDetails.board) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.INVALID_MESSAGE, currentMoveDetails.player)
        };
    }

    if (hasSameColor(lastMoveDetails, currentMoveDetails)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.SAME_MESSAGE_COLOR, currentMoveDetails.player)
        };
    }

    if (hasReverseCastleEnable(lastMoveDetails, currentMoveDetails)) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.REENABLE_CASTLING, currentMoveDetails.player)
        };
    }

    const { error, currPositions, differences, lastPositions, lastPawnRegistry, currPawnRegistry, transformed } = getGameDifferences(lastMoveDetails.board, currentMoveDetails.board);

    if (error) {
        return { error };
    }

    const diffLength = Object.keys(differences).length;

    if (diffLength === 0) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.NO_MOVE, currentMoveDetails.player)
        };
    }

    if (diffLength > 2) {
        return {
            error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.MULTI_ACTION, currentMoveDetails.player)
        };
    }

    return {
        data: {
            differences,
            last: {
                canCastle: lastMoveDetails.canCastle,
                positions: lastPositions,
                pawnRegistry: lastPawnRegistry,
            },
            curr: {
                canCastle: currentMoveDetails.canCastle,
                positions: currPositions,
                pawnRegistry: currPawnRegistry,
            },
            player: currentMoveDetails.player,
            transformed,
        }
    };
};

/**
 * Checks to see if a player can castle with a specific rook
 * 
 * @param {import("../../types").GameMessage} move The move to extract details from
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} player The player to check
 * @param {Number} rookNum The number of the rook to check
 * @returns {Boolean | undefined} Whether or not the player can castle with the rook
 */
export const canCastle = (move, player, rookNum) => {
    const { canCastle } = extractMoveDetails(move);

    return canCastle[player][rookNum];
}

/**
 * Generates the first initial moves of the game
 * 
 * @returns {import("../../types").GameMessage[]} The first initial moves of the game
 */
export const generateInitalMoves = () => {
    const negOnePositions = { ...INITIAL_BOARD_POSITIONS, [PIECES.BLACK_KNIGHT_1]: 'C6' }
    const canCastleDetails = {
        [PIECE_COLORS.WHITE]: {
            1: true,
            2: true,
        },
        [PIECE_COLORS.BLACK]: {
            1: true,
            2: true,
        },
    }

    const negOneTurn = translateTurnToMessage(negOnePositions, {}, PIECE_COLORS.WHITE, canCastleDetails);
    const zeroTurn = translateTurnToMessage(INITIAL_BOARD_POSITIONS, {}, PIECE_COLORS.BLACK, canCastleDetails);
    return [negOneTurn, zeroTurn];
}
