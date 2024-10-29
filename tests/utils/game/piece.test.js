import {
    areEnemies,
    areAllies,
    isMatchingPiece,
    ownsPiece,
    isColor,
    isDiagonal,
    isPiece,
    canAttackDirection,
} from "../../../src/utils/game/piece";
import { PIECE_VALUES, PIECE_COLORS, DIRECTION_VECTORS } from "../../../src/utils/enum";

import { PIECES } from "../../tools";

describe('Tests areEnemies', () => {
    it('Should return true if the pieces are enemies', () => {
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.BLACK_KNIGHT)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.BLACK_BISHOP)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.BLACK_ROOK)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.BLACK_QUEEN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.BLACK_KING)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.BLACK_PAWN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.BLACK_KNIGHT)).toBe(true);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.BLACK_BISHOP)).toBe(true);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.BLACK_ROOK)).toBe(true);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.BLACK_QUEEN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.BLACK_KING)).toBe(true);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.BLACK_PAWN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.BLACK_KNIGHT)).toBe(true);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.BLACK_BISHOP)).toBe(true);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.BLACK_ROOK)).toBe(true);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.BLACK_QUEEN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.BLACK_KING)).toBe(true);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.BLACK_PAWN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.BLACK_KNIGHT)).toBe(true);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.BLACK_BISHOP)).toBe(true);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.BLACK_ROOK)).toBe(true);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.BLACK_QUEEN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.BLACK_KING)).toBe(true);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.BLACK_PAWN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.BLACK_KNIGHT)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.BLACK_BISHOP)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.BLACK_ROOK)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.BLACK_QUEEN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.BLACK_KING)).toBe(true);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.BLACK_PAWN)).toBe(true);
        expect(areEnemies(PIECES.WHITE_PAWN, PIECES.BLACK_KNIGHT)).toBe(true);
        expect(areEnemies(PIECES.WHITE_PAWN, PIECES.BLACK_BISHOP)).toBe(true);
        expect(areEnemies(PIECES.WHITE_PAWN, PIECES.BLACK_ROOK)).toBe(true);
        expect(areEnemies(PIECES.WHITE_PAWN, PIECES.BLACK_QUEEN)).toBe(true);
    });

    it('Should return false if the pieces are not enemies', () => {
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.WHITE_KNIGHT)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.WHITE_BISHOP)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.WHITE_ROOK)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.WHITE_QUEEN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.WHITE_KING)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KNIGHT, PIECES.WHITE_PAWN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.WHITE_KNIGHT)).toBe(false);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.WHITE_BISHOP)).toBe(false);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.WHITE_ROOK)).toBe(false);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.WHITE_QUEEN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.WHITE_KING)).toBe(false);
        expect(areEnemies(PIECES.WHITE_BISHOP, PIECES.WHITE_PAWN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.WHITE_KNIGHT)).toBe(false);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.WHITE_BISHOP)).toBe(false);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.WHITE_ROOK)).toBe(false);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.WHITE_QUEEN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.WHITE_KING)).toBe(false);
        expect(areEnemies(PIECES.WHITE_ROOK, PIECES.WHITE_PAWN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.WHITE_KNIGHT)).toBe(false);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.WHITE_BISHOP)).toBe(false);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.WHITE_ROOK)).toBe(false);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.WHITE_QUEEN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.WHITE_KING)).toBe(false);
        expect(areEnemies(PIECES.WHITE_QUEEN, PIECES.WHITE_PAWN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.WHITE_KNIGHT)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.WHITE_BISHOP)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.WHITE_ROOK)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.WHITE_QUEEN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.WHITE_KING)).toBe(false);
        expect(areEnemies(PIECES.WHITE_KING, PIECES.WHITE_PAWN)).toBe(false);
        expect(areEnemies(PIECES.WHITE_PAWN, PIECES.WHITE_KNIGHT)).toBe(false);
        expect(areEnemies(PIECES.WHITE_PAWN, PIECES.WHITE_BISHOP)).toBe(false);
        expect(areEnemies(PIECES.WHITE_PAWN, PIECES.WHITE_ROOK)).toBe(false);
        expect(areEnemies(PIECES.WHITE_PAWN, PIECES.WHITE_QUEEN)).toBe(false);
    });
});

