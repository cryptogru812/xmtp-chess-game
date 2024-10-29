import { jest } from '@jest/globals';
import { createActions, createBoard, createDeadPositions, createMessage, createPositions, createStarterMessage, createTestBoard } from '../../tools';

import { GAME_STATUS, GAME_VALIDATION_MESSAGES, INDEX_TO_COL, INDEX_TO_ROW, PIECE_COLORS, PIECE_VALUES, PIECES, ACTION_TYPES } from "../../../src/utils/enum";
import BoardManager from "../../../src/utils/managers/BoardManager";
import { getPieceAt, movePiece, placePiece, removePiece } from '../../../src/utils/game/board';
import { generateInitalMoves } from '../../../src/utils/game/message';

describe('Tests the getStatus method', () => {
    const setStatusFunc = jest.fn();
    const setMessageFunc = jest.fn();
    const endGameFunc = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('Should set the status as CHEAT if both moves are made by the same player', () => {
        const lastMove = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,B,TTTT';
        const currMove = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,B,TTTT';
        const manager = new BoardManager(lastMove, currMove, undefined, undefined, PIECE_COLORS.WHITE);

        manager.getStatus(setStatusFunc, setMessageFunc, endGameFunc);

        expect(setStatusFunc).toHaveBeenCalledTimes(1);
        expect(setStatusFunc).toHaveBeenCalledWith(GAME_STATUS.CHEAT);
        expect(setMessageFunc).toHaveBeenCalledTimes(1);
        expect(setMessageFunc).toHaveBeenCalledWith(GAME_VALIDATION_MESSAGES.SAME_MESSAGE_COLOR);
        expect(endGameFunc).toHaveBeenCalledTimes(1);
        expect(endGameFunc).toHaveBeenCalledWith(GAME_STATUS.CHEAT);
    });

    it('Should set the status as CHEAT if castling is re-enabled', () => {
        const lastMove = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,W,FFFF';
        const currMove = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,B,TTTT';
        const manager = new BoardManager(lastMove, currMove, undefined, undefined, PIECE_COLORS.WHITE);

        manager.getStatus(setStatusFunc, setMessageFunc, endGameFunc);

        expect(setStatusFunc).toHaveBeenCalledTimes(1);
        expect(setStatusFunc).toHaveBeenCalledWith(GAME_STATUS.CHEAT);
        expect(setMessageFunc).toHaveBeenCalledTimes(1);
        expect(setMessageFunc).toHaveBeenCalledWith(GAME_VALIDATION_MESSAGES.REENABLE_CASTLING);
        expect(endGameFunc).toHaveBeenCalledTimes(1);
        expect(endGameFunc).toHaveBeenCalledWith(GAME_STATUS.CHEAT);
    });
});

describe('Tests the getTileDetails method', () => {
    it('Should note all tiles that are interactable', () => {
        const turn2 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
        }, 'W');
        const turn3 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
            [PIECES.BLACK_PAWN_4]: 'D5',
        }, 'B')

        const manager = new BoardManager(turn2, turn3, 'C3', GAME_STATUS.WHITE_TURN, PIECE_COLORS.WHITE);
        manager.getStatus(jest.fn(), jest.fn(), jest.fn(), jest.fn());

        for (let i = 0; i < 8; i += 1) {
            for (let j = 0; j < 8; j += 1) {
                const chessCol = INDEX_TO_COL[j];
                const chessRow = INDEX_TO_ROW[i];
                const chessPos = chessCol + chessRow;

                const details = manager.getTileDetails(chessPos);
                const horseMovements = ['B1', 'A4', 'B5', 'E4'];
                const horseAttack = ['D5'];
                const piece = getPieceAt(manager.board, chessPos)

                if (horseMovements.includes(chessPos)) {
                    expect(details.action).toBe(chessPos + ACTION_TYPES.MOVE);
                    expect(details.piece).toBe(undefined);
                    expect(details.selectable).toBe(true);
                } else if (horseAttack.includes(chessPos)) {
                    expect(details.action).toBe(chessPos + ACTION_TYPES.CAPTURE);
                    expect(details.piece).toBe(PIECE_COLORS.BLACK + PIECE_VALUES.PAWN + '4');
                    expect(details.selectable).toBe(true);
                } else if (piece && piece[0] === PIECE_COLORS.WHITE) {
                    expect(details.action).toBe(undefined);
                    expect(details.piece).toBe(piece);
                    expect(details.selectable).toBe(true);
                } else if (piece && piece[0] === PIECE_COLORS.BLACK) {
                    expect(details.action).toBe(undefined);
                    expect(details.piece).toBe(piece);
                    expect(details.selectable).toBe(false);
                } else {
                    expect(details.action).toBe(undefined);
                    expect(details.piece).toBe(undefined);
                    expect(details.selectable).toBe(false);
                }
            }
        }
    });

    it('Should note no tiles are interactable due to not being the players turn', () => {
        const turn3 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
            [PIECES.BLACK_PAWN_4]: 'D5',
        }, 'B');
        const turn4 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
            [PIECES.BLACK_PAWN_4]: 'D5',
            [PIECES.WHITE_PAWN_8]: 'H3',
        }, 'W');

        const manager = new BoardManager(turn3, turn4, 'C3', GAME_STATUS.BLACK_TURN, PIECE_COLORS.WHITE);
        manager.getStatus(jest.fn(), jest.fn(), jest.fn(), jest.fn());

        for (let i = 0; i < 8; i += 1) {
            for (let j = 0; j < 8; j += 1) {
                const chessCol = INDEX_TO_COL[j];
                const chessRow = INDEX_TO_ROW[i];
                const chessPos = chessCol + chessRow;

                const details = manager.getTileDetails(chessPos);
                const piece = getPieceAt(manager.board, chessPos)

                expect(details.action).toBe(undefined);
                expect(details.piece).toBe(piece);
                expect(details.selectable).toBe(false);
            }
        }
    });
});

