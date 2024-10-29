import { createStarterMessage, createTestXMTPMessage } from "../../tools";
import {
    hasHash,
    getHash,
    getContent,
    filterMessages,
    isHashContent,
    isConnectStatus,
    loadGameHistory,
    isGameInvite,
    isGameAccept,
    isGameDecline,
    isGameOver,
    isGameEnd,
    isGameMove,
} from "../../../src/utils/message/message";
import { CONNECT_STATUS, MESSAGE, PIECE_COLORS } from "../../../src/utils/enum";
import { generateInitalMoves } from "../../../src/utils/game/message";

const [moveNeg1, move0] = generateInitalMoves();

describe('Tests the hasHash function', () => {
    it('Should return true for a valid hash', () => {
        const message = createTestXMTPMessage('ABCDE-');

        const results = hasHash(message.content);

        expect(results).toBe(true);
    });

    it('Should return false for an invalid hash', () => {
        const message = createTestXMTPMessage('Hey thjere gusy how are you doing');

        const results = hasHash(message.content);

        expect(results).toBe(false);
    });
});

describe('Tests the getHash function', () => {
    it('Should return the hash', () => {
        const message = createTestXMTPMessage('ABCDE-ABCDEFGESFSDFSD');

        const results = getHash(message.content);

        expect(results).toBe('ABCDE');
    });
});

describe('Tests the getContent function', () => {
    it('Should return the content', () => {
        const message = createTestXMTPMessage('ABCDE-ABCDEFGESFSDFSD');

        const results = getContent(message.content);

        expect(results).toBe('ABCDEFGESFSDFSD');
    });
});

describe('Tests the isHashContent function', () => {
    it('Should return true if the message starts with the hash', () => {
        const message = createTestXMTPMessage('ABCDE-ABCDEFGESFSDFSD');

        const results = isHashContent(message.content, 'ABCDE');

        expect(results).toBe(true);
    });

    it('Should return false if the message does not start with the hash', () => {
        const message = createTestXMTPMessage('ABCDE-ABCDEFGESFSDFSD');

        const results = isHashContent(message.content, 'DEFGA');

        expect(results).toBe(false);
    });

    it('Should return false if the message does not have the hash delimiter', () => {
        const message = createTestXMTPMessage('ABCDEABCDEFGESFSDFSD');

        const results = isHashContent(message.content, 'ABCDE');

        expect(results).toBe(false);
    });
});

describe('Tests the filterMessages function', () => {
    it('Should filter game messages from regular messages', () => {
        const hash = 'ABCDE';
        const messages = [
            createTestXMTPMessage(hash + '-ABCDEFGESFSDFSD'),
            createTestXMTPMessage('Hey thjere gusy how are you doing'),
            createTestXMTPMessage(hash + '-ABCDEFGESFSDFSD'),
            createTestXMTPMessage('This is a test message'),
            createTestXMTPMessage(hash + '-ABCDEFGESFSDFSD'),
        ];

        const results = filterMessages(messages, hash);

        expect(results.gameMessages.length).toBe(3);
        expect(results.convoMessages.length).toBe(2);
        expect(results.gameMessages).toContainEqual(messages[0]);
        expect(results.gameMessages).toContainEqual(messages[2]);
        expect(results.gameMessages).toContainEqual(messages[4]);
        expect(results.convoMessages).toContainEqual(messages[1]);
        expect(results.convoMessages).toContainEqual(messages[3]);
    });
});

describe("Tests the isConnectStatus function", () => {
    it('Should return true when the content is a connect status', () => {
        const results = isConnectStatus('abcdp-O,C');

        expect(results).toBe(true);
    });
});