describe('Tests areAllies', () => {
    it('Should return true if the pieces are allies', () => {
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.WHITE_KNIGHT)).toBe(true);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.WHITE_BISHOP)).toBe(true);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.WHITE_ROOK)).toBe(true);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.WHITE_QUEEN)).toBe(true);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.WHITE_KING)).toBe(true);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.WHITE_PAWN)).toBe(true);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.WHITE_KNIGHT)).toBe(true);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.WHITE_BISHOP)).toBe(true);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.WHITE_ROOK)).toBe(true);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.WHITE_QUEEN)).toBe(true);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.WHITE_KING)).toBe(true);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.WHITE_PAWN)).toBe(true);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.WHITE_KNIGHT)).toBe(true);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.WHITE_BISHOP)).toBe(true);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.WHITE_ROOK)).toBe(true);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.WHITE_QUEEN)).toBe(true);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.WHITE_KING)).toBe(true);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.WHITE_PAWN)).toBe(true);
        expect(areAllies(PIECES.WHITE_QUEEN, PIECES.WHITE_KNIGHT)).toBe(true);
        expect(areAllies(PIECES.WHITE_QUEEN, PIECES.WHITE_BISHOP)).toBe(true);
        expect(areAllies(PIECES.WHITE_QUEEN, PIECES.WHITE_ROOK)).toBe(true);
        expect(areAllies(PIECES.WHITE_QUEEN, PIECES.WHITE_QUEEN)).toBe(true);
        expect(areAllies(PIECES.WHITE_QUEEN, PIECES.WHITE_KING)).toBe(true);
        expect(areAllies(PIECES.WHITE_QUEEN, PIECES.WHITE_PAWN)).toBe(true);
        expect(areAllies(PIECES.WHITE_KING, PIECES.WHITE_KNIGHT)).toBe(true);
        expect(areAllies(PIECES.WHITE_KING, PIECES.WHITE_BISHOP)).toBe(true);
        expect(areAllies(PIECES.WHITE_KING, PIECES.WHITE_ROOK)).toBe(true);
        expect(areAllies(PIECES.WHITE_KING, PIECES.WHITE_QUEEN)).toBe(true);
        expect(areAllies(PIECES.WHITE_KING, PIECES.WHITE_KING)).toBe(true);
        expect(areAllies(PIECES.WHITE_KING, PIECES.WHITE_PAWN)).toBe(true);
        expect(areAllies(PIECES.WHITE_PAWN, PIECES.WHITE_KNIGHT)).toBe(true);
        expect(areAllies(PIECES.WHITE_PAWN, PIECES.WHITE_BISHOP)).toBe(true);
        expect(areAllies(PIECES.WHITE_PAWN, PIECES.WHITE_ROOK)).toBe(true);
        expect(areAllies(PIECES.WHITE_PAWN, PIECES.WHITE_QUEEN)).toBe(true);
    });

    it('Should return false if the pieces are not allies', () => {
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.BLACK_KNIGHT)).toBe(false);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.BLACK_BISHOP)).toBe(false);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.BLACK_ROOK)).toBe(false);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.BLACK_QUEEN)).toBe(false);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.BLACK_KING)).toBe(false);
        expect(areAllies(PIECES.WHITE_KNIGHT, PIECES.BLACK_PAWN)).toBe(false);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.BLACK_KNIGHT)).toBe(false);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.BLACK_BISHOP)).toBe(false);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.BLACK_ROOK)).toBe(false);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.BLACK_QUEEN)).toBe(false);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.BLACK_KING)).toBe(false);
        expect(areAllies(PIECES.WHITE_BISHOP, PIECES.BLACK_PAWN)).toBe(false);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.BLACK_KNIGHT)).toBe(false);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.BLACK_BISHOP)).toBe(false);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.BLACK_ROOK)).toBe(false);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.BLACK_QUEEN)).toBe(false);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.BLACK_KING)).toBe(false);
        expect(areAllies(PIECES.WHITE_ROOK, PIECES.BLACK_PAWN)).toBe(false);
        expect(areAllies(PIECES.WHITE_QUEEN, PIECES.BLACK_KNIGHT)).toBe(false);
        expect(areAllies(PIECES.WHITE_QUEEN, PIECES.BLACK_BISHOP)).toBe(false);
    });
});