describe('Tests the translateTurn method', () => {
    it('Should successfully translate no move as the current turn message', () => {
        const turn2 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
        }, 'W');
        const turn3 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
            [PIECES.BLACK_PAWN_4]: 'D5',
        }, 'B')

        const expectedMessage = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
            [PIECES.BLACK_PAWN_4]: 'D5',
        }, 'W')

        const manager = new BoardManager(turn2, turn3, 'C3', undefined, PIECE_COLORS.WHITE);
        manager.getStatus(jest.fn(), jest.fn(), jest.fn(), jest.fn());

        expect(manager.translateTurn()).toBe(expectedMessage);
    })
})

describe('Tests the toggleTile method', () => {
    const setSelectedFn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('Should select a tile when no tile has been selected', () => {
        const manager = new BoardManager(undefined, undefined, undefined, undefined, PIECE_COLORS.WHITE);

        manager.toggleTile('A1', setSelectedFn);

        expect(setSelectedFn).toHaveBeenCalledTimes(1);
        expect(setSelectedFn).toHaveBeenCalledWith('A1');
        expect(manager.selectedTile).toBe('A1');
    });

    it('Should select a tile even when a different tile has been selected', () => {
        const manager = new BoardManager(undefined, undefined, undefined, undefined, PIECE_COLORS.WHITE);

        manager.toggleTile('A1', setSelectedFn);
        manager.toggleTile('B1', setSelectedFn);

        expect(setSelectedFn).toHaveBeenCalledTimes(2);
        expect(setSelectedFn).toHaveBeenCalledWith('A1');
        expect(setSelectedFn).toHaveBeenCalledWith('B1');
        expect(manager.selectedTile).toBe('B1');
    });

    it('Should deselect a tile when the same tile has been selected', () => {
        const manager = new BoardManager(undefined, undefined, undefined, undefined, PIECE_COLORS.WHITE);

        manager.toggleTile('A1', setSelectedFn);
        manager.toggleTile('A1', setSelectedFn);

        expect(setSelectedFn).toHaveBeenCalledTimes(2);
        expect(setSelectedFn).toHaveBeenCalledWith('A1');
        expect(setSelectedFn).toHaveBeenCalledWith(undefined);
        expect(manager.selectedTile).toBe(undefined);
    });
});

describe('Tests the updateRegistry method', () => {
    it('Should not update the registry if the piece is not a pawn', () => {
        const manager = new BoardManager(undefined, undefined, undefined, undefined, PIECE_COLORS.WHITE);
        manager.pawnRegistry = {};
        manager.updateRegistry(PIECES.WHITE_KNIGHT_1, 'C3', 'C4');

        expect(manager.pawnRegistry).toEqual({});
    });

    it('Should not update the registry if the player does not own the pawn', () => {
        const manager = new BoardManager(undefined, undefined, undefined, undefined, PIECE_COLORS.WHITE);
        manager.pawnRegistry = {};
        manager.updateRegistry(PIECES.BLACK_PAWN_1, 'C3', 'C4');

        expect(manager.pawnRegistry).toEqual({});
    });

    it('Should not update the registry if the pawn is already in the registry', () => {
        const manager = new BoardManager(undefined, undefined, undefined, undefined, PIECE_COLORS.WHITE);
        manager.pawnRegistry = {};
        manager.pawnRegistry[PIECES.WHITE_PAWN_1] = 'N';
        manager.updateRegistry(PIECES.WHITE_PAWN_1, 'Q');

        expect(manager.pawnRegistry).toEqual({
            [PIECES.WHITE_PAWN_1]: 'N',
        });
    });

    it('Should update the registry if the pawn is not already in the registry', () => {
        const manager = new BoardManager(undefined, undefined, undefined, undefined, PIECE_COLORS.WHITE);
        manager.pawnRegistry = {};
        manager.updateRegistry(PIECES.WHITE_PAWN_1, 'Q');

        expect(manager.pawnRegistry).toEqual({
            [PIECES.WHITE_PAWN_1]: 'Q',
        });
    });
});

