import { CAPTURED_PIECE, COL_TO_INDEX, INDEX_TO_COL, INDEX_TO_ROW, MESSAGE, PIECE_COLORS, PIECE_MESSAGE_ORDER, PIECE_VALUES, ROW_TO_INDEX } from "../enum";

/**
 * Extracts the numberic row and column from a chess position
 *
 * @param {import("../../types").ChessPos} piecePos The position of the piece
 * @returns {[number, number]} The row and column of the piece
 */
export const extractCoords = (piecePos) => {
    const col = COL_TO_INDEX[piecePos[0]];
    const row = ROW_TO_INDEX[piecePos[1]];

    return [row, col];
};

/**
 * Converts a numeric row and column to a chess position
 *
 * @param {[number, number]} piecePos The numeric row and column of the piece
 * @returns {import("../../types").ChessPos} The position of the piece
 */
export const extractNotation = (piecePos) => {
    const row = INDEX_TO_ROW[piecePos[0]];
    const col = INDEX_TO_COL[piecePos[1]];

    return `${col}${row}`;
};

/**
 * Converts a chess turn into a game message to send to the opponent
 * 
 * @param {import("../../types").Positions} positions The positions of the pieces
 * @param {import("../../types").PawnRegistry} registry The registry of transformed pawns
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} player The player who's turn it is
 * @param {{
 *   [key in PIECE_COLORS]: [boolean, boolean]
 * }} canCastleDetails The details of the castling ability of the players
 * @returns {import("../../types").GameMessage} The current turn as a game message
 */
export const translateTurnToMessage = (positions, registry, player, canCastleDetails) => {
    let board = '';

    // Converts the positions to a string
    PIECE_MESSAGE_ORDER.forEach((piece) => {
        const pos = positions[piece];
        const registryPiece = pos !== CAPTURED_PIECE ? registry[piece] || '' : '';

        board += registryPiece + pos;
    });

    // Convert the castling details to a string
    const w1 = canCastleDetails[PIECE_COLORS.WHITE][1] === true ? MESSAGE.TRUE : MESSAGE.FALSE;
    const w2 = canCastleDetails[PIECE_COLORS.WHITE][2] === true ? MESSAGE.TRUE : MESSAGE.FALSE;
    const b1 = canCastleDetails[PIECE_COLORS.BLACK][1] === true ? MESSAGE.TRUE : MESSAGE.FALSE;
    const b2 = canCastleDetails[PIECE_COLORS.BLACK][2] === true ? MESSAGE.TRUE : MESSAGE.FALSE;
    const canCastleString = w1 + w2 + b1 + b2;

    return [board, player, canCastleString].join(MESSAGE.GAME_DELIMITER);
}