describe('Tests isMatchingPiece', () => {
    it('Should return true if the piece matches', () => {
        expect(isMatchingPiece(PIECES.WHITE_KNIGHT, {}, PIECE_VALUES.KNIGHT, PIECE_VALUES.BISHOP)).toBe(true);
        expect(isMatchingPiece(PIECES.WHITE_BISHOP, {}, PIECE_VALUES.KNIGHT, PIECE_VALUES.BISHOP)).toBe(true);
        expect(isMatchingPiece(PIECES.WHITE_ROOK, {}, PIECE_VALUES.ROOK, PIECE_VALUES.BISHOP)).toBe(true);
        expect(isMatchingPiece(PIECES.WHITE_QUEEN, {}, PIECE_VALUES.QUEEN, PIECE_VALUES.BISHOP)).toBe(true);
        expect(isMatchingPiece(PIECES.WHITE_KING, {}, PIECE_VALUES.KING, PIECE_VALUES.BISHOP)).toBe(true);
        expect(isMatchingPiece(PIECES.WHITE_PAWN, {}, PIECE_VALUES.PAWN, PIECE_VALUES.BISHOP)).toBe(true);
    });

    it('Should return false if the piece does not match', () => {
        expect(isMatchingPiece(PIECES.WHITE_KNIGHT, {}, PIECE_VALUES.BISHOP, PIECE_VALUES.ROOK)).toBe(false);
        expect(isMatchingPiece(PIECES.WHITE_BISHOP, {}, PIECE_VALUES.ROOK, PIECE_VALUES.QUEEN)).toBe(false);
        expect(isMatchingPiece(PIECES.WHITE_ROOK, {}, PIECE_VALUES.QUEEN, PIECE_VALUES.KING)).toBe(false);
        expect(isMatchingPiece(PIECES.WHITE_QUEEN, {}, PIECE_VALUES.KING, PIECE_VALUES.PAWN)).toBe(false);
        expect(isMatchingPiece(PIECES.WHITE_KING, {}, PIECE_VALUES.PAWN, PIECE_VALUES.KNIGHT)).toBe(false);
        expect(isMatchingPiece(PIECES.WHITE_PAWN, {}, PIECE_VALUES.KNIGHT, PIECE_VALUES.BISHOP)).toBe(false);
    });
});

describe('Tests ownsPiece', () => {
    it('Should return true if the player color owns the piece', () => {
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.WHITE_KNIGHT)).toBe(true);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.WHITE_BISHOP)).toBe(true);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.WHITE_ROOK)).toBe(true);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.WHITE_QUEEN)).toBe(true);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.WHITE_KING)).toBe(true);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.WHITE_PAWN)).toBe(true);
    });

    it('Should return false if the player color does not own the piece', () => {
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.BLACK_KNIGHT)).toBe(false);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.BLACK_BISHOP)).toBe(false);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.BLACK_ROOK)).toBe(false);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.BLACK_QUEEN)).toBe(false);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.BLACK_KING)).toBe(false);
        expect(ownsPiece(PIECE_COLORS.WHITE, PIECES.BLACK_PAWN)).toBe(false);
    });
});

describe('Tests isColor', () => {
    it('Should return true if the piece is the color', () => {
        expect(isColor(PIECES.WHITE_KNIGHT, PIECE_COLORS.WHITE)).toBe(true);
        expect(isColor(PIECES.WHITE_BISHOP, PIECE_COLORS.WHITE)).toBe(true);
        expect(isColor(PIECES.WHITE_ROOK, PIECE_COLORS.WHITE)).toBe(true);
        expect(isColor(PIECES.WHITE_QUEEN, PIECE_COLORS.WHITE)).toBe(true);
        expect(isColor(PIECES.WHITE_KING, PIECE_COLORS.WHITE)).toBe(true);
        expect(isColor(PIECES.WHITE_PAWN, PIECE_COLORS.WHITE)).toBe(true);
        expect(isColor(PIECES.BLACK_KNIGHT, PIECE_COLORS.BLACK,)).toBe(true);
        expect(isColor(PIECES.BLACK_BISHOP, PIECE_COLORS.BLACK,)).toBe(true);
        expect(isColor(PIECES.BLACK_ROOK, PIECE_COLORS.BLACK,)).toBe(true);
        expect(isColor(PIECES.BLACK_QUEEN, PIECE_COLORS.BLACK,)).toBe(true);
        expect(isColor(PIECES.BLACK_KING, PIECE_COLORS.BLACK,)).toBe(true);
        expect(isColor(PIECES.BLACK_PAWN, PIECE_COLORS.BLACK,)).toBe(true);
    });

    it('Should return false if the piece is not the color', () => {
        expect(isColor(PIECES.BLACK_KNIGHT, PIECE_COLORS.WHITE)).toBe(false);
        expect(isColor(PIECES.BLACK_BISHOP, PIECE_COLORS.WHITE)).toBe(false);
        expect(isColor(PIECES.BLACK_ROOK, PIECE_COLORS.WHITE)).toBe(false);
        expect(isColor(PIECES.BLACK_QUEEN, PIECE_COLORS.WHITE)).toBe(false);
        expect(isColor(PIECES.BLACK_KING, PIECE_COLORS.WHITE)).toBe(false);
        expect(isColor(PIECES.BLACK_PAWN, PIECE_COLORS.WHITE)).toBe(false);
        expect(isColor(PIECES.WHITE_KNIGHT, PIECE_COLORS.BLACK)).toBe(false);
        expect(isColor(PIECES.WHITE_BISHOP, PIECE_COLORS.BLACK)).toBe(false);
        expect(isColor(PIECES.WHITE_ROOK, PIECE_COLORS.BLACK)).toBe(false);
        expect(isColor(PIECES.WHITE_QUEEN, PIECE_COLORS.BLACK)).toBe(false);
        expect(isColor(PIECES.WHITE_KING, PIECE_COLORS.BLACK)).toBe(false);
        expect(isColor(PIECES.WHITE_PAWN, PIECE_COLORS.BLACK)).toBe(false);
    });
});

