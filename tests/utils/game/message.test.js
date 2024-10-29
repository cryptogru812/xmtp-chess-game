import {
    extractMoveDetails,
    canCastle,
    getNextTurn,
    isOpponentMove,
    getPlayerFromMessage,
    validateTurnContinuity,
} from '../../../src/utils/game/message';
import { MESSAGE, PIECE_COLORS, GAME_STATUS, GAME_VALIDATION_MESSAGES } from '../../../src/utils/enum';

const generateBasicBoard = () => {
    return 'XX'.repeat(32);
}

const createBasicMove = (color = PIECE_COLORS.WHITE, canCastle = MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE) => {
    const board = generateBasicBoard();

    return [board, color, canCastle].join(MESSAGE.GAME_DELIMITER);
}

const createMove = (board, player, canCastle) => {
    return [board, player, canCastle].join(MESSAGE.GAME_DELIMITER);
}

describe('Tests extractMoveDetails', () => {
    it('Should extract the board, player, and canCastle from a move', () => {
        const move = createBasicMove(undefined, 'TTFF');

        const details = extractMoveDetails(move);

        expect(details.board).toBe(generateBasicBoard());
        expect(details.player).toBe(PIECE_COLORS.WHITE);
        expect(details.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: true,
            },
            [PIECE_COLORS.BLACK]: {
                1: false,
                2: false,
            },
        });
    });

    it('Should mark invalid canCastle values as undefined', () => {
        const move = createMove('abcdefg', PIECE_COLORS.WHITE, 'XXXX');

        const details = extractMoveDetails(move);

        expect(details.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: undefined,
                2: undefined,
            },
            [PIECE_COLORS.BLACK]: {
                1: undefined,
                2: undefined,
            },
        });
    });

    it('Should mark unprovided canCastle values as undefined', () => {
        const move = createMove('abcdefg', PIECE_COLORS.WHITE, '');

        const details = extractMoveDetails(move);

        expect(details.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: undefined,
                2: undefined,
            },
            [PIECE_COLORS.BLACK]: {
                1: undefined,
                2: undefined,
            },
        });
    });
});

describe('Tests canCastle', () => {
    it('Should return true if the player can castle', () => {
        const move = createBasicMove();

        const castle = canCastle(move, PIECE_COLORS.WHITE, 1);

        expect(castle).toBe(true);
    });

    it('Should return false if the player cannot castle', () => {
        const move = createBasicMove(undefined, 'TFFF');

        const castle = canCastle(move, PIECE_COLORS.BLACK, 1);

        expect(castle).toBe(false);
    });
})

describe('Tests getNextTurn', () => {
    it('Should return the next turn', () => {
        const move = createBasicMove();

        const nextTurn = getNextTurn(move);

        expect(nextTurn).toBe(GAME_STATUS.BLACK_TURN);
    });

    it('Should return the next turn', () => {
        const move = createMove('abcdefg', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.TRUE);

        const nextTurn = getNextTurn(move);

        expect(nextTurn).toBe(GAME_STATUS.WHITE_TURN);
    });
});

describe('Tests getPlayerFromMessage', () => {
    it('Should return the player color from the message', () => {
        const move = createBasicMove();

        const player = getPlayerFromMessage(move);

        expect(player).toBe('W');
    });
});

describe('Tests isOpponentMove', () => {
    it('Should return true if the move was made by the opponent', () => {
        const move = createBasicMove();

        const isMove = isOpponentMove(move, PIECE_COLORS.BLACK);

        expect(isMove).toBe(true);
    });

    it('Should return false if the move was not made by the opponent', () => {
        const move = createBasicMove();

        const isMove = isOpponentMove(move, PIECE_COLORS.WHITE);

        expect(isMove).toBe(false);
    });
});

