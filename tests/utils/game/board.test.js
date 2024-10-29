import { validateMove, getTurnInfo, movePiece, placePiece, removePiece } from "../../../src/utils/game/board";
import { INITIAL_BOARD_POSITIONS, PIECES, PIECE_COLORS, PIECE_VALUES, ACTION_TYPES } from "../../../src/utils/enum";

const { KING, KNIGHT, BISHOP, EMPTY, PAWN, QUEEN, ROOK } = PIECE_VALUES;
const { BLACK, WHITE } = PIECE_COLORS;
const { MOVE, CAPTURE, TRANSFORM, CASTLE, EN_PASSANT } = ACTION_TYPES;

const createStarterBoard = () => {
    return {
        'A1': 'WR1', 'B1': 'WN1', 'C1': 'WB1', 'D1': 'WQ',
        'E1': 'WK', 'F1': 'WB2', 'G1': 'WN2', 'H1': 'WR2',
        'A2': 'WP1', 'B2': 'WP2', 'C2': 'WP3', 'D2': 'WP4',
        'E2': 'WP5', 'F2': 'WP6', 'G2': 'WP7', 'H2': 'WP8',
        'A7': 'BP1', 'B7': 'BP2', 'C7': 'BP3', 'D7': 'BP4',
        'E7': 'BP5', 'F7': 'BP6', 'G7': 'BP7', 'H7': 'BP8',
        'A8': 'BR1', 'B8': 'BN1', 'C8': 'BB1', 'D8': 'BQ',
        'E8': 'BK', 'F8': 'BB2', 'G8': 'BN2', 'H8': 'BR2',
    }
}

const createEmptyBoard = () => {
    return {}
}

const createDeadPositions = () => {
    return {
        [WHITE + PAWN + '1']: 'XX',
        [WHITE + PAWN + '2']: 'XX',
        [WHITE + PAWN + '3']: 'XX',
        [WHITE + PAWN + '4']: 'XX',
        [WHITE + PAWN + '5']: 'XX',
        [WHITE + PAWN + '6']: 'XX',
        [WHITE + PAWN + '7']: 'XX',
        [WHITE + PAWN + '8']: 'XX',
        [WHITE + ROOK + '1']: 'XX',
        [WHITE + ROOK + '2']: 'XX',
        [WHITE + KNIGHT + '1']: 'XX',
        [WHITE + KNIGHT + '2']: 'XX',
        [WHITE + BISHOP + '1']: 'XX',
        [WHITE + BISHOP + '2']: 'XX',
        [WHITE + QUEEN]: 'XX',
        [WHITE + KING]: 'XX',
        [BLACK + PAWN + '1']: 'XX',
        [BLACK + PAWN + '2']: 'XX',
        [BLACK + PAWN + '3']: 'XX',
        [BLACK + PAWN + '4']: 'XX',
        [BLACK + PAWN + '5']: 'XX',
        [BLACK + PAWN + '6']: 'XX',
        [BLACK + PAWN + '7']: 'XX',
        [BLACK + PAWN + '8']: 'XX',
        [BLACK + ROOK + '1']: 'XX',
        [BLACK + ROOK + '2']: 'XX',
        [BLACK + KNIGHT + '1']: 'XX',
        [BLACK + KNIGHT + '2']: 'XX',
        [BLACK + BISHOP + '1']: 'XX',
        [BLACK + BISHOP + '2']: 'XX',
        [BLACK + QUEEN]: 'XX',
        [BLACK + KING]: 'XX',
    }
}