describe('Tests isDiagonal', () => {
    it('Should return true if the direction is diagonal', () => {
        expect(isDiagonal(DIRECTION_VECTORS.NORTH_EAST)).toBe(true);
        expect(isDiagonal(DIRECTION_VECTORS.NORTH_WEST)).toBe(true);
        expect(isDiagonal(DIRECTION_VECTORS.SOUTH_EAST)).toBe(true);
        expect(isDiagonal(DIRECTION_VECTORS.SOUTH_WEST)).toBe(true);
    });

    it('Should return false if the direction is not diagonal', () => {
        expect(isDiagonal(DIRECTION_VECTORS.NORTH)).toBe(false);
        expect(isDiagonal(DIRECTION_VECTORS.EAST)).toBe(false);
        expect(isDiagonal(DIRECTION_VECTORS.SOUTH)).toBe(false);
        expect(isDiagonal(DIRECTION_VECTORS.WEST)).toBe(false);
    });
});

describe('Tests isPiece', () => {
    it('Should return true if the piece is the type', () => {
        expect(isPiece(PIECES.WHITE_KNIGHT, PIECE_VALUES.KNIGHT)).toBe(true);
        expect(isPiece(PIECES.WHITE_BISHOP, PIECE_VALUES.BISHOP)).toBe(true);
        expect(isPiece(PIECES.WHITE_ROOK, PIECE_VALUES.ROOK)).toBe(true);
        expect(isPiece(PIECES.WHITE_QUEEN, PIECE_VALUES.QUEEN)).toBe(true);
        expect(isPiece(PIECES.WHITE_KING, PIECE_VALUES.KING)).toBe(true);
        expect(isPiece(PIECES.WHITE_PAWN, PIECE_VALUES.PAWN)).toBe(true);
        expect(isPiece(PIECES.BLACK_KNIGHT, PIECE_VALUES.KNIGHT)).toBe(true);
        expect(isPiece(PIECES.BLACK_BISHOP, PIECE_VALUES.BISHOP)).toBe(true);
        expect(isPiece(PIECES.BLACK_ROOK, PIECE_VALUES.ROOK)).toBe(true);
        expect(isPiece(PIECES.BLACK_QUEEN, PIECE_VALUES.QUEEN)).toBe(true);
        expect(isPiece(PIECES.BLACK_KING, PIECE_VALUES.KING)).toBe(true);
        expect(isPiece(PIECES.BLACK_PAWN, PIECE_VALUES.PAWN)).toBe(true);
    });

    it('Should return false if the piece is not the type', () => {
        expect(isPiece(PIECES.WHITE_KNIGHT, PIECE_VALUES.BISHOP)).toBe(false);
        expect(isPiece(PIECES.WHITE_BISHOP, PIECE_VALUES.ROOK)).toBe(false);
        expect(isPiece(PIECES.WHITE_ROOK, PIECE_VALUES.QUEEN)).toBe(false);
        expect(isPiece(PIECES.WHITE_QUEEN, PIECE_VALUES.KING)).toBe(false);
        expect(isPiece(PIECES.WHITE_KING, PIECE_VALUES.PAWN)).toBe(false);
        expect(isPiece(PIECES.WHITE_PAWN, PIECE_VALUES.KNIGHT)).toBe(false);
        expect(isPiece(PIECES.BLACK_KNIGHT, PIECE_VALUES.BISHOP)).toBe(false);
        expect(isPiece(PIECES.BLACK_BISHOP, PIECE_VALUES.ROOK)).toBe(false);
        expect(isPiece(PIECES.BLACK_ROOK, PIECE_VALUES.QUEEN)).toBe(false);
        expect(isPiece(PIECES.BLACK_QUEEN, PIECE_VALUES.KING)).toBe(false);
        expect(isPiece(PIECES.BLACK_KING, PIECE_VALUES.PAWN)).toBe(false);
        expect(isPiece(PIECES.BLACK_PAWN, PIECE_VALUES.KNIGHT)).toBe(false);
    });
});