describe('Tests validateTurnContinuity', () => {
    it('Should return an error about no player being provided for the last move', () => {
        const lastMove = createMove('abc', '', MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('def', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.FALSE);

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_MESSAGE });
    });

    it('Should return an error about no player being provided for the current move', () => {
        const lastMove = createMove('abc', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('def', '', MESSAGE.TRUE + MESSAGE.FALSE);

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_MESSAGE });
    });

    it('Should return an error about the castle status not being provided for the last move', () => {
        const lastMove = createMove('abc', PIECE_COLORS.WHITE, '');
        const currentMove = createMove('def', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.FALSE);

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_MESSAGE });
    })

    it('Should return an error about the castle status not being provided for the current move', () => {
        const lastMove = createMove('abc', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('def', PIECE_COLORS.BLACK, '');

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_MESSAGE });
    });

    it('Should return an error about no board being provided for the last move', () => {
        const lastMove = createMove('', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('def', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.FALSE);

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_MESSAGE });
    });

    it('Should return an error about no board being provided for the current move', () => {
        const lastMove = createMove('abc', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.FALSE);

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_MESSAGE });
    });

    it('Should return an error for the board being less than 64 characters', () => {
        const lastMove = createBasicMove();
        const currentMove = createMove('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', PIECE_COLORS.BLACK, 'TTFF');

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_BOARD_SIZE });
    });

    it('Should return an error for the board giving a rook 3 characters', () => {
        const lastMove = createBasicMove();
        const currentMove = createMove('RXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', PIECE_COLORS.BLACK, 'TTFF');

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_PIECE_POS });
    })

    it('Should return an error for the board being greater than 80 characters', () => {
        const lastMove = createBasicMove();
        const currentMove = createMove('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', PIECE_COLORS.BLACK, 'TFFF');

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_BOARD_SIZE });
    });

    it('Should return an error for the board using invalid characters', () => {
        const lastMove = createBasicMove();
        const currentMove = createMove('ZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZX', PIECE_COLORS.BLACK, 'TFFF');

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.INVALID_PIECE_POS });
    })

    it('Should return an error for both moves signed by the same player color', () => {
        const lastMove = createMove('X'.repeat(64), PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('X'.repeat(64), PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.SAME_MESSAGE_COLOR, PIECE_COLORS.WHITE) });
    })

    it('Should return an error if the castle is re-enabled for a player', () => {
        const lastMove = createMove('X'.repeat(64), PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('X'.repeat(64), PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.FALSE);

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.REENABLE_CASTLING, PIECE_COLORS.BLACK) });
    })

    it('Should return an error for having no difference between the moves', () => {
        const lastMove = createMove('X'.repeat(64), PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('X'.repeat(64), PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);

        const error = validateTurnContinuity(lastMove, currentMove);

        expect(error).toEqual({ error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.NO_MOVE, PIECE_COLORS.BLACK) });
    })

    it('Should return an error for having too many differences between the moves', () => {
        const lastMove = createMove('A1B2C3D4'.repeat(8), PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('C3D4A1B2'.repeat(8), PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);

        const results = validateTurnContinuity(lastMove, currentMove);

        expect(results).toEqual({ error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.MULTI_ACTION, PIECE_COLORS.BLACK) });
    });

    it('Should return an error for no moves being made', () => {
        const lastMove = createMove('A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);
        const currentMove = createMove('A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);

        const results = validateTurnContinuity(lastMove, currentMove);

        expect(results).toEqual({ error: GAME_VALIDATION_MESSAGES.formatMessage(GAME_VALIDATION_MESSAGES.NO_MOVE, PIECE_COLORS.BLACK) });
    });

    it('Should return data for a single move being made', () => {
        const lastMove = createMove('A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);
        const currMove = createMove('A1B1C1D1E1F1G1H1A3B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);

        const results = validateTurnContinuity(lastMove, currMove);
        const expectedLastPos = {
            'WR1': 'A1', 'WN1': 'B1', 'WB1': 'C1', 'WQ': 'D1',
            'WK': 'E1', 'WB2': 'F1', 'WN2': 'G1', 'WR2': 'H1',
            'WP1': 'A2', 'WP2': 'B2', 'WP3': 'C2', 'WP4': 'D2',
            'WP5': 'E2', 'WP6': 'F2', 'WP7': 'G2', 'WP8': 'H2',
            'BR1': 'A8', 'BN1': 'B8', 'BB1': 'C8', 'BQ': 'D8',
            'BK': 'E8', 'BB2': 'F8', 'BN2': 'G8', 'BR2': 'H8',
            'BP1': 'A7', 'BP2': 'B7', 'BP3': 'C7', 'BP4': 'D7',
            'BP5': 'E7', 'BP6': 'F7', 'BP7': 'G7', 'BP8': 'H7',
        }
        const expectedCurrPos = {
            'WR1': 'A1', 'WN1': 'B1', 'WB1': 'C1', 'WQ': 'D1',
            'WK': 'E1', 'WB2': 'F1', 'WN2': 'G1', 'WR2': 'H1',
            'WP1': 'A3', 'WP2': 'B2', 'WP3': 'C2', 'WP4': 'D2',
            'WP5': 'E2', 'WP6': 'F2', 'WP7': 'G2', 'WP8': 'H2',
            'BR1': 'A8', 'BN1': 'B8', 'BB1': 'C8', 'BQ': 'D8',
            'BK': 'E8', 'BB2': 'F8', 'BN2': 'G8', 'BR2': 'H8',
            'BP1': 'A7', 'BP2': 'B7', 'BP3': 'C7', 'BP4': 'D7',
            'BP5': 'E7', 'BP6': 'F7', 'BP7': 'G7', 'BP8': 'H7',
        }

        expect(results.data).toBeDefined();
        expect(results.data).not.toBeNull();
        expect(results.data.last.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: false,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: false,
            },
        });
        expect(results.data.curr.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: false,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: false,
            },
        });
        expect(results.data.player).toBe(PIECE_COLORS.BLACK);
        expect(Object.keys(results.data.last.positions).length).toBe(32);
        expect(Object.keys(results.data.curr.positions).length).toBe(32);
        expect(Object.keys(results.data.differences).length).toBe(1);
        expect(results.data.differences['WP1'][0]).toBe('A2');
        expect(results.data.differences['WP1'][1]).toBe('A3');
        Object.keys(expectedLastPos).forEach((key) => {
            const expectedLast = expectedLastPos[key];
            const recievedLast = results.data.last.positions[key];

            expect(recievedLast).toBe(expectedLast);
        });
        Object.keys(expectedCurrPos).forEach((key) => {
            const expectedCurr = expectedCurrPos[key];
            const recievedCurr = results.data.curr.positions[key];

            expect(recievedCurr).toBe(expectedCurr);
        });
    })

    it('Should recognize and allow castling', () => {
        const lastMove = createMove('XXXXXXXXE1XXXXH1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE);
        const currMove = createMove('XXXXXXXXG1XXXXF1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.FALSE + MESSAGE.TRUE + MESSAGE.FALSE);

        const results = validateTurnContinuity(lastMove, currMove);
        const expectedLastPos = {
            'WR1': 'XX', 'WN1': 'XX', 'WB1': 'XX', 'WQ': 'XX',
            'WK': 'E1', 'WB2': 'XX', 'WN2': 'XX', 'WR2': 'H1',
            'WP1': 'XX', 'WP2': 'XX', 'WP3': 'XX', 'WP4': 'XX',
            'WP5': 'XX', 'WP6': 'XX', 'WP7': 'XX', 'WP8': 'XX',
            'BR1': 'XX', 'BN1': 'XX', 'BB1': 'XX', 'BQ': 'XX',
            'BK': 'XX', 'BB2': 'XX', 'BN2': 'XX', 'BR2': 'XX',
            'BP1': 'XX', 'BP2': 'XX', 'BP3': 'XX', 'BP4': 'XX',
            'BP5': 'XX', 'BP6': 'XX', 'BP7': 'XX', 'BP8': 'XX',
        }
        const expectedCurrPos = {
            'WR1': 'XX', 'WN1': 'XX', 'WB1': 'XX', 'WQ': 'XX',
            'WK': 'G1', 'WB2': 'XX', 'WN2': 'XX', 'WR2': 'F1',
            'WP1': 'XX', 'WP2': 'XX', 'WP3': 'XX', 'WP4': 'XX',
            'WP5': 'XX', 'WP6': 'XX', 'WP7': 'XX', 'WP8': 'XX',
            'BR1': 'XX', 'BN1': 'XX', 'BB1': 'XX', 'BQ': 'XX',
            'BK': 'XX', 'BB2': 'XX', 'BN2': 'XX', 'BR2': 'XX',
            'BP1': 'XX', 'BP2': 'XX', 'BP3': 'XX', 'BP4': 'XX',
            'BP5': 'XX', 'BP6': 'XX', 'BP7': 'XX', 'BP8': 'XX',
        }

        expect(results.data).toBeDefined();
        expect(results.data).not.toBeNull();
        expect(results.data.last.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: true,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: true,
            },
        });
        expect(results.data.curr.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: false,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: false,
            },
        });
        expect(results.data.transformed).toBe(false);
        expect(results.data.player).toBe(PIECE_COLORS.BLACK);
        expect(Object.keys(results.data.last.positions).length).toBe(32);
        expect(Object.keys(results.data.curr.positions).length).toBe(32);
        expect(Object.keys(results.data.differences).length).toBe(2);
        expect(results.data.differences['WK'][0]).toBe('E1');
        expect(results.data.differences['WK'][1]).toBe('G1');
        expect(results.data.differences['WR2'][0]).toBe('H1');
        expect(results.data.differences['WR2'][1]).toBe('F1');
        Object.keys(expectedLastPos).forEach((key) => {
            const expectedLast = expectedLastPos[key];
            const recievedLast = results.data.last.positions[key];

            expect(recievedLast).toBe(expectedLast);
        });
        Object.keys(expectedCurrPos).forEach((key) => {
            const expectedCurr = expectedCurrPos[key];
            const recievedCurr = results.data.curr.positions[key];

            expect(recievedCurr).toBe(expectedCurr);
        });
    })

    it('Should notice a capture', () => {
        const lastMove = createMove('A1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXA7XXXXXXXXXXXXXX', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE);
        const currMove = createMove('A7XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE);

        const results = validateTurnContinuity(lastMove, currMove);
        const expectedLastPos = {
            'WR1': 'A1', 'WN1': 'XX', 'WB1': 'XX', 'WQ': 'XX',
            'WK': 'XX', 'WB2': 'XX', 'WN2': 'XX', 'WR2': 'XX',
            'WP1': 'XX', 'WP2': 'XX', 'WP3': 'XX', 'WP4': 'XX',
            'WP5': 'XX', 'WP6': 'XX', 'WP7': 'XX', 'WP8': 'XX',
            'BR1': 'XX', 'BN1': 'XX', 'BB1': 'XX', 'BQ': 'XX',
            'BK': 'XX', 'BB2': 'XX', 'BN2': 'XX', 'BR2': 'XX',
            'BP1': 'A7', 'BP2': 'XX', 'BP3': 'XX', 'BP4': 'XX',
            'BP5': 'XX', 'BP6': 'XX', 'BP7': 'XX', 'BP8': 'XX',
        }
        const expectedCurrPos = {
            'WR1': 'A7', 'WN1': 'XX', 'WB1': 'XX', 'WQ': 'XX',
            'WK': 'XX', 'WB2': 'XX', 'WN2': 'XX', 'WR2': 'XX',
            'WP1': 'XX', 'WP2': 'XX', 'WP3': 'XX', 'WP4': 'XX',
            'WP5': 'XX', 'WP6': 'XX', 'WP7': 'XX', 'WP8': 'XX',
            'BR1': 'XX', 'BN1': 'XX', 'BB1': 'XX', 'BQ': 'XX',
            'BK': 'XX', 'BB2': 'XX', 'BN2': 'XX', 'BR2': 'XX',
            'BP1': 'XX', 'BP2': 'XX', 'BP3': 'XX', 'BP4': 'XX',
            'BP5': 'XX', 'BP6': 'XX', 'BP7': 'XX', 'BP8': 'XX',
        }

        expect(results.data).toBeDefined();
        expect(results.data).not.toBeNull();
        expect(results.data.last.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: true,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: true,
            },
        });
        expect(results.data.curr.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: true,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: true,
            },
        });
        expect(results.data.transformed).toBe(false);
        expect(results.data.player).toBe(PIECE_COLORS.BLACK);
        expect(Object.keys(results.data.last.positions).length).toBe(32);
        expect(Object.keys(results.data.curr.positions).length).toBe(32);
        expect(Object.keys(results.data.differences).length).toBe(2);
        expect(results.data.differences['WR1'][0]).toBe('A1');
        expect(results.data.differences['WR1'][1]).toBe('A7');
        expect(results.data.differences['BP1'][0]).toBe('A7');
        expect(results.data.differences['BP1'][1]).toBe('XX');
        Object.keys(expectedLastPos).forEach((key) => {
            const expectedLast = expectedLastPos[key];
            const recievedLast = results.data.last.positions[key];

            expect(recievedLast).toBe(expectedLast);
        });
        Object.keys(expectedCurrPos).forEach((key) => {
            const expectedCurr = expectedCurrPos[key];
            const recievedCurr = results.data.curr.positions[key];

            expect(recievedCurr).toBe(expectedCurr);
        });
    });

    it('Should notice a transform', () => {
        const lastMove = createMove('XXXXXXXXXXXXXXXXA7XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE);
        const currMove = createMove('XXXXXXXXXXXXXXXXQA8XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE);

        const results = validateTurnContinuity(lastMove, currMove);
        const expectedLastPos = {
            'WR1': 'XX', 'WN1': 'XX', 'WB1': 'XX', 'WQ': 'XX',
            'WK': 'XX', 'WB2': 'XX', 'WN2': 'XX', 'WR2': 'XX',
            'WP1': 'A7', 'WP2': 'XX', 'WP3': 'XX', 'WP4': 'XX',
            'WP5': 'XX', 'WP6': 'XX', 'WP7': 'XX', 'WP8': 'XX',
            'BR1': 'XX', 'BN1': 'XX', 'BB1': 'XX', 'BQ': 'XX',
            'BK': 'XX', 'BB2': 'XX', 'BN2': 'XX', 'BR2': 'XX',
            'BP1': 'XX', 'BP2': 'XX', 'BP3': 'XX', 'BP4': 'XX',
            'BP5': 'XX', 'BP6': 'XX', 'BP7': 'XX', 'BP8': 'XX',
        }
        const expectedCurrPos = {
            'WR1': 'XX', 'WN1': 'XX', 'WB1': 'XX', 'WQ': 'XX',
            'WK': 'XX', 'WB2': 'XX', 'WN2': 'XX', 'WR2': 'XX',
            'WP1': 'A8', 'WP2': 'XX', 'WP3': 'XX', 'WP4': 'XX',
            'WP5': 'XX', 'WP6': 'XX', 'WP7': 'XX', 'WP8': 'XX',
            'BR1': 'XX', 'BN1': 'XX', 'BB1': 'XX', 'BQ': 'XX',
            'BK': 'XX', 'BB2': 'XX', 'BN2': 'XX', 'BR2': 'XX',
            'BP1': 'XX', 'BP2': 'XX', 'BP3': 'XX', 'BP4': 'XX',
            'BP5': 'XX', 'BP6': 'XX', 'BP7': 'XX', 'BP8': 'XX',
        }

        expect(results.data).toBeDefined();
        expect(results.data).not.toBeNull();
        expect(results.data.last.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: true,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: true,
            },
        });
        expect(results.data.curr.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: true,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: true,
            },
        });
        expect(results.data.transformed).toBe(true);
        expect(results.data.player).toBe(PIECE_COLORS.BLACK);
        expect(Object.keys(results.data.last.positions).length).toBe(32);
        expect(Object.keys(results.data.curr.positions).length).toBe(32);
        expect(Object.keys(results.data.differences).length).toBe(1);
        expect(results.data.differences['WP1'][0]).toBe('A7');
        expect(results.data.differences['WP1'][1]).toBe('A8');
        expect(results.data.last.pawnRegistry).toEqual({});
        expect(results.data.curr.pawnRegistry).toEqual({
            'WP1': 'Q',
        });
        Object.keys(expectedLastPos).forEach((key) => {
            const expectedLast = expectedLastPos[key];
            const recievedLast = results.data.last.positions[key];

            expect(recievedLast).toBe(expectedLast);
        });
        Object.keys(expectedCurrPos).forEach((key) => {
            const expectedCurr = expectedCurrPos[key];
            const recievedCurr = results.data.curr.positions[key];

            expect(recievedCurr).toBe(expectedCurr);
        });
    })

    it('It should notice any number of transofrmed pawns', () => {
        const lastMove = createMove('XXXXXXXXXXXXXXXXA7QB2QC2QD2QE2QF2QG2QH2XXXXXXXXXXXXXXXXQA1QB1QC1QD1QE1QF1QG1QH1', PIECE_COLORS.WHITE, MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE);
        const currMove = createMove('XXXXXXXXXXXXXXXXQA8QB2QC2QD2QE2QF2QG2QH2XXXXXXXXXXXXXXXXQA1QB1QC1QD1QE1QF1QG1QH1', PIECE_COLORS.BLACK, MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE + MESSAGE.TRUE);

        const results = validateTurnContinuity(lastMove, currMove);
        const expectedLastPos = {
            'WR1': 'XX', 'WN1': 'XX', 'WB1': 'XX', 'WQ': 'XX',
            'WK': 'XX', 'WB2': 'XX', 'WN2': 'XX', 'WR2': 'XX',
            'WP1': 'A7', 'WP2': 'B2', 'WP3': 'C2', 'WP4': 'D2',
            'WP5': 'E2', 'WP6': 'F2', 'WP7': 'G2', 'WP8': 'H2',
            'BR1': 'XX', 'BN1': 'XX', 'BB1': 'XX', 'BQ': 'XX',
            'BK': 'XX', 'BB2': 'XX', 'BN2': 'XX', 'BR2': 'XX',
            'BP1': 'A1', 'BP2': 'B1', 'BP3': 'C1', 'BP4': 'D1',
            'BP5': 'E1', 'BP6': 'F1', 'BP7': 'G1', 'BP8': 'H1',
        }

        const expectedCurrPos = {
            'WR1': 'XX', 'WN1': 'XX', 'WB1': 'XX', 'WQ': 'XX',
            'WK': 'XX', 'WB2': 'XX', 'WN2': 'XX', 'WR2': 'XX',
            'WP1': 'A8', 'WP2': 'B2', 'WP3': 'C2', 'WP4': 'D2',
            'WP5': 'E2', 'WP6': 'F2', 'WP7': 'G2', 'WP8': 'H2',
            'BR1': 'XX', 'BN1': 'XX', 'BB1': 'XX', 'BQ': 'XX',
            'BK': 'XX', 'BB2': 'XX', 'BN2': 'XX', 'BR2': 'XX',
            'BP1': 'A1', 'BP2': 'B1', 'BP3': 'C1', 'BP4': 'D1',
            'BP5': 'E1', 'BP6': 'F1', 'BP7': 'G1', 'BP8': 'H1',
        }

        expect(results.data).toBeDefined();
        expect(results.data).not.toBeNull();
        expect(results.data.last.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: true,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: true,
            },
        });
        expect(results.data.curr.canCastle).toEqual({
            [PIECE_COLORS.WHITE]: {
                1: true,
                2: true,
            },
            [PIECE_COLORS.BLACK]: {
                1: true,
                2: true,
            },
        });
        expect(results.data.transformed).toBe(true);
        expect(results.data.player).toBe(PIECE_COLORS.BLACK);
        expect(Object.keys(results.data.last.positions).length).toBe(32);
        expect(Object.keys(results.data.curr.positions).length).toBe(32);
        expect(Object.keys(results.data.differences).length).toBe(1);
        expect(results.data.differences['WP1'][0]).toBe('A7');
        expect(results.data.differences['WP1'][1]).toBe('A8');
        expect(results.data.last.pawnRegistry).toEqual({
            'BP1': 'Q', 'BP2': 'Q', 'BP3': 'Q', 'BP4': 'Q',
            'BP5': 'Q', 'BP6': 'Q', 'BP7': 'Q', 'BP8': 'Q',
            'WP2': 'Q', 'WP3': 'Q', 'WP4': 'Q',
            'WP5': 'Q', 'WP6': 'Q', 'WP7': 'Q', 'WP8': 'Q',
        });
        expect(results.data.curr.pawnRegistry).toEqual({
            'BP1': 'Q', 'BP2': 'Q', 'BP3': 'Q', 'BP4': 'Q',
            'BP5': 'Q', 'BP6': 'Q', 'BP7': 'Q', 'BP8': 'Q',
            'WP1': 'Q', 'WP2': 'Q', 'WP3': 'Q', 'WP4': 'Q',
            'WP5': 'Q', 'WP6': 'Q', 'WP7': 'Q', 'WP8': 'Q',
        });
        Object.keys(expectedLastPos).forEach((key) => {
            const expectedLast = expectedLastPos[key];
            const recievedLast = results.data.last.positions[key];

            expect(recievedLast).toBe(expectedLast);
        });
        Object.keys(expectedCurrPos).forEach((key) => {
            const expectedCurr = expectedCurrPos[key];
            const recievedCurr = results.data.curr.positions[key];

            expect(recievedCurr).toBe(expectedCurr);
        });
    })
});