describe('Tests validateMove', () => {
    describe('Tests untransformed pawns', () => {
        it('Should find no error for a white pawn who committed en passant', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A5', PIECES.WHITE_PAWN_1);
            placePiece(board, 'B5', PIECES.BLACK_PAWN_1);
            const data = {
                piecePos: 'A5',
                action: 'B6' + ACTION_TYPES.EN_PASSANT,
            }

            const { error } = validateMove(board, data, undefined, undefined, 'XX', undefined, 'B5');

            expect(error).toBe(null);
        });

        it('Should find an error for a white pawn who committed en passant when the option expired', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A5', PIECES.WHITE_PAWN_1);
            placePiece(board, 'B5', PIECES.BLACK_PAWN_1);
            const data = {
                piecePos: 'A5',
                action: 'B6' + ACTION_TYPES.EN_PASSANT,
            }

            const { error } = validateMove(board, data, undefined, undefined, 'XX', undefined, undefined);

            expect(error).not.toBe(null);
        });

        it('Should find no error for a white pawn starting position', () => {
            const board = createStarterBoard();
            const doubleMove = {
                piecePos: 'A2',
                action: 'A4' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.MOVE,
            }
            const transform = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.TRANSFORM,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove, undefined, undefined, 'XX');
            const { error: singleMoveError } = validateMove(board, singleMove, undefined, undefined, 'XX');
            const { error: transformError } = validateMove(board, transform, undefined, undefined, 'XX');

            expect(singleMoveError).toBe(null);
            expect(doubleMoveError).toBe(null);
            expect(transformError).not.toBe(null);
        });

        it('Should find an error for an invalid double move for a white pawn', () => {
            const board = createStarterBoard();
            placePiece(board, 'A2', PIECE_VALUES.EMPTY);
            placePiece(board, 'A3', PIECES.WHITE_PAWN_1);

            const doubleMoveData = {
                piecePos: 'A3',
                action: 'A5' + ACTION_TYPES.MOVE,
            }
            const singleMoveData = {
                piecePos: 'A3',
                action: 'A4' + ACTION_TYPES.MOVE,
            }
            const transform = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.TRANSFORM,
            }

            const { error: invalidError } = validateMove(board, doubleMoveData);
            const { error: validError } = validateMove(board, singleMoveData);
            const { error: transformError } = validateMove(board, transform);

            expect(invalidError).not.toBe(null);
            expect(validError).toBe(null);
            expect(transformError).not.toBe(null);
        });

        it('Should find an error for an enemy 2 spaces away from a white pawn', () => {
            const board = createStarterBoard();
            placePiece(board, 'A4', PIECES.BLACK_PAWN_1);
            const doubleMove = {
                piecePos: 'A2',
                action: 'A4' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.MOVE,
            }
            const capture = {
                piecePos: 'A2',
                action: 'B4' + ACTION_TYPES.CAPTURE,
            }
            const transform = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.TRANSFORM,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove);
            const { error: singleMoveError } = validateMove(board, singleMove);
            const { error: captureError } = validateMove(board, capture);
            const { error: transformError } = validateMove(board, transform);

            expect(singleMoveError).toBe(null);
            expect(doubleMoveError).not.toBe(null);
            expect(captureError).not.toBe(null);
            expect(transformError).not.toBe(null);
        });

        it('Should find an error for an enemy 1 space away from a white pawn', () => {
            const board = createStarterBoard();
            placePiece(board, 'A3', PIECES.BLACK_PAWN_1);
            const doubleMove = {
                piecePos: 'A2',
                action: 'A4' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.MOVE,
            }
            const capture = {
                piecePos: 'A2',
                action: 'B4' + ACTION_TYPES.CAPTURE,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove);
            const { error: singleMoveError } = validateMove(board, singleMove);
            const { error: captureError } = validateMove(board, capture);

            expect(singleMoveError).not.toBe(null);
            expect(doubleMoveError).not.toBe(null);
            expect(captureError).not.toBe(null);
        });

        it('Should find an error for an ally 2 spaces away from a white pawn', () => {
            const board = createStarterBoard();
            placePiece(board, 'A4', PIECES.WHITE_ROOK_1);
            const doubleMove = {
                piecePos: 'A2',
                action: 'A4' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.MOVE,
            }
            const capture = {
                piecePos: 'A2',
                action: 'B4' + ACTION_TYPES.CAPTURE,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove);
            const { error: singleMoveError } = validateMove(board, singleMove);
            const { error: captureError } = validateMove(board, capture);

            expect(singleMoveError).toBe(null);
            expect(doubleMoveError).not.toBe(null);
            expect(captureError).not.toBe(null);
        });

        it('Should find an error for an ally 1 space away from a white pawn', () => {
            const board = createStarterBoard();
            placePiece(board, 'A3', PIECES.WHITE_ROOK_1);
            const doubleMove = {
                piecePos: 'A2',
                action: 'A4' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.MOVE,
            }
            const capture = {
                piecePos: 'A2',
                action: 'B4' + ACTION_TYPES.CAPTURE,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove);
            const { error: singleMoveError } = validateMove(board, singleMove);
            const { error: captureError } = validateMove(board, capture);

            expect(singleMoveError).not.toBe(null);
            expect(doubleMoveError).not.toBe(null);
            expect(captureError).not.toBe(null);
        });

        it('Should not allow a white pawn to transform if it is not near the last row', () => {
            const board = createStarterBoard();
            const data = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.TRANSFORM,
            }

            const { error } = validateMove(board, data);

            expect(error).not.toBe(null);
        });

        it('Should not allow a white pawn to move in any direction other than south', () => {
            const board = createStarterBoard();
            removePiece(board, 'A1');
            removePiece(board, 'A2');
            removePiece(board, 'B1');
            removePiece(board, 'C1');
            removePiece(board, 'C2');

            const invalidMoves = [
                'A1', 'B1', 'C1', 'A2', 'C2', 'A3', 'C3'
            ]
            const validMoves = [
                'B4'
            ]

            invalidMoves.forEach(move => {
                const data = {
                    piecePos: 'B2',
                    action: move + ACTION_TYPES.MOVE,
                }

                const { error } = validateMove(board, data);

                expect(error).not.toBe(null);
            });

            validMoves.forEach(move => {
                const data = {
                    piecePos: 'B2',
                    action: move + ACTION_TYPES.MOVE,
                }

                const { error } = validateMove(board, data);

                expect(error).toBe(null);
            });
        })

        it('Should allow a white pawn to transform if a piece is blocking the pawn', () => {
            const board = createStarterBoard();
            removePiece(board, 'A2');
            placePiece(board, 'A7', PIECES.WHITE_PAWN_1);
            const data = {
                piecePos: 'A7',
                action: 'A8' + ACTION_TYPES.TRANSFORM,
            }

            const { error } = validateMove(board, data);

            expect(error).not.toBe(null);
        });

        it('Should allow a white pawn to transform if it is near the last row', () => {
            const board = createStarterBoard();
            removePiece(board, 'A2');
            placePiece(board, 'A7', PIECES.WHITE_PAWN_1);
            removePiece(board, 'A8');
            const data = {
                piecePos: 'A7',
                action: 'A8' + ACTION_TYPES.TRANSFORM,
            }

            const { error } = validateMove(board, data);

            expect(error).toBe(null);
        });

        it('Should allow a white pawn to attack enemy pieces diagonally', () => {
            const board = createEmptyBoard();
            placePiece(board, 'C3', PIECES.WHITE_PAWN_1);
            placePiece(board, 'B4', PIECES.BLACK_PAWN_2);
            placePiece(board, 'D4', PIECES.BLACK_PAWN_1);
            const leftCapture = {
                piecePos: 'C3',
                action: 'B4' + ACTION_TYPES.CAPTURE,
            }
            const rightCapture = {
                piecePos: 'C3',
                action: 'D4' + ACTION_TYPES.CAPTURE,
            }

            const { error: leftError } = validateMove(board, leftCapture);
            const { error: rightError } = validateMove(board, rightCapture);

            expect(leftError).toBe(null);
            expect(rightError).toBe(null);
        });

        it('Should not allow a white pawn to attack ally pieces diagonally', () => {
            const board = createEmptyBoard();
            placePiece(board, 'C3', PIECES.WHITE_PAWN_1);
            placePiece(board, 'B4', PIECES.WHITE_PAWN_2);
            placePiece(board, 'D4', PIECES.WHITE_PAWN_3);
            const leftCapture = {
                piecePos: 'C3',
                action: 'B4' + ACTION_TYPES.CAPTURE,
            }
            const rightCapture = {
                piecePos: 'C3',
                action: 'D4' + ACTION_TYPES.CAPTURE,
            }

            const { error: leftError } = validateMove(board, leftCapture);
            const { error: rightError } = validateMove(board, rightCapture);

            expect(leftError).not.toBe(null);
            expect(rightError).not.toBe(null);
        });

        it('Should not allow a white pawn to attack enemy pieces if they are too far away', () => {
            const board = createEmptyBoard();
            placePiece(board, 'C3', PIECES.WHITE_PAWN_1);
            placePiece(board, 'E5', PIECES.BLACK_PAWN_1);
            placePiece(board, 'A5', PIECES.BLACK_PAWN_2);
            const leftCapture = {
                piecePos: 'C3',
                action: 'A5' + ACTION_TYPES.CAPTURE,
            }
            const rightCapture = {
                piecePos: 'C3',
                action: 'E5' + ACTION_TYPES.CAPTURE,
            }

            const { error: leftError } = validateMove(board, leftCapture);
            const { error: rightError } = validateMove(board, rightCapture);

            expect(leftError).not.toBe(null);
            expect(rightError).not.toBe(null);
        });

        it('Should find no error for a black pawn starting position', () => {
            const board = createStarterBoard();
            const doubleMove = {
                piecePos: 'A7',
                action: 'A5' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A7',
                action: 'A6' + ACTION_TYPES.MOVE,
            }
            const transform = {
                piecePos: 'A7',
                action: 'A6' + ACTION_TYPES.TRANSFORM,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove);
            const { error: singleMoveError } = validateMove(board, singleMove);
            const { error: transformError } = validateMove(board, transform);

            expect(singleMoveError).toBe(null);
            expect(doubleMoveError).toBe(null);
            expect(transformError).not.toBe(null);
        });

        it('Should find an error for an invalid double move for a black pawn', () => {
            const board = createStarterBoard();
            removePiece(board, 'A7');
            placePiece(board, 'A6', PIECES.BLACK_PAWN_1)

            const doubleMoveData = {
                piecePos: 'A6',
                action: 'A4' + ACTION_TYPES.MOVE,
            }
            const singleMoveData = {
                piecePos: 'A6',
                action: 'A5' + ACTION_TYPES.MOVE,
            }
            const transform = {
                piecePos: 'A6',
                action: 'A5' + ACTION_TYPES.TRANSFORM,
            }

            const { error: invalidError } = validateMove(board, doubleMoveData);
            const { error: validError } = validateMove(board, singleMoveData);
            const { error: transformError } = validateMove(board, transform);

            expect(invalidError).not.toBe(null);
            expect(validError).toBe(null);
            expect(transformError).not.toBe(null);
        });

        it('Should find an error for an enemy 2 spaces away from a black pawn', () => {
            const board = createStarterBoard();
            placePiece(board, 'A5', PIECES.WHITE_PAWN_1);
            const doubleMove = {
                piecePos: 'A7',
                action: 'A5' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A7',
                action: 'A6' + ACTION_TYPES.MOVE,
            }
            const capture = {
                piecePos: 'A7',
                action: 'A5' + ACTION_TYPES.CAPTURE,
            }
            const transform = {
                piecePos: 'A7',
                action: 'A6' + ACTION_TYPES.TRANSFORM,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove);
            const { error: singleMoveError } = validateMove(board, singleMove);
            const { error: captureError } = validateMove(board, capture);
            const { error: transformError } = validateMove(board, transform);

            expect(singleMoveError).toBe(null);
            expect(doubleMoveError).not.toBe(null);
            expect(captureError).not.toBe(null);
            expect(transformError).not.toBe(null);
        });

        it('Should find an error for an enemy 1 space away from a black pawn', () => {
            const board = createStarterBoard();
            placePiece(board, 'A6', PIECES.WHITE_PAWN_1)
            const doubleMove = {
                piecePos: 'A7',
                action: 'A5' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A7',
                action: 'A6' + ACTION_TYPES.MOVE,
            }
            const capture = {
                piecePos: 'A7',
                action: 'B6' + ACTION_TYPES.CAPTURE,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove);
            const { error: singleMoveError } = validateMove(board, singleMove);
            const { error: captureError } = validateMove(board, capture);

            expect(singleMoveError).not.toBe(null);
            expect(doubleMoveError).not.toBe(null);
            expect(captureError).not.toBe(null);
        });

        it('Should find an error for an ally 2 spaces away from a black pawn', () => {
            const board = createStarterBoard();
            placePiece(board, 'A5', PIECES.BLACK_PAWN_2)
            const doubleMove = {
                piecePos: 'A7',
                action: 'A5' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A7',
                action: 'A6' + ACTION_TYPES.MOVE,
            }
            const capture = {
                piecePos: 'A7',
                action: 'A5' + ACTION_TYPES.CAPTURE,
            }
            const transform = {
                piecePos: 'A7',
                action: 'A6' + ACTION_TYPES.TRANSFORM,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove);
            const { error: singleMoveError } = validateMove(board, singleMove);
            const { error: captureError } = validateMove(board, capture);
            const { error: transformError } = validateMove(board, transform);

            expect(singleMoveError).toBe(null);
            expect(doubleMoveError).not.toBe(null);
            expect(captureError).not.toBe(null);
            expect(transformError).not.toBe(null);
        });

        it('Should find an error for an ally 1 space away from a black pawn', () => {
            const board = createStarterBoard();
            placePiece(board, 'A3', PIECES.BLACK_ROOK_1);
            const doubleMove = {
                piecePos: 'A2',
                action: 'A4' + ACTION_TYPES.MOVE,
            }
            const singleMove = {
                piecePos: 'A2',
                action: 'A3' + ACTION_TYPES.MOVE,
            }
            const capture = {
                piecePos: 'A2',
                action: 'B4' + ACTION_TYPES.CAPTURE,
            }

            const { error: doubleMoveError } = validateMove(board, doubleMove);
            const { error: singleMoveError } = validateMove(board, singleMove);
            const { error: captureError } = validateMove(board, capture);

            expect(singleMoveError).not.toBe(null);
            expect(doubleMoveError).not.toBe(null);
            expect(captureError).not.toBe(null);
        });

        it('Should not allow a black pawn to transform if it is not near the first row', () => {
            const board = createStarterBoard();
            const data = {
                piecePos: 'A7',
                action: 'A1' + ACTION_TYPES.TRANSFORM,
            }

            const { error } = validateMove(board, data);

            expect(error).not.toBe(null);
        });

        it('Should not allow a black pawn to move in any direction other than north', () => {
            const board = createEmptyBoard();
            placePiece(board, 'B7', PIECES.BLACK_PAWN_1);
            const invalidMoves = [
                'A8', 'B8', 'C8', 'A7', 'C7', 'A6', 'C6'
            ]
            const validMoves = [
                'B5', 'B6'
            ]

            invalidMoves.forEach(move => {
                const data = {
                    piecePos: 'B7',
                    action: move + ACTION_TYPES.MOVE,
                }

                const { error } = validateMove(board, data);

                expect(error).not.toBe(null);
            });

            validMoves.forEach(move => {
                const data = {
                    piecePos: 'B7',
                    action: move + ACTION_TYPES.MOVE,
                }

                const { error } = validateMove(board, data);

                expect(error).toBe(null);
            });
        })

        it('Should not allow a black pawn to transform if a piece is blocking the pawn', () => {
            const board = createStarterBoard();
            removePiece(board, 'A7');
            placePiece(board, 'A2', PIECES.BLACK_PAWN_1);
            const data = {
                piecePos: 'A2',
                action: 'A1' + ACTION_TYPES.TRANSFORM,
            }

            const { error } = validateMove(board, data);

            expect(error).not.toBe(null);
        });

        it('Should allow a black pawn to transform if it is near the last row', () => {
            const board = createStarterBoard();
            removePiece(board, 'A7');
            placePiece(board, 'A2', PIECES.BLACK_PAWN_1);
            removePiece(board, 'A1');
            const data = {
                piecePos: 'A2',
                action: 'A1' + ACTION_TYPES.TRANSFORM,
            }

            const { error } = validateMove(board, data);

            expect(error).toBe(null);
        });

        it('Should allow a black pawn to attack enemy pieces diagonally', () => {
            const board = createEmptyBoard();
            placePiece(board, 'C3', PIECES.BLACK_PAWN_1);
            placePiece(board, 'B2', PIECES.WHITE_PAWN_2);
            placePiece(board, 'D2', PIECES.WHITE_PAWN_1);
            const leftCapture = {
                piecePos: 'C3',
                action: 'B2' + ACTION_TYPES.CAPTURE,
            }
            const rightCapture = {
                piecePos: 'C3',
                action: 'D2' + ACTION_TYPES.CAPTURE,
            }

            const { error: leftError } = validateMove(board, leftCapture);
            const { error: rightError } = validateMove(board, rightCapture);

            expect(leftError).toBe(null);
            expect(rightError).toBe(null);
        });

        it('Should not allow a black pawn to attack ally pieces diagonally', () => {
            const board = createEmptyBoard();
            placePiece(board, 'C3', PIECES.BLACK_PAWN_1);
            placePiece(board, 'B2', PIECES.BLACK_PAWN_2);
            placePiece(board, 'D2', PIECES.BLACK_PAWN_3);
            const leftCapture = {
                piecePos: 'C3',
                action: 'B2' + ACTION_TYPES.CAPTURE,
            }
            const rightCapture = {
                piecePos: 'C3',
                action: 'D2' + ACTION_TYPES.CAPTURE,
            }

            const { error: leftError } = validateMove(board, leftCapture, undefined, {});
            const { error: rightError } = validateMove(board, rightCapture, undefined, {});

            expect(leftError).not.toBe(null);
            expect(rightError).not.toBe(null);
        });

        it('Should not allow a black pawn to attack enemy pieces if they are too far away', () => {
            const board = createEmptyBoard();
            placePiece(board, 'C3', PIECES.BLACK_PAWN_1);
            placePiece(board, 'A1', PIECES.WHITE_PAWN_1);
            placePiece(board, 'E1', PIECES.WHITE_PAWN_2);
            const leftCapture = {
                piecePos: 'C3',
                action: 'A1' + ACTION_TYPES.CAPTURE,
            }
            const rightCapture = {
                piecePos: 'C3',
                action: 'E1' + ACTION_TYPES.CAPTURE,
            }

            const { error: leftError } = validateMove(board, leftCapture, undefined, {});
            const { error: rightError } = validateMove(board, rightCapture, undefined, {});

            expect(leftError).not.toBe(null);
            expect(rightError).not.toBe(null);
        });
    });

    describe('Tests transformed pawns', () => {
        it('Should allow a knight pawn to move like a knight', () => {
            const board = createEmptyBoard();
            placePiece(board, 'D4', PIECES.WHITE_PAWN_1);
            const registry = {
                [PIECE_COLORS.WHITE + PIECE_VALUES.PAWN + '1']: PIECE_VALUES.KNIGHT
            }
            const knightMove = {
                piecePos: 'D4',
                action: 'C6' + ACTION_TYPES.MOVE,
            }
            const pawnMove = {
                piecePos: 'D4',
                action: 'D5' + ACTION_TYPES.MOVE,
            }

            const { error: knightError } = validateMove(board, knightMove, undefined, registry);
            const { error: pawnError } = validateMove(board, pawnMove, undefined, registry);

            expect(knightError).toBe(null);
            expect(pawnError).not.toBe(null);
        });

        it('Should allow a knight pawn to attack like a knight', () => {
            const board = createEmptyBoard();
            placePiece(board, 'D4', PIECES.WHITE_PAWN_1);
            placePiece(board, 'F3', PIECES.BLACK_PAWN_1);
            placePiece(board, 'E5', PIECES.BLACK_PAWN_2);
            const registry = {
                [PIECE_COLORS.WHITE + PIECE_VALUES.PAWN + '1']: PIECE_VALUES.KNIGHT
            }
            const knightCapture = {
                piecePos: 'D4',
                action: 'F3' + ACTION_TYPES.CAPTURE,
            }
            const pawnCapture = {
                piecePos: 'D4',
                action: 'E5' + ACTION_TYPES.CAPTURE,
            }

            const { error: knightError } = validateMove(board, knightCapture, undefined, registry);
            const { error: pawnError } = validateMove(board, pawnCapture, undefined, registry);

            expect(knightError).toBe(null);
            expect(pawnError).not.toBe(null);
        });
    });

    describe('Tests knights', () => {
        it('Should find no error for moving a knight', () => {
            const board = createEmptyBoard();
            placePiece(board, 'D4', PIECES.WHITE_KNIGHT_1);
            const validMoves = [
                'B3', 'B5', 'C2', 'C6', 'E2', 'E6', 'F3', 'F5'
            ];
            const invalidMoves = [
                'C3', 'D3', 'E3', 'C4', 'E4', 'C5', 'D5', 'E5'
            ];

            validMoves.forEach(move => {
                const data = {
                    piecePos: 'D4',
                    action: move + ACTION_TYPES.MOVE,
                }

                const { error } = validateMove(board, data);

                expect(error).toBe(null);
            });

            invalidMoves.forEach(move => {
                const data = {
                    piecePos: 'D4',
                    action: move + ACTION_TYPES.MOVE,
                }

                const { error } = validateMove(board, data);

                expect(error).not.toBe(null);
            });
        });

        it('Should find no error for capturing enemies with a knight', () => {
            const board = createEmptyBoard();
            placePiece(board, 'D4', PIECES.WHITE_KNIGHT_1);
            placePiece(board, 'B3', PIECES.BLACK_PAWN_1);
            placePiece(board, 'F3', PIECES.BLACK_PAWN_2);
            placePiece(board, 'B5', PIECES.BLACK_PAWN_3);
            placePiece(board, 'F5', PIECES.BLACK_PAWN_4);
            placePiece(board, 'C2', PIECES.BLACK_PAWN_5);
            placePiece(board, 'E2', PIECES.BLACK_PAWN_6);
            placePiece(board, 'C6', PIECES.BLACK_PAWN_7);
            placePiece(board, 'E6', PIECES.BLACK_PAWN_8);
            const validCaptures = [
                'B3', 'B5', 'C2', 'C6', 'E2', 'E6', 'F3', 'F5'
            ];
            const invalidCaptures = [
                'C3', 'D3', 'E3', 'C4', 'E4', 'C5', 'D5', 'E5'
            ];

            validCaptures.forEach(move => {
                const data = {
                    piecePos: 'D4',
                    action: move + ACTION_TYPES.CAPTURE,
                }

                const { error } = validateMove(board, data);

                expect(error).toBe(null);
            });

            invalidCaptures.forEach(move => {
                const data = {
                    piecePos: 'D4',
                    action: move + ACTION_TYPES.CAPTURE,
                }

                const { error } = validateMove(board, data);

                expect(error).not.toBe(null);
            });
        });

        it('Should find error for capturing allies with a knight', () => {
            const board = createEmptyBoard();
            placePiece(board, 'D4', PIECES.WHITE_KNIGHT_1);
            placePiece(board, 'B3', PIECES.WHITE_PAWN_1);
            placePiece(board, 'F3', PIECES.WHITE_PAWN_2);
            placePiece(board, 'B5', PIECES.WHITE_PAWN_3);
            placePiece(board, 'F5', PIECES.WHITE_PAWN_4);
            placePiece(board, 'C2', PIECES.WHITE_PAWN_5);
            placePiece(board, 'E2', PIECES.WHITE_PAWN_6);
            placePiece(board, 'C6', PIECES.WHITE_PAWN_7);
            placePiece(board, 'E6', PIECES.WHITE_PAWN_8);
            const validCaptures = [
                'B3', 'B5', 'C2', 'C6', 'E2', 'E6', 'F3', 'F5'
            ];

            validCaptures.forEach(move => {
                const data = {
                    piecePos: 'D4',
                    action: move + ACTION_TYPES.CAPTURE,
                }

                const { error } = validateMove(board, data);

                expect(error).not.toBe(null);
            });
        });

        it('Should find no error for moving a knight past other pieces', () => {
            const board = createEmptyBoard();
            placePiece(board, 'D4', PIECES.WHITE_KNIGHT_1);
            placePiece(board, 'E4', PIECES.WHITE_PAWN_1);
            placePiece(board, 'D5', PIECES.WHITE_PAWN_2);
            placePiece(board, 'D3', PIECES.WHITE_PAWN_3);
            placePiece(board, 'C4', PIECES.WHITE_PAWN_4);
            const data = {
                piecePos: 'D4',
                action: 'B5' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).toBe(null);
        });
    })

    describe('Tests queens', () => {
        it('Should find no error for moving a queen diagonally to the other end of the board', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_QUEEN);
            const data = {
                piecePos: 'A1',
                action: 'H8' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).toBe(null);
        });

        it('Should find no error for moving a queen horizontally to the other end of the board', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_QUEEN);
            const data = {
                piecePos: 'A1',
                action: 'H1' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).toBe(null);
        });

        it('Should find no error for moving a queen vertically to the other end of the board', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_QUEEN);
            const data = {
                piecePos: 'A1',
                action: 'A8' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).toBe(null);
        });

        it('Should find an error for moving a queen diagonally past a piece', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_QUEEN);
            placePiece(board, 'B2', PIECES.WHITE_PAWN_1);
            const data = {
                piecePos: 'A1',
                action: 'C3' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).not.toBe(null);
        });
    });

    describe('Tests kings', () => {
        it('Should find no error for moving a king diagonally', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_KING);
            const data = {
                piecePos: 'A1',
                action: 'B2' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).toBe(null);
        });

        it('Should find no error for moving a king horizontally', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_KING);
            const data = {
                piecePos: 'A1',
                action: 'B1' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).toBe(null);
        });

        it('Should find no error for moving a king vertically', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_KING);
            const data = {
                piecePos: 'A1',
                action: 'A2' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).toBe(null);
        });

        it('Should find an error for moving a king diagonally past a piece', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_KING);
            placePiece(board, 'B2', PIECES.WHITE_PAWN_1);
            const data = {
                piecePos: 'A1',
                action: 'C3' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        });

        it('Should find an error for moving a king into a dangerous pawn position', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_KING);
            placePiece(board, 'C3', PIECES.BLACK_PAWN_1);
            const data = {
                piecePos: 'A1',
                action: 'B2' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        })

        it('Should find an error for moving a king into a dangerous bishop position', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_KING);
            placePiece(board, 'C3', PIECES.BLACK_BISHOP_1);
            const data = {
                piecePos: 'A1',
                action: 'B2' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        })

        it('Should find an error for moving a king into a dangerous rook position', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', WHITE + KING);
            placePiece(board, 'H2', PIECES.BLACK_ROOK_1);
            const data = {
                piecePos: 'A1',
                action: 'A2' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        })

        it('Should find an error for moving a king into a dangerous queen position', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_KING);
            placePiece(board, 'B8', PIECES.BLACK_QUEEN);
            const data = {
                piecePos: 'A1',
                action: 'B1' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        });

        it('Should not find an error for moving a king into a dangerous queen position that is an ally', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.BLACK_KING);
            placePiece(board, 'B8', PIECES.BLACK_QUEEN);
            const data = {
                piecePos: 'A1',
                action: 'B1' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).toBe(null);
        });

        it('Should find an error for having a king capture a protected queen', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', WHITE + KING);
            placePiece(board, 'B2', BLACK + QUEEN);
            placePiece(board, 'C3', PIECES.BLACK_PAWN_1);

            const data = {
                piecePos: 'A1',
                action: 'B2' + ACTION_TYPES.CAPTURE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        })

        it('Should allow a king to kill a queen', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', WHITE + KING);
            placePiece(board, 'B2', BLACK + QUEEN);
            const data = {
                piecePos: 'A1',
                action: 'B2' + ACTION_TYPES.CAPTURE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).toBe(null);
        });

        it('Should find an error for having a king move into a protected transformed queen pawn position', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_KING);
            placePiece(board, 'B8', PIECES.BLACK_PAWN_1);

            const data = {
                piecePos: 'A1',
                action: 'B1' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }
            const registry = {
                [PIECES.BLACK_PAWN_1]: QUEEN
            }

            const { error } = validateMove(board, data, canCastle, registry);

            expect(error).not.toBe(null);
        })

        it('Should find an error for having a king move into a protected transformed knight pawn position', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_KING);
            placePiece(board, 'C1', PIECES.BLACK_PAWN_1);
            const data = {
                piecePos: 'A1',
                action: 'A2' + ACTION_TYPES.MOVE,
            }
            const canCastle = {
                1: true,
                2: true
            }
            const registry = {
                [BLACK + PAWN + '1']: KNIGHT
            }

            const { error } = validateMove(board, data, canCastle, registry);

            expect(error).not.toBe(null);
        });

        it('Should allow a king make a long castle', () => {
            const board = createEmptyBoard();
            placePiece(board, 'E1', PIECES.WHITE_KING);
            placePiece(board, 'A1', PIECES.WHITE_ROOK_1);
            const data = {
                piecePos: 'E1',
                action: 'C1' + ACTION_TYPES.CASTLE,
            }
            const canCastle = {
                1: true,
                2: false
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).toBe(null);
        });

        it('Should allow a king make a short castle', () => {
            const board = createEmptyBoard();
            placePiece(board, 'E8', PIECES.BLACK_KING);
            placePiece(board, 'H8', PIECES.BLACK_ROOK_2);
            const data = {
                piecePos: 'E8',
                action: 'G8' + ACTION_TYPES.CASTLE,
            }
            const canCastle = {
                1: false,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).toBe(null);
        });

        it('Should not allow a king make a long castle when a piece is in the way', () => {
            const board = createEmptyBoard();
            placePiece(board, 'E1', PIECES.WHITE_KING);
            placePiece(board, 'A1', PIECES.WHITE_ROOK_1);
            placePiece(board, 'C1', PIECES.WHITE_PAWN_1);
            const data = {
                piecePos: 'E1',
                action: 'C1' + ACTION_TYPES.CASTLE,
            }
            const canCastle = {
                1: true,
                2: false
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        });

        it('Should not allow a king make a short castle when a spot is not safe', () => {
            const board = createEmptyBoard();
            placePiece(board, 'E8', PIECES.BLACK_KING);
            placePiece(board, 'H8', PIECES.BLACK_ROOK_2);
            placePiece(board, 'F1', PIECES.WHITE_ROOK_1);
            const data = {
                piecePos: 'E8',
                action: 'G8' + ACTION_TYPES.CASTLE,
            }
            const canCastle = {
                1: false,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        });

        it('Should not allow a king make a short castle when they lost the ability to', () => {
            const board = createEmptyBoard();
            placePiece(board, 'E8', PIECES.BLACK_KING);
            placePiece(board, 'H8', PIECES.BLACK_ROOK_2);
            const data = {
                piecePos: 'E8',
                action: 'G8' + ACTION_TYPES.CASTLE,
            }
            const canCastle = {
                1: false,
                2: false
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        });

        it('Should not allow a king make a short castle when there is an enemy behind them', () => {
            const board = createEmptyBoard();
            placePiece(board, 'E8', PIECES.BLACK_KING);
            placePiece(board, 'H8', PIECES.BLACK_ROOK_2);
            placePiece(board, 'A8', PIECES.WHITE_ROOK_1);
            const data = {
                piecePos: 'E8',
                action: 'G8' + ACTION_TYPES.CASTLE,
            }
            const canCastle = {
                1: true,
                2: true
            }

            const { error } = validateMove(board, data, canCastle);

            expect(error).not.toBe(null);
        });
    });

    describe('Tests rooks', () => {
        it('Should find no error for moving a rook horizontally', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_ROOK_1);
            const data = {
                piecePos: 'A1',
                action: 'H1' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).toBe(null);
        });

        it('Should find an error for moving a rook horizontally past a piece', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_ROOK_1);
            placePiece(board, 'B1', PIECES.WHITE_PAWN_1);
            const data = {
                piecePos: 'A1',
                action: 'H1' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).not.toBe(null);
        });

        it('Should find no error for moving a rook vertically', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_ROOK_1);
            const data = {
                piecePos: 'A1',
                action: 'A8' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).toBe(null);
        });

        it('Should find an error for moving a rook vertically past a piece', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_ROOK_1);
            placePiece(board, 'A2', PIECES.WHITE_PAWN_1);
            const data = {
                piecePos: 'A1',
                action: 'A8' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).not.toBe(null);
        });
    });

    describe('Tests bishops', () => {
        it('Should find no error for moving a bishop diagonally', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_BISHOP_1);
            const data = {
                piecePos: 'A1',
                action: 'H8' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).toBe(null);
        });

        it('Should find an error for moving a bishop diagonally past a piece', () => {
            const board = createEmptyBoard();
            placePiece(board, 'A1', PIECES.WHITE_BISHOP_1);
            placePiece(board, 'B2', PIECES.WHITE_PAWN_1);
            const data = {
                piecePos: 'A1',
                action: 'H8' + ACTION_TYPES.MOVE,
            }

            const { error } = validateMove(board, data);

            expect(error).not.toBe(null);
        });
    });
});