describe('Tests canAttackDirection', () => {
    it('Should return true if the piece can attack in the direction', () => {
        expect(canAttackDirection(PIECES.WHITE_BISHOP, DIRECTION_VECTORS.NORTH_EAST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_BISHOP, DIRECTION_VECTORS.NORTH_WEST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_BISHOP, DIRECTION_VECTORS.SOUTH_EAST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_BISHOP, DIRECTION_VECTORS.SOUTH_WEST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_ROOK, DIRECTION_VECTORS.NORTH)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_ROOK, DIRECTION_VECTORS.EAST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_ROOK, DIRECTION_VECTORS.SOUTH)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_ROOK, DIRECTION_VECTORS.WEST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_QUEEN, DIRECTION_VECTORS.NORTH)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_QUEEN, DIRECTION_VECTORS.EAST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_QUEEN, DIRECTION_VECTORS.SOUTH)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_QUEEN, DIRECTION_VECTORS.WEST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_QUEEN, DIRECTION_VECTORS.NORTH_EAST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_QUEEN, DIRECTION_VECTORS.NORTH_WEST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_QUEEN, DIRECTION_VECTORS.SOUTH_EAST)).toBe(true);
        expect(canAttackDirection(PIECES.WHITE_QUEEN, DIRECTION_VECTORS.SOUTH_WEST)).toBe(true);
    });

    it('Should return false if the piece cannot attack in the direction', () => {
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.NORTH_EAST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.NORTH_WEST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.SOUTH_EAST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.SOUTH_WEST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.NORTH)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.EAST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.SOUTH)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.WEST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.NORTH_EAST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.NORTH_WEST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.SOUTH_EAST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_KNIGHT, DIRECTION_VECTORS.SOUTH_WEST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_PAWN, DIRECTION_VECTORS.NORTH_EAST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_PAWN, DIRECTION_VECTORS.NORTH_WEST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_PAWN, DIRECTION_VECTORS.SOUTH_EAST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_PAWN, DIRECTION_VECTORS.SOUTH_WEST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_PAWN, DIRECTION_VECTORS.NORTH)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_PAWN, DIRECTION_VECTORS.EAST)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_PAWN, DIRECTION_VECTORS.SOUTH)).toBe(false);
        expect(canAttackDirection(PIECES.WHITE_PAWN, DIRECTION_VECTORS.WEST)).toBe(false);

        expect(canAttackDirection(PIECES.BLACK_BISHOP, DIRECTION_VECTORS.NORTH)).toBe(false);
        expect(canAttackDirection(PIECES.BLACK_BISHOP, DIRECTION_VECTORS.EAST)).toBe(false);
        expect(canAttackDirection(PIECES.BLACK_BISHOP, DIRECTION_VECTORS.SOUTH)).toBe(false);
        expect(canAttackDirection(PIECES.BLACK_BISHOP, DIRECTION_VECTORS.WEST)).toBe(false);

        expect(canAttackDirection(PIECES.BLACK_ROOK, DIRECTION_VECTORS.NORTH_EAST)).toBe(false);
        expect(canAttackDirection(PIECES.BLACK_ROOK, DIRECTION_VECTORS.NORTH_WEST)).toBe(false);
        expect(canAttackDirection(PIECES.BLACK_ROOK, DIRECTION_VECTORS.SOUTH_EAST)).toBe(false);
        expect(canAttackDirection(PIECES.BLACK_ROOK, DIRECTION_VECTORS.SOUTH_WEST)).toBe(false);
    });
});