describe("Tests the isGameInvite function", () => {
    it('Should return true when the content is a game invite and is an unknown hash', () => {
        const results = isGameInvite('abcdp-I,W');

        expect(results).toBe(true);
    });

    it('Should return true when the content is a game invite and is a known hash', () => {
        const results = isGameInvite('ABCDE-I,W', 'ABCDE');

        expect(results).toBe(true);
    });

    it('Should return false when the content is not a game invite', () => {
        const results = isGameInvite('hello');

        expect(results).toBe(false);
    });

    it('Should return false if the hash is not the expected hash', () => {
        const results = isGameInvite('ABCDE-I,W', 'FGHIJ');

        expect(results).toBe(false);
    });

    it('Should return false if the hash is not the exact expected hash', () => {
        const results = isGameInvite('ABCDE-I,W', 'EDCBA');

        expect(results).toBe(false);
    });

    it('Should return false if the invite message contains any extra characters at the beginning', () => {
        const results = isGameAccept('1234ABCDE-I,W');

        expect(results).toBe(false);
    });

    it('Should return false if the invite message contains any extra characters at the end', () => {
        const results = isGameAccept('ABCDE-I,W,T');

        expect(results).toBe(false);
    });

    it('Should return false if an invalid color is provided', () => {
        const results = isGameAccept('ABCDE-I,X');

        expect(results).toBe(false);
    });

    it('Should return false if a color is not provided', () => {
        const results = isGameAccept('ABCDE-I');

        expect(results).toBe(false);
    });
});

describe("Tests the isGameAccept function", () => {
    it('Should return true when the content is a game accept and is an unknown hash', () => {
        const results = isGameAccept('abcdp-A,W');

        expect(results).toBe(true);
    });

    it('Should return true when the content is a game accept and is a known hash', () => {
        const results = isGameAccept('ABCDE-A,W', 'ABCDE');

        expect(results).toBe(true);
    });

    it('Should return false when the content is not a game accept', () => {
        const results = isGameAccept('345rs');

        expect(results).toBe(false);
    });

    it('Should return false if the hash is not the expected hash', () => {
        const results = isGameAccept('ABCDE-A,W', 'FGHIJ');

        expect(results).toBe(false);
    });

    it('Should return false if the hash is not the exact expected hash', () => {
        const results = isGameAccept('ABCDE-A,W', 'EDCBA');

        expect(results).toBe(false);
    });

    it('Should return false if the accept message contains any extra characters at the beginning', () => {
        const results = isGameAccept('1234ABCDE-A,W');

        expect(results).toBe(false);
    });

    it('Should return false if the accept message contains any extra characters at the end', () => {
        const results = isGameAccept('ABCDE-A,W,T');

        expect(results).toBe(false);
    });

    it('Should return false if an invalid color is provided', () => {
        const results = isGameAccept('ABCDE-A,X');

        expect(results).toBe(false);
    });

    it('Should return false if a color is not provided', () => {
        const results = isGameAccept('ABCDE-A,');

        expect(results).toBe(false);
    });
});

describe("Tests the isGameDecline function", () => {
    it('Should return true when the content is a game decline and is an unknown hash', () => {
        const results = isGameDecline('abcdp' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.DECLINE);

        expect(results).toBe(true);
    });

    it('Should return true when the content is a game decline and is a known hash', () => {
        const results = isGameDecline('ABCDE-D', 'ABCDE');

        expect(results).toBe(true);
    });

    it('Should return false when the content is not a game decline', () => {
        const results = isGameDecline('345rs-2342');

        expect(results).toBe(false);
    });

    it('Should return false if the hash is not the expected hash', () => {
        const results = isGameDecline('ABCDE-D', 'FGHIJ');

        expect(results).toBe(false);
    });

    it('Should return false if the decline message contains any extra characters at the beginning', () => {
        const results = isGameDecline('1234ABCDE-D');

        expect(results).toBe(false);
    });

    it('Should return false if the decline message contains any extra characters at the beginning', () => {
        const results = isGameDecline('ABCDE-D,W', 'ABCDE');

        expect(results).toBe(false);
    });
});