describe('Tests getTurnInfo', () => {
    it('Should recognize an en passant opportunity for white', () => {
        const board = {
            "A1": "WR1",
            "B1": "WN1",
            "C1": "WB1",
            "D1": "WQ",
            "E1": "WK",
            "F1": "WB2",
            "G1": "WN2",
            "H1": "WR2",
            "A3": "WP1",
            "B4": "WP2",
            "C2": "WP3",
            "D2": "WP4",
            "E2": "WP5",
            "F2": "WP6",
            "G2": "WP7",
            "H4": "WP8",
            "A8": "BR1",
            "B8": "BN1",
            "C8": "BB1",
            "D8": "BQ",
            "E8": "BK",
            "F8": "BB2",
            "G8": "BN2",
            "H8": "BR2",
            "A7": "BP1",
            "B7": "BP2",
            "C7": "BP3",
            "D7": "BP4",
            "E7": "BP5",
            "F7": "BP6",
            "G4": "BP7",
            "H7": "BP8"
        }
        const player = PIECE_COLORS.BLACK;
        const positions = {
            "WR1": "A1",
            "WN1": "B1",
            "WB1": "C1",
            "WQ": "D1",
            "WK": "E1",
            "WB2": "F1",
            "WN2": "G1",
            "WR2": "H1",
            "WP1": "A3",
            "WP2": "B4",
            "WP3": "C2",
            "WP4": "D2",
            "WP5": "E2",
            "WP6": "F2",
            "WP7": "G2",
            "WP8": "H4",
            "BR1": "A8",
            "BN1": "B8",
            "BB1": "C8",
            "BQ": "D8",
            "BK": "E8",
            "BB2": "F8",
            "BN2": "G8",
            "BR2": "H8",
            "BP1": "A7",
            "BP2": "B7",
            "BP3": "C7",
            "BP4": "D7",
            "BP5": "E7",
            "BP6": "F7",
            "BP7": "G4",
            "BP8": "H7"
        }
        const enPassant = 'H4'

        const { actions, isKingSafe } = getTurnInfo(board, player, positions, {}, { 1: true, 2: true }, enPassant);

        expect(isKingSafe).toBe(true);
        expect(Object.keys(actions).length).toBe(16);
        expect(actions[BLACK + PAWN + '1']).toEqual(['A6' + MOVE, 'A5' + MOVE]);
        expect(actions[BLACK + PAWN + '2']).toEqual(['B6' + MOVE, 'B5' + MOVE]);
        expect(actions[BLACK + PAWN + '3']).toEqual(['C6' + MOVE, 'C5' + MOVE]);
        expect(actions[BLACK + PAWN + '4']).toEqual(['D6' + MOVE, 'D5' + MOVE]);
        expect(actions[BLACK + PAWN + '5']).toEqual(['E6' + MOVE, 'E5' + MOVE]);
        expect(actions[BLACK + PAWN + '6']).toEqual(['F6' + MOVE, 'F5' + MOVE]);
        expect(actions[PIECES.BLACK_PAWN_7]).toEqual(['G3' + MOVE, 'H3' + EN_PASSANT]);
        expect(actions[BLACK + PAWN + '8']).toEqual(['H6' + MOVE, 'H5' + MOVE]);
        expect(actions[BLACK + ROOK + '1']).toEqual([]);
        expect(actions[BLACK + ROOK + '2']).toEqual([]);
        expect(actions[BLACK + KNIGHT + '1']).toEqual(['A6' + MOVE, 'C6' + MOVE]);
        expect(actions[BLACK + KNIGHT + '2']).toEqual(['F6' + MOVE, 'H6' + MOVE]);
        expect(actions[BLACK + BISHOP + '1']).toEqual([]);
        expect(actions[BLACK + BISHOP + '2']).toEqual(['G7' + MOVE, 'H6' + MOVE]);
        expect(actions[BLACK + QUEEN]).toEqual([]);
        expect(actions[BLACK + KING]).toEqual([]);
    });

    it('Should generate all the starter moves for white', () => {
        const board = createStarterBoard();

        const { actions, isKingSafe } = getTurnInfo(board, PIECE_COLORS.WHITE, INITIAL_BOARD_POSITIONS, {}, { 1: true, 2: true });

        expect(isKingSafe).toBe(true);
        expect(Object.keys(actions).length).toBe(16);
        expect(actions[WHITE + PAWN + '1']).toEqual(['A3' + MOVE, 'A4' + MOVE]);
        expect(actions[WHITE + PAWN + '2']).toEqual(['B3' + MOVE, 'B4' + MOVE]);
        expect(actions[WHITE + PAWN + '3']).toEqual(['C3' + MOVE, 'C4' + MOVE]);
        expect(actions[WHITE + PAWN + '4']).toEqual(['D3' + MOVE, 'D4' + MOVE]);
        expect(actions[WHITE + PAWN + '5']).toEqual(['E3' + MOVE, 'E4' + MOVE]);
        expect(actions[WHITE + PAWN + '6']).toEqual(['F3' + MOVE, 'F4' + MOVE]);
        expect(actions[WHITE + PAWN + '7']).toEqual(['G3' + MOVE, 'G4' + MOVE]);
        expect(actions[WHITE + PAWN + '8']).toEqual(['H3' + MOVE, 'H4' + MOVE]);
        expect(actions[WHITE + ROOK + '1']).toEqual([]);
        expect(actions[WHITE + ROOK + '2']).toEqual([]);
        expect(actions[WHITE + KNIGHT + '1']).toEqual(['A3' + MOVE, 'C3' + MOVE]);
        expect(actions[WHITE + KNIGHT + '2']).toEqual(['F3' + MOVE, 'H3' + MOVE]);
        expect(actions[WHITE + BISHOP + '1']).toEqual([]);
        expect(actions[WHITE + BISHOP + '2']).toEqual([]);
        expect(actions[WHITE + QUEEN]).toEqual([]);
        expect(actions[WHITE + KING]).toEqual([]);
    });

    it('Should generate all possible moves for black', () => {
        const board = createStarterBoard();

        const { actions, isKingSafe } = getTurnInfo(board, PIECE_COLORS.BLACK, INITIAL_BOARD_POSITIONS, {}, { 1: true, 2: true });

        expect(isKingSafe).toBe(true);
        expect(Object.keys(actions).length).toBe(16);
        expect(actions[BLACK + PAWN + '1']).toEqual(['A6' + MOVE, 'A5' + MOVE]);
        expect(actions[BLACK + PAWN + '2']).toEqual(['B6' + MOVE, 'B5' + MOVE]);
        expect(actions[BLACK + PAWN + '3']).toEqual(['C6' + MOVE, 'C5' + MOVE]);
        expect(actions[BLACK + PAWN + '4']).toEqual(['D6' + MOVE, 'D5' + MOVE]);
        expect(actions[BLACK + PAWN + '5']).toEqual(['E6' + MOVE, 'E5' + MOVE]);
        expect(actions[BLACK + PAWN + '6']).toEqual(['F6' + MOVE, 'F5' + MOVE]);
        expect(actions[BLACK + PAWN + '7']).toEqual(['G6' + MOVE, 'G5' + MOVE]);
        expect(actions[BLACK + PAWN + '8']).toEqual(['H6' + MOVE, 'H5' + MOVE]);
        expect(actions[BLACK + ROOK + '1']).toEqual([]);
        expect(actions[BLACK + ROOK + '2']).toEqual([]);
        expect(actions[BLACK + KNIGHT + '1']).toEqual(['A6' + MOVE, 'C6' + MOVE]);
        expect(actions[BLACK + KNIGHT + '2']).toEqual(['F6' + MOVE, 'H6' + MOVE]);
        expect(actions[BLACK + BISHOP + '1']).toEqual([]);
        expect(actions[BLACK + BISHOP + '2']).toEqual([]);
        expect(actions[BLACK + QUEEN]).toEqual([]);
        expect(actions[BLACK + KING]).toEqual([]);
    });

    it('Should generate moves for a knight', () => {
        const board = createStarterBoard();
        const moveBoard = movePiece(board, 'G1', 'E5')
        const positions = JSON.parse(JSON.stringify(INITIAL_BOARD_POSITIONS))
        positions[WHITE + KNIGHT + '2'] = 'E5';

        const { actions, isKingSafe } = getTurnInfo(moveBoard, PIECE_COLORS.WHITE, positions, {}, { 1: true, 2: true });
        const knightActions = actions[WHITE + KNIGHT + '2'];

        expect(isKingSafe).toBe(true);
        expect(knightActions.length).toBe(8);
        expect(knightActions).toContain('D3' + MOVE);
        expect(knightActions).toContain('F3' + MOVE);
        expect(knightActions).toContain('C4' + MOVE);
        expect(knightActions).toContain('C6' + MOVE);
        expect(knightActions).toContain('G4' + MOVE);
        expect(knightActions).toContain('G6' + MOVE);
        expect(knightActions).toContain('F7' + CAPTURE);
        expect(knightActions).toContain('D7' + CAPTURE);
    });

    it('Should allow a white pawn to commit en passant on the right', () => {
        const board = createEmptyBoard();
        const registry = {
            [PIECES.WHITE_PAWN_1]: 'C5',
            [PIECES.BLACK_PAWN_1]: 'D5',
        };
        placePiece(board, 'C5', PIECES.WHITE_PAWN_1);
        placePiece(board, 'D5', PIECES.BLACK_PAWN_1);

        const { actions } = getTurnInfo(board, PIECE_COLORS.WHITE, registry, {}, { 1: true, 2: true }, 'D5');

        expect(actions[PIECES.WHITE_PAWN_1].length).toBe(2);
        expect(actions[PIECES.WHITE_PAWN_1]).toContain('C6' + MOVE);
        expect(actions[PIECES.WHITE_PAWN_1]).toContain('D6' + EN_PASSANT);
    });

    it('Should not allow a white pawn to commit en passant due to the option expiring', () => {
        const board = createEmptyBoard();
        const registry = {
            [PIECES.WHITE_PAWN_1]: 'C5',
            [PIECES.BLACK_PAWN_1]: 'D5',
        };
        placePiece(board, 'C5', PIECES.WHITE_PAWN_1);
        placePiece(board, 'D5', PIECES.BLACK_PAWN_1);

        const { actions } = getTurnInfo(board, PIECE_COLORS.WHITE, registry, {}, { 1: true, 2: true });

        expect(actions[PIECES.WHITE_PAWN_1].length).toBe(1);
        expect(actions[PIECES.WHITE_PAWN_1]).toContain('C6' + MOVE);
    });

    it('Should allow a white pawn to commit en passant on the left', () => {
        const board = createEmptyBoard();
        const registry = {
            [PIECES.WHITE_PAWN_1]: 'G5',
            [PIECES.BLACK_PAWN_1]: 'F5',
        };
        placePiece(board, 'G5', PIECES.WHITE_PAWN_1);
        placePiece(board, 'F5', PIECES.BLACK_PAWN_1);

        const { actions } = getTurnInfo(board, PIECE_COLORS.WHITE, registry, {}, { 1: true, 2: true }, 'F5');

        expect(actions[PIECES.WHITE_PAWN_1].length).toBe(2);
        expect(actions[PIECES.WHITE_PAWN_1]).toContain('G6' + MOVE);
        expect(actions[PIECES.WHITE_PAWN_1]).toContain('F6' + EN_PASSANT);
    });

    it('Should allow a black pawn to commit en passant on the left', () => {
        const board = createEmptyBoard();
        const registry = {
            [PIECES.WHITE_PAWN_1]: 'C4',
            [PIECES.BLACK_PAWN_1]: 'D4',
        };
        placePiece(board, 'C4', PIECES.WHITE_PAWN_1);
        placePiece(board, 'D4', PIECES.BLACK_PAWN_1);

        const { actions } = getTurnInfo(board, PIECE_COLORS.BLACK, registry, {}, { 1: true, 2: true }, 'C4');

        expect(actions[PIECES.BLACK_PAWN_1].length).toBe(2);
        expect(actions[PIECES.BLACK_PAWN_1]).toContain('D3' + MOVE);
        expect(actions[PIECES.BLACK_PAWN_1]).toContain('C3' + EN_PASSANT);
    });

    it('Should allow a black pawn to commit en passant on the right', () => {
        const board = createEmptyBoard();
        const registry = {
            [PIECES.WHITE_PAWN_1]: 'B4',
            [PIECES.BLACK_PAWN_1]: 'A4',
        };
        placePiece(board, 'B4', PIECES.WHITE_PAWN_1);
        placePiece(board, 'A4', PIECES.BLACK_PAWN_1);

        const { actions } = getTurnInfo(board, PIECE_COLORS.BLACK, registry, {}, { 1: true, 2: true }, 'B4');

        expect(actions[PIECES.BLACK_PAWN_1].length).toBe(2);
        expect(actions[PIECES.BLACK_PAWN_1]).toContain('A3' + MOVE);
        expect(actions[PIECES.BLACK_PAWN_1]).toContain('B3' + EN_PASSANT);
    });

    it('Should not allow a black pawn to commit en passant due to not being on the right rank', () => {
        const board = createEmptyBoard();
        const registry = {
            [PIECES.WHITE_PAWN_1]: 'B4',
            [PIECES.BLACK_PAWN_1]: 'A5',
        };
        placePiece(board, 'B4', PIECES.WHITE_PAWN_1);
        placePiece(board, 'A5', PIECES.BLACK_PAWN_1);

        const { actions } = getTurnInfo(board, PIECE_COLORS.BLACK, registry, {}, { 1: true, 2: true }, 'B4');

        expect(actions[PIECES.BLACK_PAWN_1].length).toBe(2);
        expect(actions[PIECES.BLACK_PAWN_1]).toContain('A4' + MOVE);
        expect(actions[PIECES.BLACK_PAWN_1]).toContain('B4' + CAPTURE);
    });

    it('Should generate only moves that pull the king out of check', () => {
        const board = createEmptyBoard();
        placePiece(board, 'A1', WHITE + KING);
        placePiece(board, 'B8', BLACK + ROOK + '1');
        placePiece(board, 'H2', BLACK + ROOK + '2');
        placePiece(board, 'C3', BLACK + BISHOP + '1');
        placePiece(board, 'G7', WHITE + QUEEN);
        const positions = createDeadPositions();
        positions[WHITE + KING] = 'A1';
        positions[BLACK + ROOK + '1'] = 'B8';
        positions[BLACK + ROOK + '2'] = 'H2';
        positions[BLACK + BISHOP + '1'] = 'C3';
        positions[WHITE + QUEEN] = 'G7';

        const { actions, isKingSafe } = getTurnInfo(board, PIECE_COLORS.WHITE, positions, {}, { 1: false, 2: false });

        expect(isKingSafe).toBe(false);
        expect(actions[WHITE + KING].length).toBe(0)
        expect(actions[WHITE + QUEEN].length).toBe(1)
        expect(actions[WHITE + QUEEN]).toContain('C3' + CAPTURE)
        expect(actions[WHITE + ROOK + '1'].length).toBe(0)
    })

    it('Should generate rook moves for a rook pawn', () => {
        const board = createEmptyBoard();
        placePiece(board, 'A1', WHITE + PAWN + '1');
        placePiece(board, 'A8', BLACK + PAWN + '1');
        placePiece(board, 'B2', BLACK + PAWN + '2');
        const positions = createDeadPositions();
        positions[WHITE + PAWN + '1'] = 'A1';
        positions[BLACK + PAWN + '1'] = 'A8';
        positions[BLACK + PAWN + '2'] = 'B2';
        const registry = { [WHITE + PAWN + '1']: ROOK }

        const { actions, isKingSafe } = getTurnInfo(board, PIECE_COLORS.WHITE, positions, registry, { 1: true, 2: true });

        expect(isKingSafe).toBe(true);
        expect(actions[WHITE + PAWN + '1'].length).toBe(14);
        expect(actions[WHITE + PAWN + '1']).toContain('A2' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('A3' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('A4' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('A5' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('A6' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('A7' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('A8' + CAPTURE);
        expect(actions[WHITE + PAWN + '1']).toContain('B1' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('C1' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('D1' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('E1' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('F1' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('G1' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('H1' + MOVE);
    })

    it('Should generate knight moves for a knight pawn', () => {
        const board = createEmptyBoard();
        placePiece(board, 'E5', WHITE + PAWN + '1');
        placePiece(board, 'F7', BLACK + PAWN + '1');
        placePiece(board, 'D7', BLACK + PAWN + '2');
        const positions = createDeadPositions();
        positions[WHITE + PAWN + '1'] = 'E5';
        positions[BLACK + PAWN + '1'] = 'F7';
        positions[BLACK + PAWN + '2'] = 'D7';
        const registry = { [WHITE + PAWN + '1']: KNIGHT }

        const { actions, isKingSafe } = getTurnInfo(board, PIECE_COLORS.WHITE, positions, registry, { 1: true, 2: true });

        expect(isKingSafe).toBe(true);
        expect(actions[WHITE + PAWN + '1'].length).toBe(8);
        expect(actions[WHITE + PAWN + '1']).toContain('D3' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('F3' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('C4' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('C6' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('G4' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('G6' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('F7' + CAPTURE);
        expect(actions[WHITE + PAWN + '1']).toContain('D7' + CAPTURE);
    });

    it('Should generate bishop moves for a bishop pawn', () => {
        const board = createEmptyBoard();
        placePiece(board, 'A1', WHITE + PAWN + '1');
        placePiece(board, 'G7', BLACK + PAWN + '1');
        placePiece(board, 'H8', BLACK + PAWN + '2');
        const positions = createDeadPositions();
        positions[WHITE + PAWN + '1'] = 'A1';
        positions[BLACK + PAWN + '1'] = 'G7';
        positions[BLACK + PAWN + '2'] = 'H8';
        const registry = { [WHITE + PAWN + '1']: BISHOP }

        const { actions, isKingSafe } = getTurnInfo(board, PIECE_COLORS.WHITE, positions, registry, { 1: true, 2: true });

        expect(isKingSafe).toBe(true);
        expect(actions[WHITE + PAWN + '1'].length).toBe(6);
        expect(actions[WHITE + PAWN + '1']).toContain('B2' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('C3' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('D4' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('E5' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('F6' + MOVE);
        expect(actions[WHITE + PAWN + '1']).toContain('G7' + CAPTURE);
    });

    it('Should generate castle moves for a king if the flag is enabled', () => {
        const board = createEmptyBoard();
        placePiece(board, 'E1', WHITE + KING);
        placePiece(board, 'A1', WHITE + ROOK + '1');
        placePiece(board, 'H1', WHITE + ROOK + '2');
        const positions = createDeadPositions();
        positions[WHITE + KING] = 'E1';
        positions[WHITE + ROOK + '1'] = 'A1';
        positions[WHITE + ROOK + '2'] = 'H1';

        const { actions, isKingSafe } = getTurnInfo(board, PIECE_COLORS.WHITE, positions, {}, { 1: true, 2: false });

        expect(isKingSafe).toBe(true);
        expect(actions[WHITE + KING].length).toBe(6);
        expect(actions[WHITE + KING]).toContain('D1' + MOVE);
        expect(actions[WHITE + KING]).toContain('D2' + MOVE);
        expect(actions[WHITE + KING]).toContain('E2' + MOVE);
        expect(actions[WHITE + KING]).toContain('F2' + MOVE);
        expect(actions[WHITE + KING]).toContain('F1' + MOVE);
        expect(actions[WHITE + KING]).toContain('C1' + CASTLE);
    });

    it('Should generate castle moves for a king if the path is safe', () => {
        const board = createEmptyBoard();
        placePiece(board, 'E1', WHITE + KING);
        placePiece(board, 'A1', WHITE + ROOK + '1');
        placePiece(board, 'H1', WHITE + ROOK + '2');
        placePiece(board, 'C7', BLACK + ROOK + '1');
        const positions = createDeadPositions();
        positions[WHITE + KING] = 'E1';
        positions[WHITE + ROOK + '1'] = 'A1';
        positions[WHITE + ROOK + '2'] = 'H1';

        const { actions, isKingSafe } = getTurnInfo(board, PIECE_COLORS.WHITE, positions, {}, { 1: true, 2: true });

        expect(isKingSafe).toBe(true);
        expect(actions[WHITE + KING].length).toBe(6);
        expect(actions[WHITE + KING]).toContain('D1' + MOVE);
        expect(actions[WHITE + KING]).toContain('D2' + MOVE);
        expect(actions[WHITE + KING]).toContain('E2' + MOVE);
        expect(actions[WHITE + KING]).toContain('F2' + MOVE);
        expect(actions[WHITE + KING]).toContain('F1' + MOVE);
        expect(actions[WHITE + KING]).toContain('G1' + CASTLE);
    });
})
