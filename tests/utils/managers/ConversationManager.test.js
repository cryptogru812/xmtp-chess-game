import { jest } from '@jest/globals';

import ConversationManager from "../../../src/utils/managers/ConversationManager";
import { CONNECT_STATUS, MESSAGE, PIECE_COLORS } from '../../../src/utils/enum';

const generateConstructorParams = () => {
    const invite = {};
    const accept = {};
    const load = null;
    const playerAddr = '0x0';

    return [invite, accept, load, playerAddr];
};

const mockSetInviteFn = jest.fn();
const mockSetAcceptFn = jest.fn();
const mockSetSendDataFn = jest.fn();

const mockSets = {
    setInvite: mockSetInviteFn,
    setAccept: mockSetAcceptFn,
    setSendData: mockSetSendDataFn
};

describe('Tests the sendInvite method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should send an invite if one has not been sent', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        const manager = new ConversationManager({ hash: null }, accept, load, playerAddr);

        manager.sendInvite(mockSets);

        expect(mockSetInviteFn).toHaveBeenCalledTimes(1);
        expect(mockSetInviteFn).toHaveBeenCalledWith({ hash: expect.any(String), color: expect.any(String), accepted: false });
        expect(mockSetSendDataFn).toHaveBeenCalledTimes(1);
        expect(mockSetSendDataFn).toHaveBeenCalledWith(expect.any(String));
        expect(mockSetSendDataFn.mock.calls[0][0]).toMatch(/^[a-zA-Z0-9]{5}-I,[WB]$/);
    });

    it('Should not send an invite if one was already sent', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        invite.hash = 'abcde';
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        manager.sendInvite(mockSets);
        manager.sendInvite(mockSets);

        expect(mockSetInviteFn).toHaveBeenCalledTimes(0);
        expect(mockSetSendDataFn).toHaveBeenCalledTimes(0);
    });
});

describe('Tests isInviteMessage method', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should return false if the invite hash has not been set', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            content: 'abcde'
        };

        expect(manager.isInviteMessage(message)).toBe(false);
    });

    it('Should return false if the message content does not match the invite hash', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        invite.hash = 'abcde';
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            content: 'fghij' + MESSAGE.HASH_DELIMITER + 'I' + MESSAGE.GAME_DELIMITER + 'W'
        };

        expect(manager.isInviteMessage(message)).toBe(false);
    });

    it('Should return true if the message content matches the invite hash', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        invite.hash = 'abcde';
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            content: 'abcde' + MESSAGE.HASH_DELIMITER + 'I' + MESSAGE.GAME_DELIMITER + 'W'
        };

        expect(manager.isInviteMessage(message)).toBe(true);
    });
});

describe('Tests isAcceptMessage method', () => {
    it('Should return false if the accept hash has been set and the message content does not match the hash', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        accept.hash = 'abcde';
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            content: 'abcdf' + MESSAGE.HASH_DELIMITER + 'I' + MESSAGE.GAME_DELIMITER + 'W'
        };

        expect(manager.isAcceptMessage(message)).toBe(false);
    });

    it('Should return true if the accept hash has been set and the message content matches the hash', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        accept.hash = 'abcde';
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            content: 'abcde' + MESSAGE.HASH_DELIMITER + 'I' + MESSAGE.GAME_DELIMITER + 'W'
        };

        expect(manager.isAcceptMessage(message)).toBe(true);
    });

    it('Should return true if the accept hash has not been set and the message content matches the hash pattern', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            content: 'AVSEt' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.WHITE
        };

        expect(manager.isAcceptMessage(message)).toBe(true);
    });

    it('Should return true if the accept hash has not been set and the message content matches the hash pattern', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            content: '12345' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.BLACK
        };

        expect(manager.isAcceptMessage(message)).toBe(true);
    });

    it('Should return false if the accept hash has not been set and the message content does not match the hash pattern', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            content: '12345' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + 'X'
        };

        expect(manager.isAcceptMessage(message)).toBe(false);
    });

    it('Should return false if the accept hash has not been set and there is no hash delimiter', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            content: '12345' + CONNECT_STATUS.INVITE + MESSAGE.GAME_DELIMITER + PIECE_COLORS.BLACK
        };

        expect(manager.isAcceptMessage(message)).toBe(false);
    });
});

describe('Tests updateInviteStatus method', () => {
    it('Should do nothing if the message is from the player', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            senderAddress: playerAddr,
            content: 'abcde' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.ACCEPT + MESSAGE.GAME_DELIMITER + PIECE_COLORS.BLACK
        };

        manager.updateInviteStatus(message, mockSets);

        expect(mockSetInviteFn).toHaveBeenCalledTimes(0);
    });

    it('Should do nothing if the invite hash has not been set', () => {
        const [invite, accept, load, playerAddr] = generateConstructorParams();
        const manager = new ConversationManager(invite, accept, load, playerAddr);

        const message = {
            senderAddress: '0x1',
            content: 'abcde' + MESSAGE.HASH_DELIMITER + CONNECT_STATUS.ACCEPT + MESSAGE.GAME_DELIMITER + PIECE_COLORS.BLACK
        };

        manager.updateInviteStatus(message, mockSets);

        expect(mockSetInviteFn).toHaveBeenCalledTimes(0);
    });
});