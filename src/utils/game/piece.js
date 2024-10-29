import { PIECE_COLORS, PIECE_VALUES, DIRECTION_VECTORS, CAPTURED_PIECE } from "../enum";

/**
 * Checks if two pieces are enemies
 * 
 * @param {import('../../types').Piece} piece1 The first piece to compare
 * @param {import('../../types').Piece} piece2 The second piece to compare
 * @returns {Boolean} Whether or not the two pieces are enemies
 */
export const areEnemies = (piece1, piece2) => {
    const color1 = piece1?.[0] ?? undefined;
    const color2 = piece2?.[0] ?? undefined;

    return PIECE_COLORS.isEnemy(color1, color2);
}

/**
 * Checks if two pieces are allies
 *
 * @param {import('../../types').Piece} piece1 The first piece to compare
 * @param {import('../../types').Piece} piece2 The second piece to compare
 * @returns {Boolean} Whether or not the two pieces are allies
 */
export const areAllies = (piece1, piece2) => {
    const color1 = piece1?.[0] ?? undefined;
    const color2 = piece2?.[0] ?? undefined;

    return PIECE_COLORS.isAlly(color1, color2);
}

/**
 * Checks if a piece is any of the types provided
 * 
 * @param {import('../../types').Piece} piece The piece to check
 * @param {import('../../types').PawnRegistry} registry The registry of the pieces
 * @param  {PIECE_VALUES[keyof PIECE_VALUES][]} types The types to check
 * @returns {Boolean} Whether or not the piece is any of the types provided
 */
export const isMatchingPiece = (piece, registry, ...types) => types.some(pieceType => isPiece(piece, pieceType, registry));

/**
 * Gets the color of the enemy based on the color provided
 *
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} color The color of the piece
 * @returns {PIECE_COLORS[keyof PIECE_COLORS] | undefined} The color of the enemy piece
 */
export const getEnemyColor = (color) => {
    if (color === PIECE_COLORS.WHITE) {
        return PIECE_COLORS.BLACK;
    } else if (color === PIECE_COLORS.BLACK) {
        return PIECE_COLORS.WHITE;
    } else {
        return undefined;
    }
}

/**
 * Checks if a player owns the provided piece
 *
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} player The color of the player
 * @param {import('../../types').Piece} piece The piece to check
 * @returns {Boolean} Whether or not the player owns the piece
 */
export const ownsPiece = (player, piece) => {
    const color = piece[0] ?? undefined;

    return color === player;
}

/**
 * Checks if a piece is the color provided
 * 
 * @param {import('../../types').Piece} piece The piece to check
 * @param {PIECE_COLORS[keyof PIECE_COLORS]} color The color to check
 * @returns {Boolean} Whether or not the piece is the color provided
 */
export const isColor = (piece, color) => {
    const pieceColor = piece[0] ?? undefined;

    return pieceColor === color;
}

/**
 * Checks if a piece is white
 * 
 * @param {import('../../types').Piece} piece The piece to check
 * @returns {Boolean} Whether or not the piece is white
 */
export const isWhite = (piece) => isColor(piece, PIECE_COLORS.WHITE);

/**
 * Checks if a piece is black
 * 
 * @param {import('../../types').Piece} piece The piece to check
 * @returns {Boolean} Whether or not the piece is black
 */
export const isBlack = (piece) => isColor(piece, PIECE_COLORS.BLACK);

/**
 * Checks if a piece is dead
 * 
 * @param {import('../../types').ChessPos} chessPos The position of the piece
 * @returns {Boolean} Whether or not the piece is dead
 */
export const isDead = (chessPos) => chessPos === CAPTURED_PIECE;

/**
 * Checks if a direction is a diagonal direction
 *
 * @param {DIRECTION_VECTORS[keyof DIRECTION_VECTORS]} direction The direction to check
 * @returns {Boolean} Whether or not the direction is a diagonal direction
 */
export const isDiagonal = (direction) => {
    return direction === DIRECTION_VECTORS.NORTH_EAST ||
        direction === DIRECTION_VECTORS.NORTH_WEST ||
        direction === DIRECTION_VECTORS.SOUTH_EAST ||
        direction === DIRECTION_VECTORS.SOUTH_WEST;
}

/**
 * Checks if a piece is the type provided. If the piece is a pawn, it will check the registry
 * to see if the pawn has been transformed into the type provided
 * 
 * @param {import("../../types").Piece} piece The piece to check
 * @param {PIECE_VALUES[keyof PIECE_VALUES]} type The type to check
 * @param {import("../../types").PawnRegistry} registry The registry of the transformed pawns
 * @returns {Boolean} Whether or not the piece is the type provided
 */
export const isPiece = (piece, type, registry = {}) => {
    if (piece && piece.length >= 2) {
        if (piece[1] === type) {
            return true;
        } else if (piece[1] === PIECE_VALUES.PAWN) {
            const transformedPawn = registry[piece];
            return transformedPawn === type;
        }
    }

    return false;
}

/**
 * Checks if a piece is a pawn
 * 
 * @param {import('../../types').Piece} piece The piece to check
 * @returns {Boolean} Whether or not the piece is a pawn
 */
export const isPawn = (piece) => isPiece(piece, PIECE_VALUES.PAWN);

/**
 * Checks if a provided piece can attack infinitely in a direction provided
 *
 * @param {import('../../types').Piece} piece The piece to check
 * @param {DIRECTION_VECTORS[keyof DIRECTION_VECTORS]} direction The direction to check
 * @param {import('../../types').PawnRegistry} registry The registry of the transformed pawns
 * @returns {Boolean} Whether or not the piece can attack in the direction provided
 */
export const canAttackDirection = (piece, direction, registry) => {
    const diagonal = isDiagonal(direction);

    if (diagonal) {
        return isMatchingPiece(piece, registry, PIECE_VALUES.BISHOP, PIECE_VALUES.QUEEN);
    } else {
        return isMatchingPiece(piece, registry, PIECE_VALUES.ROOK, PIECE_VALUES.QUEEN);
    }
}