describe('Tests the executeAction method', () => {
    const toggleTransformFn = jest.fn();
    const makeMoveFn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('Should execute a move action', () => {
        const board = createBoard();
        const nextBoard = createBoard();
        placePiece(nextBoard, 'A3', PIECES.WHITE_PAWN_1);
        removePiece(nextBoard, 'A2');
        const manager = new BoardManager(undefined, undefined, 'A2', undefined, PIECE_COLORS.WHITE);
        manager.board = board;
        manager.canCastle = {
            [PIECE_COLORS.WHITE]: { 1: true, 2: true },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        }
        manager.positions = createPositions();
        manager.pawnRegistry = {};

        manager.executeAction('A3M', makeMoveFn);

        expect(manager.board).toEqual(nextBoard);
        expect(manager.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: { 1: true, 2: true },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        });
        expect(manager.positions[PIECES.WHITE_PAWN_1]).toBe('A3');
        expect(makeMoveFn).toHaveBeenCalledTimes(1);
        expect(makeMoveFn).toHaveBeenCalledWith('A1B1C1D1E1F1G1H1A3B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,W,TTTT');
    });

    it('Should execute a capture action', () => {
        const board = createBoard();
        const nextBoard = createBoard();
        removePiece(board, 'D2');
        removePiece(nextBoard, 'D2');
        removePiece(nextBoard, 'D1')
        placePiece(nextBoard, 'D7', PIECES.WHITE_QUEEN);
        const manager = new BoardManager(undefined, undefined, 'D1', undefined, PIECE_COLORS.WHITE);
        manager.board = board;
        manager.canCastle = {
            [PIECE_COLORS.WHITE]: { 1: true, 2: true },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        }
        manager.positions = createPositions({ [PIECES.WHITE_PAWN_4]: 'XX' });
        manager.pawnRegistry = {};

        manager.executeAction('D7C', makeMoveFn);

        expect(manager.board).toEqual(nextBoard);
        expect(manager.canCastle).toEqual(manager.canCastle = {
            [PIECE_COLORS.WHITE]: { 1: true, 2: true },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        });
        expect(manager.positions[PIECES.WHITE_QUEEN]).toBe('D7');
        expect(manager.positions[PIECES.BLACK_PAWN_4]).toBe('XX');
        expect(makeMoveFn).toHaveBeenCalledTimes(1);
        expect(makeMoveFn).toHaveBeenCalledWith('A1B1C1D7E1F1G1H1A2B2C2XXE2F2G2H2A8B8C8D8E8F8G8H8A7B7C7XXE7F7G7H7,W,TTTT');
    });

    it('Should execute a castle action', () => {
        const board = createTestBoard();
        const nextBoard = createTestBoard();

        placePiece(board, 'E1', PIECES.WHITE_KING);
        placePiece(board, 'H1', PIECES.WHITE_ROOK_2);
        placePiece(nextBoard, 'G1', PIECES.WHITE_KING);
        placePiece(nextBoard, 'F1', PIECES.WHITE_ROOK_2);

        const manager = new BoardManager(undefined, undefined, 'E1', undefined, PIECE_COLORS.WHITE);
        manager.board = board;
        manager.canCastle = {
            [PIECE_COLORS.WHITE]: { 1: true, 2: true },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        }
        manager.positions = createDeadPositions({ [PIECES.WHITE_KING]: 'E1', [PIECES.WHITE_ROOK_2]: 'H1' });
        manager.pawnRegistry = {};

        manager.executeAction('G1' + ACTION_TYPES.CASTLE, makeMoveFn);

        expect(manager.board).toEqual(nextBoard);
        expect(manager.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: { 1: false, 2: false },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        });
        expect(manager.positions[PIECES.WHITE_KING]).toBe('G1');
        expect(manager.positions[PIECES.WHITE_ROOK_2]).toBe('F1');
        expect(makeMoveFn).toHaveBeenCalledTimes(1);
        expect(makeMoveFn).toHaveBeenCalledWith('XXXXXXXXG1XXXXF1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,W,FFTT');
    });

    it('Should execute a transform action', () => {
        const board = createTestBoard();
        const nextBoard = createTestBoard();

        placePiece(board, 'A7', PIECES.WHITE_PAWN_1);
        removePiece(board, 'A8');
        placePiece(nextBoard, 'A8', PIECES.WHITE_PAWN_1);

        const manager = new BoardManager(undefined, undefined, 'A7', undefined, PIECE_COLORS.WHITE);
        manager.board = board;
        manager.canCastle = {
            [PIECE_COLORS.WHITE]: { 1: true, 2: true },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        }
        manager.positions = createDeadPositions({ [PIECES.WHITE_PAWN_1]: 'A7', [PIECES.BLACK_PAWN_1]: 'XX', [PIECES.BLACK_ROOK_1]: 'XX' });
        manager.pawnRegistry = {};

        manager.executeAction('A8' + ACTION_TYPES.TRANSFORM, makeMoveFn);

        expect(manager.board).toEqual(nextBoard);
        expect(manager.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: { 1: true, 2: true },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        });
        expect(manager.positions[PIECES.WHITE_PAWN_1]).toBe('A8');
        expect(manager.positions[PIECES.BLACK_PAWN_1]).toBe('XX');
        expect(makeMoveFn).toHaveBeenCalledTimes(1);
        expect(makeMoveFn).toHaveBeenCalledWith('XXXXXXXXXXXXXXXXA8XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,W,TTTT', 'A8');
    });

    it('Should execute a transform & capture action', () => {
        const board = createBoard();
        const nextBoard = createBoard();

        placePiece(board, 'A7', PIECES.WHITE_PAWN_1);
        removePiece(board, 'A2')
        placePiece(nextBoard, 'B8', PIECES.WHITE_PAWN_1);
        removePiece(nextBoard, 'A7');
        removePiece(nextBoard, 'A2');

        const manager = new BoardManager(undefined, undefined, 'A7', undefined, PIECE_COLORS.WHITE);
        manager.board = board;
        manager.canCastle = {
            [PIECE_COLORS.WHITE]: { 1: true, 2: true },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        }
        manager.positions = createPositions({ [PIECES.WHITE_PAWN_1]: 'A7', [PIECES.BLACK_PAWN_1]: 'XX' });
        manager.pawnRegistry = {};

        manager.executeAction('B8' + ACTION_TYPES.TRANSFORM, makeMoveFn);

        expect(manager.board).toEqual(nextBoard);
        expect(manager.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: { 1: true, 2: true },
            [PIECE_COLORS.BLACK]: { 1: true, 2: true },
        });
        expect(manager.positions[PIECES.WHITE_PAWN_1]).toBe('B8');
        expect(manager.positions[PIECES.BLACK_PAWN_1]).toBe('XX');
        expect(manager.positions[PIECES.BLACK_KNIGHT_1]).toBe('XX');
        expect(makeMoveFn).toHaveBeenCalledTimes(1);
        expect(makeMoveFn).toHaveBeenCalledWith('A1B1C1D1E1F1G1H1B8B2C2D2E2F2G2H2A8XXC8D8E8F8G8H8XXB7C7D7E7F7G7H7,W,TTTT', 'B8');
    });
});