describe("Tests the isGameOver function", () => {
    it('Should return true when the content is a game over and is an unknown hash', () => {
        const results = isGameOver('abcdp' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.GAME_OVER);

        expect(results).toBe(true);
    });

    it('Should return true when the content is a game over and is a known hash', () => {
        const results = isGameOver('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.GAME_OVER, 'ABCDE');

        expect(results).toBe(true);
    });

    it('Should return false when the content is not a game over', () => {
        const results = isGameOver('345rs' + MESSAGE.HASH_DELIMITER + '2342');

        expect(results).toBe(false);
    });

    it('Should return false if the hash is not the expected hash', () => {
        const results = isGameOver('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.GAME_OVER, 'FGHIJ');

        expect(results).toBe(false);
    });

    it('Should return false if the over message contains any extra characters at the beginning', () => {
        const results = isGameOver('1234ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.GAME_OVER);

        expect(results).toBe(false);
    });

    it('Should return false if the over message contains any extra characters at the beginning', () => {
        const results = isGameOver('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.GAME_OVER + ',', 'ABCDE');

        expect(results).toBe(false);
    });
});

describe("Tests the isGameEnd function", () => {
    it('Should return true when the content is a game end and is an unknown hash', () => {
        const results = isGameEnd('abcdp' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.END);

        expect(results).toBe(true);
    });

    it('Should return true when the content is a game end and is a known hash', () => {
        const results = isGameEnd('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.END, 'ABCDE');

        expect(results).toBe(true);
    });

    it('Should return false when the content is not a game end', () => {
        const results = isGameEnd('345rs' + MESSAGE.HASH_DELIMITER + '2342');

        expect(results).toBe(false);
    });

    it('Should return false if the hash is not the expected hash', () => {
        const results = isGameEnd('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.END, 'FGHIJ');

        expect(results).toBe(false);
    });

    it('Should return false if the end message contains any extra characters at the beginning', () => {
        const results = isGameEnd('1234ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.END);

        expect(results).toBe(false);
    });

    it('Should return false if the end message contains any extra characters at the beginning', () => {
        const results = isGameOver('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.END + ',', 'ABCDE');

        expect(results).toBe(false);
    });
});

describe("Tests the isGameMove function", () => {
    it('Should return true when the content is a starter game move and is an unknown hash', () => {
        const [moveNeg1, move0] = generateInitalMoves();

        const neg1Results = isGameMove('abcdp' + MESSAGE.HASH_DELIMITER + moveNeg1);
        const zeroResults = isGameMove('abcdp' + MESSAGE.HASH_DELIMITER + move0);

        expect(neg1Results).toBe(true);
        expect(zeroResults).toBe(true);
    });

    it('Should return true when the content is a starter game move and is a known hash', () => {
        const [moveNeg1, move0] = generateInitalMoves();

        const neg1Results = isGameMove('ABCDE' + MESSAGE.HASH_DELIMITER + moveNeg1, 'ABCDE');
        const zeroResults = isGameMove('ABCDE' + MESSAGE.HASH_DELIMITER + move0, 'ABCDE');

        expect(neg1Results).toBe(true);
        expect(zeroResults).toBe(true);
    });

    it('Should return false when the content is not a starter game move', () => {
        const results = isGameMove('Hello there');

        expect(results).toBe(false);
    });

    it('Should return false if the hash is not the expected hash', () => {
        const [moveNeg1, move0] = generateInitalMoves();

        const neg1Results = isGameMove('ABCDE' + MESSAGE.HASH_DELIMITER + moveNeg1, 'FGHIJ');
        const zeroResults = isGameMove('ABCDE' + MESSAGE.HASH_DELIMITER + move0, 'EDCBA');

        expect(neg1Results).toBe(false);
        expect(zeroResults).toBe(false);
    });

    it('Should return false if the move message contains any extra characters at the beginning', () => {
        const [moveNeg1, move0] = generateInitalMoves();

        const neg1Results = isGameMove('1234ABCDE' + MESSAGE.HASH_DELIMITER + moveNeg1);
        const zeroResults = isGameMove('asdfsadfasfd asdfa$# ABCDE' + MESSAGE.HASH_DELIMITER + move0);

        expect(neg1Results).toBe(false);
        expect(zeroResults).toBe(false);
    });

    it('Should return false if the move message contains any extra characters at the end', () => {
        const [moveNeg1, move0] = generateInitalMoves();

        const neg1Results = isGameMove('ABCDE' + MESSAGE.HASH_DELIMITER + moveNeg1 + '1234');
        const zeroResults = isGameMove('ABCDE' + MESSAGE.HASH_DELIMITER + move0 + 'asdfsadfasfd asdfa$#');

        expect(neg1Results).toBe(false);
        expect(zeroResults).toBe(false);
    });

    it('Should return false for all invalid move formats', () => {
        const invalidMoves = [
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,O,TTTT', // Invalid color
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,WB,TTTT', // More than 1 color provided
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTTT', // Invalid castling size
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,FFFQ', // Invalid castling character
            'QA1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // Invalid character transformation
            'A1b1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // Invalid column letter
            'A1B0C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // Invalid row number
        ]

        invalidMoves.forEach((move) => {
            const results = isGameMove('abcde' + MESSAGE.HASH_DELIMITER + move);

            expect(results).toBe(false);
        });
    })

    it('Should return true for all valid move formats', () => {
        const validMoves = [
            'A1B1C1D1E1F1G1H1QA2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // White pawn 1 transformed
            'A1B1C1D1E1F1G1H1A2NB2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // White pawn 2 transformed
            'A1B1C1D1E1F1G1H1A2B2RC2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // White pawn 3 transformed
            'A1B1C1D1E1F1G1H1A2B2C2BD2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // White pawn 4 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2QE2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // White pawn 5 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2NF2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,FTFT', // White pawn 6 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2RG2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // White pawn 7 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2BH2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,FFTT', // White pawn 8 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8QA7B7C7D7E7F7G7H7,W,TTTT', // Black pawn 1 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7NB7C7D7E7F7G7H7,W,TTTT', // Black pawn 2 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7RC7D7E7F7G7H7,W,TTTT', // Black pawn 3 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7BD7E7F7G7H7,W,TTTT', // Black pawn 4 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7QE7F7G7H7,W,TFTF', // Black pawn 5 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7NF7G7H7,W,TTTT', // Black pawn 6 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7RG7H7,W,TTTT', // Black pawn 7 transformed
            'A1B1C1D1E1F1G1H1A2B2C2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7BH7,B,TTTT', // Black pawn 8 transformed
            'A1B1C1D1E1F1G1H1QA2QB2NC2ND2RE2RF2BG2BH2A8B8C8D8E8F8G8H8BA7BB7RC7RD7QE7QF7NG7NH7,B,FFFF', // Multiple transformations
            'A1B1C1D1E1F1G1H1A2XXC2D2E2F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT', // Dead pawn
        ];

        validMoves.forEach((move) => {
            const results = isGameMove('abcde' + MESSAGE.HASH_DELIMITER + move);

            expect(results).toBe(true);
        });
    });
});

describe('Tests the loadGameHistory function', () => {
    it('Should find invitations without interference', () => {
        const messages = [
            createTestXMTPMessage('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.WHITE, '0x123'),
            createTestXMTPMessage('FGHIJ' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.WHITE, '0x456'),
        ];

        const results = loadGameHistory(messages, '0x123');

        expect(results.invite.hash).toBe('ABCDE');
        expect(results.invite.color).toBe(PIECE_COLORS.WHITE);
        expect(results.accept.hash).toBe('FGHIJ');
        expect(results.accept.color).toBe(PIECE_COLORS.BLACK);
    });

    it('Should reject invitations that have been declined', () => {
        const messages = [
            createTestXMTPMessage('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.WHITE, '0x123'),
            createTestXMTPMessage('FGHIJ' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.WHITE, '0x456'),
            createTestXMTPMessage('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.DECLINE, '0x456'),
        ];

        const results = loadGameHistory(messages, '0x123');

        expect(results.accept.hash).toBe('FGHIJ');
        expect(results.accept.color).toBe(PIECE_COLORS.BLACK);
        expect(results.invite).toBe(null);
    });

    it('Should reject invitations that have been rejected', () => {
        const messages = [
            createTestXMTPMessage('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.WHITE, '0x123'),
            createTestXMTPMessage('FGHIJ' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.WHITE, '0x456'),
            createTestXMTPMessage('FGHIJ' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.DECLINE, '0x123'),
        ];

        const results = loadGameHistory(messages, '0x123');

        expect(results.accept).toBe(null);
        expect(results.load).toBe(null);
        expect(results.invite).not.toBe(null);
        expect(results.invite.hash).toBe('ABCDE');
        expect(results.invite.color).toBe(PIECE_COLORS.WHITE);
    });

    it('Should reject all invitations if a game has started', () => {
        const messages = [
            createTestXMTPMessage('ABCDE' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.WHITE, '0x123'),
            createTestXMTPMessage('FGHIJ' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.WHITE, '0x456'),
            createTestXMTPMessage('KLMNO' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.BLACK, '0x456'),
            createTestXMTPMessage('KLMNO' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.ACCEPT + MESSAGE.GAME_DELIMITER + PIECE_COLORS.BLACK, '0x123'),
            createTestXMTPMessage('KLMNO' + MESSAGE.HASH_DELIMITER + createStarterMessage(), '0x456')
        ];

        const results = loadGameHistory(messages, '0x123');

        expect(results.accept).toBe(null);
        expect(results.invite).toBe(null);
    });

    it('Should keep note of invalid hashes and reject them', () => {
        const messages = [
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8F8G8H8A6B7C7D5F4F7G7H7,W,TTTT",
                "senderAddress": "0x1234",
            },
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT",
                "senderAddress": "0x5678",
            },
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C4D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,W,TTTT",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-I,W",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-A,W",
                "senderAddress": "0x1234",
            },
        ]

        const results = loadGameHistory(messages, '0x1234');

        expect(results.invite).toBe(null);
        expect(results.accept).toBe(null);
    })

    it('Should not recognize own invites as accepts', () => {
        const messages = [
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT",
                "senderAddress": "0x5678",
            },
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C4D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,W,TTTT",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-I,W",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-A,W",
                "senderAddress": "0x1234",
            },
            {
                "content": "2sDJW-I,B",
                "senderAddress": "0x1234",
            }
        ]

        const results = loadGameHistory(messages, '0x1234');

        expect(results.invite.hash).toBe('2sDJW');
        expect(results.invite.color).toBe(PIECE_COLORS.BLACK);
        expect(results.accept).toBe(null);
    });

    it('Should recognize an accepted game and intialize the moves', () => {
        const messages = [
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT",
                "senderAddress": "0x5678",
            },
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C4D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,W,TTTT",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-I,B",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-A,W",
                "senderAddress": "0x5678",
            },
            {
                "content": "2sDJW-I,B",
                "senderAddress": "0x1234",
            }
        ];

        const results = loadGameHistory(messages, '0x1234');

        expect(results.invite).not.toBe(null);
        expect(results.invite.hash).toBe('2sDJW');
        expect(results.invite.color).toBe(PIECE_COLORS.BLACK);
        expect(results.accept).toBe(null);
        expect(results.load).not.toBe(null);
        expect(results.load.hash).toBe('dYNsw');
        expect(results.load.color).toBe(PIECE_COLORS.BLACK);
        expect(results.load.lastMove).toBe(moveNeg1);
        expect(results.load.currMove).toBe(move0);
    });

    it('Should recognize that a player accepted their own invite and should not allow a new game to load', () => {
        const messages = [
            {
                "content": "abcde-I,B",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-I,W",
                "senderAddress": "0x5678",
            },
            {
                "content": "dYNsw-A,B",
                "senderAddress": "0x5678",
            },
            {
                "content": "2sDJW-I,B",
                "senderAddress": "0x1234",
            },
        ];

        const results = loadGameHistory(messages, '0x1234');

        expect(results.invite).not.toBe(null);
        expect(results.invite.hash).toBe('2sDJW');
        expect(results.invite.color).toBe(PIECE_COLORS.BLACK);
        expect(results.accept).toBe(null);
        expect(results.load).toBe(null);
    });

    it('Should recognize that a player accepted their own invite and should not allow a new game to load', () => {
        const messages = [
            {
                "content": "abcde-I,B",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-I,W",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-A,W",
                "senderAddress": "0x5678",
            },
            {
                "content": "2sDJW-I,B",
                "senderAddress": "0x5678",
            }
        ];

        const results = loadGameHistory(messages, '0x1234');

        expect(results.accept).not.toBe(null);
        expect(results.accept.hash).toBe('2sDJW');
        expect(results.accept.color).toBe(PIECE_COLORS.WHITE);
        expect(results.invite).toBe(null);
        expect(results.load).toBe(null);
    });

    it('Should not allow a loaded game with no accept', () => {
        const messages = [
            {
                "content": "abcde-I,B",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-I,W",
                "senderAddress": "0x1234",
            },
            {
                "content": "2sDJW-I,B",
                "senderAddress": "0x5678",
            },
            {
                "content": "dYNsw-A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT",
                "senderAddress": "0x5678",
            }
        ];

        const results = loadGameHistory(messages, '0x1234');

        expect(results.accept).toBe(null);
        expect(results.invite).toBe(null);
        expect(results.load).toBe(null);
    })

    it('Should load a game that only have one move made', () => {
        const messages = [
            {
                "content": "dYNsw-I,B",
                "senderAddress": "0x1234",
            },
            {
                "content": "dYNsw-A,W",
                "senderAddress": "0x5678",
            },
            {
                "content": "dYNsw-A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT",
                "senderAddress": "0x1234",
            },
            {
                "content": "2sDJW-I,W",
                "senderAddress": "0x1234",
            },
            {
                "content": "abcde-I,B",
                "senderAddress": "0x5678",
            }
        ];

        const results = loadGameHistory(messages, '0x1234');

        expect(results.invite).not.toBe(null);
        expect(results.invite.hash).toBe('2sDJW');
        expect(results.invite.color).toBe(PIECE_COLORS.WHITE);
        expect(results.accept).not.toBe(null);
        expect(results.accept.hash).toBe('abcde');
        expect(results.accept.color).toBe(PIECE_COLORS.WHITE);
        expect(results.load).not.toBe(null);
        expect(results.load.hash).toBe('dYNsw');
        expect(results.load.color).toBe(PIECE_COLORS.BLACK);
        expect(results.load.lastMove).toBe(move0);
        expect(results.load.currMove).toBe('A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT');
    });

    it('Should load a game that has multiple moves made', () => {
        const messages = [
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT",
                "senderAddress": "0x5678",
            },
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C4D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,W,TTTT",
                "senderAddress": "0x1234",
            },
        ];

        const results = loadGameHistory(messages, '0x1234');

        expect(results.invite).toBe(null);
        expect(results.accept).toBe(null);
        expect(results.load).not.toBe(null);
        expect(results.load.hash).toBe('oPVKq');
        expect(results.load.color).toBe(PIECE_COLORS.WHITE);
        expect(results.load.lastMove).toBe('A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT');
        expect(results.load.currMove).toBe('A1B1C1D1E1F1XXG1A2B2C4D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,W,TTTT');
    });

    it('Should load a game that has multiple moves made only if the right colors are assigned to players', () => {
        const messages = [
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT",
                "senderAddress": "0x1234",
            },
            {
                "content": "oPVKq-A1B1C1D1E1F1XXG1A2B2C4D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,W,TTTT",
                "senderAddress": "0x5678",
            },
        ];

        const results = loadGameHistory(messages, '0x1234');

        expect(results.invite).toBe(null);
        expect(results.accept).toBe(null);
        expect(results.load).not.toBe(null);
        expect(results.load.hash).toBe('oPVKq');
        expect(results.load.color).toBe(PIECE_COLORS.BLACK);
        expect(results.load.lastMove).toBe('A1B1C1D1E1F1XXG1A2B2C3D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,B,TTTT');
        expect(results.load.currMove).toBe('A1B1C1D1E1F1XXG1A2B2C4D2E2F3G2H2A8B8C8D8E8A3G8H8A6B7C7D5F4F7G7H7,W,TTTT');
    });

    it('Should properly strip the contents from the message', () => {
        const messages = [
            {
                "content": "6Kiiy-I,W",
                "senderAddress": "0x96168230dF7D287d0EE2fb83DcC58323c28d9814",
            },
            {
                "content": "Hello",
                "senderAddress": "0x4C3DD6B4cCc257844E3e55482F6cCa328809c39F",
            },
            {
                "content": "Hello",
                "senderAddress": "0x4C3DD6B4cCc257844E3e55482F6cCa328809c39F",
            },
            {
                "content": "A",
                "senderAddress": "0x4C3DD6B4cCc257844E3e55482F6cCa328809c39F",
            },
            {
                "content": "B",
                "senderAddress": "0x4C3DD6B4cCc257844E3e55482F6cCa328809c39F",
            },
            {
                "content": "C",
                "senderAddress": "0x4C3DD6B4cCc257844E3e55482F6cCa328809c39F",
            },
            {
                "content": "D",
                "senderAddress": "0x4C3DD6B4cCc257844E3e55482F6cCa328809c39F",
            },
            {
                "content": "E",
                "senderAddress": "0x4C3DD6B4cCc257844E3e55482F6cCa328809c39F",
            }
        ];

        const results = loadGameHistory(messages, '0x96168230dF7D287d0EE2fb83DcC58323c28d9814');

        expect(results.invite).not.toBe(null);
        expect(results.invite.hash).toBe('6Kiiy');
        expect(results.invite.color).toBe(PIECE_COLORS.WHITE);
        expect(results.accept).toBe(null);
        expect(results.load).toBe(null);
    });

    it('Should find a game that just started', () => {
        const messages = [
            {
                "content": "SrDlT-A,B",
                "senderAddress": "0x5678",
            },
            {
                "content": "SrDlT-A1B1C1D1E1F1G1H1A2B2C2D2E2F4G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,W,TTTT",
                "senderAddress": "0x1234",
            },
            {
                "content": "SrDlT-A1B1C1D1E1F1G1H1A2B2C2D2E2F4G2H2A8C6C8D8E8F8G8H8A7B7C7D7E7F7G7H7,B,TTTT",
                "senderAddress": "0x5678",
            },
            {
                "content": "swEix-I,W",
                "senderAddress": "0x1234",
            },
            {
                "content": "swEix-A,B",
                "senderAddress": "0x5678",
            },
            {
                "content": "swEix-A1B1C1D1E1F1G1H1A2B2C2D2E4F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,W,TTTT",
                "senderAddress": "0x1234",
            }
        ]

        const results = loadGameHistory(messages, '0x1234');

        expect(results.accept).toBe(null);
        expect(results.invite).toBe(null);
        expect(results.load).not.toBe(null);
        expect(results.load.color).toBe(PIECE_COLORS.WHITE);
        expect(results.load.currMove).toBe('A1B1C1D1E1F1G1H1A2B2C2D2E4F2G2H2A8B8C8D8E8F8G8H8A7B7C7D7E7F7G7H7,W,TTTT');
        expect(results.load.lastMove).toBe(move0)
        expect(results.load.hash).toBe('swEix')
    });
});