describe('Tests chess games', () => {
    const setMessageFunc = jest.fn();
    const setStatusFunc = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('Scenario 1', () => {
        let board = createBoard();
        const turn1 = createStarterMessage();

        const turn2 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
        }, 'W');
        const turn2Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
        });

        const turn3 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
            [PIECES.BLACK_PAWN_4]: 'D5',
        }, 'B')
        const turn3Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'C3',
            [PIECES.BLACK_PAWN_4]: 'D5',
        });
        const turn3Actions = createActions(PIECE_COLORS.WHITE, {
            [PIECES.WHITE_KNIGHT_1]: ['B1M', 'A4M', 'E4M', 'B5M', 'D5C'],
            [PIECES.WHITE_KNIGHT_2]: ['F3M', 'H3M'],
            [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
            [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
            [PIECES.WHITE_PAWN_4]: ['D3M', 'D4M'],
            [PIECES.WHITE_PAWN_5]: ['E3M', 'E4M'],
            [PIECES.WHITE_PAWN_6]: ['F3M', 'F4M'],
            [PIECES.WHITE_PAWN_7]: ['G3M', 'G4M'],
            [PIECES.WHITE_PAWN_8]: ['H3M', 'H4M'],
            [PIECES.WHITE_ROOK_1]: ['B1M'],
        });

        const turn4 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'D5',
            [PIECES.BLACK_PAWN_4]: 'XX',
        }, PIECE_COLORS.WHITE);
        const turn4Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'D5',
            [PIECES.BLACK_PAWN_4]: 'XX',
        });

        const turn5 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'D5',
        }, PIECE_COLORS.BLACK);
        const turn5Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'D5',
        });
        const turn5Actions = createActions(PIECE_COLORS.WHITE, {
            [PIECES.WHITE_KNIGHT_2]: ['F3M', 'H3M'],
            [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
            [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
            [PIECES.WHITE_PAWN_3]: ['C3M', 'C4M'],
            [PIECES.WHITE_PAWN_4]: ['D3M', 'D4M'],
            [PIECES.WHITE_PAWN_5]: ['E3M', 'E4M'],
            [PIECES.WHITE_PAWN_6]: ['F3M', 'F4M'],
            [PIECES.WHITE_PAWN_7]: ['G3M', 'G4M'],
            [PIECES.WHITE_PAWN_8]: ['H3M', 'H4M'],
            [PIECES.WHITE_ROOK_1]: ['B1M'],
        });

        const turn6 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'D5',
            [PIECES.WHITE_KNIGHT_2]: 'F3',
        }, PIECE_COLORS.WHITE);
        const turn6Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'D5',
            [PIECES.WHITE_KNIGHT_2]: 'F3',
        });

        const turn7 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'F3',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
        }, PIECE_COLORS.BLACK);
        const turn7Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'F3',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
        });
        const turn7Actions = createActions(PIECE_COLORS.WHITE, {
            [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
            [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
            [PIECES.WHITE_PAWN_3]: ['C3M', 'C4M'],
            [PIECES.WHITE_PAWN_4]: ['D3M', 'D4M'],
            [PIECES.WHITE_PAWN_5]: ['E3M', 'E4M', 'F3C'],
            [PIECES.WHITE_PAWN_7]: ['G3M', 'G4M', 'F3C'],
            [PIECES.WHITE_PAWN_8]: ['H3M', 'H4M'],
            [PIECES.WHITE_ROOK_1]: ['B1M'],
            [PIECES.WHITE_ROOK_2]: ['G1M'],
        });

        const turn8 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'F3',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
            [PIECES.WHITE_PAWN_5]: 'E4',
        }, PIECE_COLORS.WHITE);
        const turn8Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'F3',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
            [PIECES.WHITE_PAWN_5]: 'E4',
        });

        const turn9 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'F2',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
            [PIECES.WHITE_PAWN_5]: 'E4',
            [PIECES.WHITE_PAWN_6]: 'XX',
        }, PIECE_COLORS.BLACK);
        const turn9Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'F2',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
            [PIECES.WHITE_PAWN_5]: 'E4',
            [PIECES.WHITE_PAWN_6]: 'XX',
        });
        const turn9Actions = createActions(PIECE_COLORS.WHITE, {
            [PIECES.WHITE_KING]: ['F2C'],
        });

        const turn10 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'XX',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
            [PIECES.WHITE_PAWN_5]: 'E4',
            [PIECES.WHITE_PAWN_6]: 'XX',
            [PIECES.WHITE_KING]: 'F2',
        }, PIECE_COLORS.WHITE);
        const turn10Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'XX',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
            [PIECES.WHITE_PAWN_5]: 'E4',
            [PIECES.WHITE_PAWN_6]: 'XX',
            [PIECES.WHITE_KING]: 'F2',
        });

        const turn11 = createMessage({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'XX',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
            [PIECES.WHITE_PAWN_5]: 'E4',
            [PIECES.WHITE_PAWN_6]: 'XX',
            [PIECES.WHITE_KING]: 'F2',
            [PIECES.BLACK_PAWN_5]: 'E5'
        }, PIECE_COLORS.BLACK);
        const turn11Positions = createPositions({
            [PIECES.WHITE_KNIGHT_1]: 'XX',
            [PIECES.BLACK_PAWN_4]: 'XX',
            [PIECES.BLACK_QUEEN]: 'XX',
            [PIECES.WHITE_KNIGHT_2]: 'XX',
            [PIECES.WHITE_PAWN_5]: 'E4',
            [PIECES.WHITE_PAWN_6]: 'XX',
            [PIECES.WHITE_KING]: 'F2',
            [PIECES.BLACK_PAWN_5]: 'E5'
        });
        const turn11Actions = createActions(PIECE_COLORS.WHITE, {
            [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
            [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
            [PIECES.WHITE_PAWN_3]: ['C3M', 'C4M'],
            [PIECES.WHITE_PAWN_4]: ['D3M', 'D4M'],
            [PIECES.WHITE_PAWN_7]: ['G3M', 'G4M'],
            [PIECES.WHITE_PAWN_8]: ['H3M', 'H4M'],
            [PIECES.WHITE_ROOK_1]: ['B1M'],
            [PIECES.WHITE_ROOK_2]: ['G1M'],
            [PIECES.WHITE_KING]: ['E1M', 'G1M', 'E2M', 'E3M', 'F3M', 'G3M'],
            [PIECES.WHITE_QUEEN]: ['E1M', 'E2M', 'F3M', 'G4M', 'H5M'],
            [PIECES.WHITE_BISHOP_2]: ['E2M', 'D3M', 'C4M', 'B5M', 'A6M'],
        });

        const turnList = [
            turn1, turn2, turn3, turn4, turn5, turn6, turn7, turn8, turn9, turn10, turn11,
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
            }, PIECE_COLORS.WHITE),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'E7'
            }, PIECE_COLORS.BLACK),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'E7',
                [PIECES.WHITE_PAWN_4]: 'D4',
            }, PIECE_COLORS.WHITE),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D4',
            }, PIECE_COLORS.BLACK),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D4',
                [PIECES.WHITE_PAWN_7]: 'G3',
            }, PIECE_COLORS.WHITE, 'FFTT'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D4',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
            }, PIECE_COLORS.BLACK, 'FFTT'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D5',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
            }, PIECE_COLORS.WHITE, 'FFTT'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D5',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'G8',
                [PIECES.BLACK_ROOK_2]: 'F8',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D6',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'G8',
                [PIECES.BLACK_ROOK_2]: 'F8',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D6',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'G8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A5',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D7',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'G8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A5',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D7',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A5',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'QC8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A5',
                [PIECES.BLACK_BISHOP_1]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'QC8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A4',
                [PIECES.BLACK_BISHOP_1]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'QB8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A4',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'QB8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A3',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'QA8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A3',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'QA8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'QF8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'QF8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'G8',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'QE7',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'G8',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A4',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QB1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A4',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QB1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A5',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QA1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A5',
                [PIECES.WHITE_ROOK_1]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QA1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A6',
                [PIECES.WHITE_ROOK_1]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QC1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A6',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QC1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'B7',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QD1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'B7',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QD1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'QB8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'C8',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QD1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'QB8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QD1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'QC8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QD8',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'QC8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'XX',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'H4',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QD8',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'QC8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
            }, PIECE_COLORS.WHITE, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'XX',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'H4',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'QD8',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'QC8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_3]: 'C5'
            }, PIECE_COLORS.BLACK, 'FFFF'),
            createMessage({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'XX',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'H4',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'XX',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'QD8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_3]: 'C5'
            }, PIECE_COLORS.WHITE, 'FFFF'),
        ]
        const pawnRegistryList = [
            {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                [PIECES.WHITE_PAWN_4]: 'Q',
            },
            {
                [PIECES.WHITE_PAWN_4]: 'Q',
            },
            {
                [PIECES.WHITE_PAWN_4]: 'Q',
            },
            {
                [PIECES.WHITE_PAWN_4]: 'Q',
            },
            {
                [PIECES.WHITE_PAWN_4]: 'Q',
            },
            {
                [PIECES.WHITE_PAWN_4]: 'Q',
            },
            {
                [PIECES.WHITE_PAWN_4]: 'Q',
            },
            {
                [PIECES.WHITE_PAWN_4]: 'Q',
            },
            {
                [PIECES.WHITE_PAWN_4]: 'Q',
            },
            {},
            {},
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
                [PIECES.WHITE_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
                [PIECES.WHITE_PAWN_1]: 'Q',
            }
            ,
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
                [PIECES.WHITE_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
                [PIECES.WHITE_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
                [PIECES.WHITE_PAWN_1]: 'Q',
            },
            {
                [PIECES.BLACK_PAWN_1]: 'Q',
                [PIECES.WHITE_PAWN_1]: 'Q',
            },
            {
                [PIECES.WHITE_PAWN_1]: 'Q',
            }
        ]
        const positionsList = [
            createPositions(), turn2Positions, turn3Positions, turn4Positions, turn5Positions,
            turn6Positions, turn7Positions, turn8Positions, turn9Positions, turn10Positions,
            turn11Positions,
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'E7'
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'E7',
                [PIECES.WHITE_PAWN_4]: 'D4',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D4',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D4',
                [PIECES.WHITE_PAWN_7]: 'G3',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D4',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D5',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D5',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'G8',
                [PIECES.BLACK_ROOK_2]: 'F8',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D6',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'G8',
                [PIECES.BLACK_ROOK_2]: 'F8',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D6',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'G8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A5',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D7',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'G8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A5',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'D7',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A5',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'C8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A5',
                [PIECES.BLACK_BISHOP_1]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'C8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A4',
                [PIECES.BLACK_BISHOP_1]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'B8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A4',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'B8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A3',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'A8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'A3',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'A8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'F8',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'F8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'H6',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'F8',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'G8',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'E7',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'G8',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B2',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A4',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A4',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'B1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A5',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'A1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A5',
                [PIECES.WHITE_ROOK_1]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'A1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A6',
                [PIECES.WHITE_ROOK_1]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'C1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'A6',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'C1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'B7',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'D1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'B7',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'E7',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'D1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'B8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'C8',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'D1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'B8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'D1',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'C8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'H4',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'G3',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'D8',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'C8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'XX',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'H4',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'D8',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'C8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'XX',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'H4',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'D8',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'C8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.BLACK_PAWN_3]: 'C5',
            }),
            createPositions({
                [PIECES.WHITE_KNIGHT_1]: 'XX',
                [PIECES.BLACK_PAWN_4]: 'XX',
                [PIECES.BLACK_QUEEN]: 'XX',
                [PIECES.WHITE_KNIGHT_2]: 'XX',
                [PIECES.WHITE_PAWN_5]: 'E4',
                [PIECES.WHITE_PAWN_6]: 'XX',
                [PIECES.WHITE_KING]: 'F2',
                [PIECES.BLACK_PAWN_5]: 'E5',
                [PIECES.WHITE_BISHOP_2]: 'C4',
                [PIECES.BLACK_BISHOP_2]: 'XX',
                [PIECES.WHITE_PAWN_4]: 'XX',
                [PIECES.WHITE_PAWN_7]: 'H4',
                [PIECES.BLACK_KNIGHT_2]: 'XX',
                [PIECES.BLACK_KING]: 'H8',
                [PIECES.BLACK_ROOK_2]: 'XX',
                [PIECES.BLACK_PAWN_1]: 'XX',
                [PIECES.BLACK_BISHOP_1]: 'XX',
                [PIECES.BLACK_KNIGHT_1]: 'XX',
                [PIECES.BLACK_ROOK_1]: 'XX',
                [PIECES.WHITE_PAWN_2]: 'XX',
                [PIECES.WHITE_PAWN_1]: 'D8',
                [PIECES.WHITE_ROOK_1]: 'XX',
                [PIECES.WHITE_BISHOP_1]: 'XX',
                [PIECES.WHITE_QUEEN]: 'XX',
                [PIECES.BLACK_PAWN_2]: 'XX',
                [PIECES.BLACK_PAWN_3]: 'C5',
            }),
        ];
        const actionsList = [
            {}, {}, turn3Actions, {}, turn5Actions, {}, turn7Actions, {}, turn9Actions, {}, turn11Actions,
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
                [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_4]: ['D3M', 'D4M'],
                [PIECES.WHITE_PAWN_7]: ['G3M', 'G4M'],
                [PIECES.WHITE_PAWN_8]: ['H3M', 'H4M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'E3M', 'F3M', 'G3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_7]: ['G3M'],
                [PIECES.WHITE_KING]: ['F1M', 'G1M', 'E2M', 'E3M', 'F3M'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
                [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_4]: ['D5M', 'E5C'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6C'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
                [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_4]: ['D6M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'B5M', 'A6M', 'B3M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6C'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
                [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_4]: ['D7M', 'C7C'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6C'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
                [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_4]: ['D8T', 'C8T'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'D6M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6C'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A3M'],
                [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_4]: ['C7C', 'D8M', 'E8M', 'F8C', 'B8C', 'D7M', 'E6M', 'F5M', 'G4M', 'H3M', 'B7C'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'D6M', 'D7M', 'D8M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6C'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_2]: ['B3M', 'B4M', 'A3C'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_4]: ['B7C', 'C8M', 'D8M', 'E8M', 'F8C', 'A8C', 'C7C', 'A7M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'D6M', 'D7M', 'D8M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6C'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_4]: ['A7M', 'A6M', 'A5M', 'A4M', 'A3M', 'B8M', 'C8M', 'D8M', 'E8M', 'F8C', 'B7C'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'D6M', 'D7M', 'D8M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6C', 'B2C'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_4]: ['F7C', 'G8C', 'E8M', 'D8M', 'C8M', 'B8M', 'A8M', 'G7C', 'E7M', 'D6M', 'C5M', 'B4M', 'A3M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'D6M', 'D7M', 'D8M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6M', 'B2C'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A3M', 'A4M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'D6M', 'D7M', 'D8M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6M', 'B2C'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A5M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_1]: ['B1C', 'A2M', 'A3M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'D6M', 'D7M', 'D8M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M', 'A2M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6M', 'B2M', 'A3M'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A6M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'D6M', 'D7M', 'D8M', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M', 'A2M'],
                [PIECES.WHITE_BISHOP_1]: ['D2M', 'E3M', 'F4M', 'G5M', 'H6M', 'B2M', 'A3M'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['A7M', 'B7C'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'F3M'],
                [PIECES.WHITE_QUEEN]: ['E1M', 'F1M', 'G1M', 'D2M', 'D3M', 'D4M', 'D5M', 'D6M', 'D7M', 'D8M', 'C1C', 'E2M', 'F3M', 'G4M', 'H5M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'B3M', 'A2M'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['B8T'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M', 'D1C'],
                [PIECES.WHITE_KING]: ['G2M', 'E3M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M', 'A2M'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['B7M', 'B6M', 'B5M', 'B4M', 'B3M', 'B2M', 'B1M', 'C8C', 'A8M', 'C7C', 'A7M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M', 'D1C'],
                [PIECES.WHITE_KING]: ['G2M', 'E3M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M', 'A2M'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['C7C', 'D8C', 'B8M', 'A8M', 'D7M', 'E6M', 'F5M', 'G4M', 'H3M', 'B7M', 'A6M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_7]: ['H4C'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M', 'D1M', 'C1M', 'B1M', 'A1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M', 'A2M'],
            }),
            {},
            createActions(PIECE_COLORS.WHITE, {
                [PIECES.WHITE_PAWN_1]: ['C7M', 'C6M', 'C5C', 'D8C', 'B8M', 'A8M', 'D7M', 'E6M', 'F5M', 'G4M', 'H3M', 'B7M', 'A6M'],
                [PIECES.WHITE_PAWN_3]: ['C3M'],
                [PIECES.WHITE_PAWN_7]: ['H5M'],
                [PIECES.WHITE_PAWN_8]: ['H3M'],
                [PIECES.WHITE_ROOK_2]: ['G1M', 'F1M', 'E1M', 'D1M', 'C1M', 'B1M', 'A1M'],
                [PIECES.WHITE_KING]: ['E1M', 'F1M', 'G1M', 'E2M', 'G2M', 'E3M', 'F3M', 'G3M'],
                [PIECES.WHITE_BISHOP_2]: ['D3M', 'E2M', 'F1M', 'D5M', 'E6M', 'F7C', 'B5M', 'A6M', 'B3M', 'A2M'],
            }),
            {},
        ];
        const movementList = [
            ['A1', 'A1'],
            ['B1', 'C3'],
            ['D7', 'D5'],
            ['C3', 'D5'],
            ['D8', 'D5'],
            ['G1', 'F3'],
            ['D5', 'F3'],
            ['E2', 'E4'],
            ['F3', 'F2'],
            ['E1', 'F2'],
            ['E7', 'E5'],
            ['F1', 'C4'],
            ['F8', 'E7'],
            ['D2', 'D4'],
            ['E7', 'H4'],
            ['G2', 'G3'],
            ['G8', 'H6'],
            ['D4', 'D5'],
            ['E8', 'G8', 'H8', 'F8'],
            ['D5', 'D6'],
            ['A7', 'A5'],
            ['D6', 'D7'],
            ['G8', 'H8'],
            ['D7', 'C8'],
            ['A5', 'A4'],
            ['C8', 'B8'],
            ['A4', 'A3'],
            ['B8', 'A8'],
            ['A3', 'B2'],
            ['A8', 'F8'],
            ['H6', 'G8'],
            ['F8', 'E7'],
            ['G8', 'E7'],
            ['A2', 'A4'],
            ['B2', 'B1'],
            ['A4', 'A5'],
            ['B1', 'A1'],
            ['A5', 'A6'],
            ['A1', 'C1'],
            ['A6', 'B7'],
            ['C1', 'D1'],
            ['B7', 'B8'],
            ['E7', 'C8'],
            ['B8', 'C8'],
            ['D1', 'D8'],
            ['G3', 'H4'],
            ['C7', 'C5'],
            ['C8', 'D8'],
        ]

        turnList.forEach((turn, index) => {
            if (index === 0) {
                return;
            }

            jest.clearAllMocks();
            const movement = movementList[index];
            if (movement.length === 4) {
                board = movePiece(board, movement[0], movement[1]);
                board = movePiece(board, movement[2], movement[3]);
            } else {
                board = movePiece(board, movement[0], movement[1]);
            }

            const manager = new BoardManager(turnList[index - 1], turn, undefined, undefined, PIECE_COLORS.WHITE);
            manager.getStatus(setStatusFunc, setMessageFunc, jest.fn(), jest.fn());

            const pawnRegistry = pawnRegistryList[index];
            const positions = positionsList[index];
            const actions = actionsList[index];
            const expectedNextTurn = index === 47 ? GAME_STATUS.CHECKMATE : index % 2 === 0 ? GAME_STATUS.WHITE_TURN : GAME_STATUS.BLACK_TURN;

            expect(setStatusFunc).toHaveBeenCalledTimes(1);
            expect(setStatusFunc).toHaveBeenCalledWith(expectedNextTurn);
            expect(manager.actions).toEqual(actions);
            expect(manager.pawnRegistry).toEqual(pawnRegistry);
            expect(manager.positions).toEqual(positions);
            expect(manager.board).toEqual(board);
        });
    });

    test('Scenario 2', () => {
        const [turnNeg1, turn0] = generateInitalMoves();
        const blackManager = new BoardManager(turnNeg1, turn0, undefined, undefined, PIECE_COLORS.BLACK);
        const whiteManager = new BoardManager(turnNeg1, turn0, undefined, undefined, PIECE_COLORS.WHITE);

        const actions = [
            ['E2', 'E4M'],
            ['E7', 'E5M'],
            ['G1', 'F3M'],
            ['B8', 'C6M'],
            ['F1', 'C4M'],
            ['F8', 'C5M'],
            ['D2', 'D4M'],
            ['E5', 'D4C'],
            ['F3', 'H4M'],
            ['A7', 'A6M'],
            ['C1', 'G5M'],
        ];


    });
});
