import { CAPTURED_PIECE, CONNECT_STATUS, DEV_MODE, MESSAGE, PIECE_COLORS, PIECE_MESSAGE_ORDER, PIECE_VALUES } from "../enum";
import { generateInitalMoves } from "../game/message";
import { getEnemyColor, isPawn } from "../game/piece";

export const isHashContent = (content, hash) => {
    return content.startsWith(hash + MESSAGE.HASH_DELIMITER);
}

export const hasHash = (content) => {
    const hash = content.split(MESSAGE.HASH_DELIMITER)[0];

    return hash?.length === MESSAGE.HASH_LENGTH && hash.match(/^[a-zA-Z0-9]{5}/) !== null;
}

export const getHash = (content) => {
    return content.split(MESSAGE.HASH_DELIMITER)[0];
}

export const getContent = (content) => {
    return content.split(MESSAGE.HASH_DELIMITER)[1];
}

export const filterMessages = (messages, hash) => {
    // TODO: Sort game messages by sentAt, only use most recent 2
    const gameMessages = [];
    const convoMessages = [];

    messages.forEach(message => {
        if (!message.content) {
            return;
        }

        if (isHashContent(message.content, hash)) {
            gameMessages.push(message);

            if (DEV_MODE) {
                convoMessages.push(message);
            }
        } else if (!hasHash(message.content)) {
            convoMessages.push(message);
        }
    });

    return { gameMessages, convoMessages };
}

export const createGameMessage = (hash, ...content) => {
    return hash + MESSAGE.HASH_DELIMITER + content.join(MESSAGE.GAME_DELIMITER);
}

export const generateHash = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = '';
    for (let i = 0; i < MESSAGE.HASH_LENGTH; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
}

export const isGameContent = (content) => {
    const data = getContent(content);

    if (!data) return false;

    const components = data.split(MESSAGE.GAME_DELIMITER);

    // Should be 64-80 characters long, made up of characters A-H, 1-8, or KQRBNPX
    const boardPattern = /^([A-H1-8KQRBNPX]{64,80})$/;

    // Should be 1 character long, made up of characters W or B
    const playerPattern = /^[WB]$/;

    // Should be 1 character long, made up of characters T or F
    const canCastlePattern = /^[TF]{4}$/;

    return components.length === 3 &&
        components[0].match(boardPattern) !== null &&
        components[1].match(playerPattern) !== null &&
        components[2].match(canCastlePattern) !== null;
}

export const isConnectStatus = (content) => {
    const data = getContent(content);
    const [connectStatus] = data?.split(MESSAGE.GAME_DELIMITER);

    return connectStatus && Object.values(CONNECT_STATUS).includes(connectStatus);
}

export const findMostRecentGameMessages = (messages, hash) => {
    const gameMessages = [];
    console.log(messages)

    for (let i = messages.length - 1; i >= 0; i--) {
        if (!messages[i].content) {
            continue;
        }

        if (gameMessages.length === 2) {
            break;
        } else if (isHashContent(messages[i].content, hash) && isGameContent(messages[i].content)) {
            const gameContent = getContent(messages[i].content);
            gameMessages.unshift(gameContent);
        }
    }

    return gameMessages;
}

/**
 * Checks if the content is a game invite. The content is considered a game invite if it
 * matches the following pattern:
 * Should build a regex out of a string that works as follows:
 * The hash is either the hash provided, or any 5 alphanumeric characters, followed
 * by the hash delimiter, followed by the invite status, followed by the game delimiter,
 * followed by either W or B
 * 
 * @param {String} content The content to check
 * @param {String?} hash The specific hash to check. If not provided, will check for
 * the hash pattern in the content
 * @returns {Boolean} Whether the content is a game invite
 */
export const isGameInvite = (content, hash) => {
    const hashPattern = hash ? hash : `[a-zA-Z0-9]{${MESSAGE.HASH_LENGTH}}`;
    const colorPattern = `${PIECE_COLORS.WHITE}|${PIECE_COLORS.BLACK}`;
    const invitePattern = `^(${hashPattern})${MESSAGE.HASH_DELIMITER}${CONNECT_STATUS.INVITE}${MESSAGE.GAME_DELIMITER}[${colorPattern}]$`;

    return content.match(invitePattern) !== null;
}

/**
 * Checks if the content is a game accept. The content is considered a game accept if it
 * matches the following pattern:
 * Should build a regex out of a string that works as follows:
 * The hash is either the hash provided, or any 5 alphanumeric characters, followed
 * by the hash delimiter, followed by the accept status, followed by the game delimiter,
 * followed by either W or B
 * 
 * @param {String} content The content to check
 * @param {String?} hash The specific hash to check. If not provided, will check for
 * the hash pattern in the content
 * @returns {Boolean} Whether the content is a game invite
 */
export const isGameAccept = (content, hash) => {
    const hashPattern = hash ? hash : `[a-zA-Z0-9]{${MESSAGE.HASH_LENGTH}}`;
    const colorPattern = `${PIECE_COLORS.WHITE}|${PIECE_COLORS.BLACK}`;
    const invitePattern = `^(${hashPattern})${MESSAGE.HASH_DELIMITER}${CONNECT_STATUS.ACCEPT}${MESSAGE.GAME_DELIMITER}[${colorPattern}]$`;

    return content.match(invitePattern) !== null;
};

/**
 * Checks if the content is a game decline. The content is considered a game decline if it
 * matches the following pattern:
 * Should build a regex out of a string that works as follows:
 * The hash is either the hash provided, or any 5 alphanumeric characters, followed
 * by the hash delimiter, followed by the decline status
 * 
 * @param {String} content The content to check
 * @param {String?} hash The specific hash to check. If not provided, will check for
 * the hash pattern in the content
 * @returns {Boolean} Whether the content is a game invite
 */
export const isGameDecline = (content, hash) => {
    const hashPattern = hash ? hash : `[a-zA-Z0-9]{${MESSAGE.HASH_LENGTH}}`;
    const invitePattern = `^(${hashPattern})${MESSAGE.HASH_DELIMITER}${CONNECT_STATUS.DECLINE}$`;

    return content.match(invitePattern) !== null;
};

/**
 * Checks if the content is a game end. The content is considered a game end if it
 * matches the following pattern:
 * Should build a regex out of a string that works as follows:
 * The hash is either the hash provided, or any 5 alphanumeric characters, followed
 * by the hash delimiter, followed by the end status
 * 
 * @param {String} content The content to check
 * @param {String?} hash The specific hash to check. If not provided, will check for
 * the hash pattern in the content
 * @returns {Boolean} Whether the content is a game invite
 */
export const isGameEnd = (content, hash) => {
    const hashPattern = hash ? hash : `[a-zA-Z0-9]{${MESSAGE.HASH_LENGTH}}`;
    const invitePattern = `^(${hashPattern})${MESSAGE.HASH_DELIMITER}${CONNECT_STATUS.END}$`;

    return content.match(invitePattern) !== null;
};

/**
 * Checks if the content is a game over. The content is considered a game over if it
 * matches the following pattern:
 * Should build a regex out of a string that works as follows:
 * The hash is either the hash provided, or any 5 alphanumeric characters, followed
 * by the hash delimiter, followed by the over status
 * 
 * @param {String} content The content to check
 * @param {String?} hash The specific hash to check. If not provided, will check for
 * the hash pattern in the content
 * @returns {Boolean} Whether the content is a game invite
 */
export const isGameOver = (content, hash) => {
    const hashPattern = hash ? hash : `[a-zA-Z0-9]{${MESSAGE.HASH_LENGTH}}`;
    const invitePattern = `^(${hashPattern})${MESSAGE.HASH_DELIMITER}${CONNECT_STATUS.GAME_OVER}$`;

    return content.match(invitePattern) !== null;
};

export const isGameMove = (content, hash) => {
    const hashPattern = hash ? hash : `[a-zA-Z0-9]{${MESSAGE.HASH_LENGTH}}`;
    const transformedPawnPattern = `[${PIECE_VALUES.BISHOP}${PIECE_VALUES.KNIGHT}${PIECE_VALUES.ROOK}${PIECE_VALUES.QUEEN}]`;
    const rowPattern = `[1-8]`;
    const colPattern = `[A-H]`;
    const colorPattern = `${PIECE_COLORS.WHITE}|${PIECE_COLORS.BLACK}`;
    const castlingPattern = `[${MESSAGE.TRUE}${MESSAGE.FALSE}]{4}`;

    const boardPattern = PIECE_MESSAGE_ORDER.reduce((acc, piece) => {
        // If the piece is a pawn, the pattern is that it could first start with a transformed character
        // and then a row and column OR the string XX. If it's not a pawn, it's just a row and column  OR the string XX
        if (isPawn(piece)) {
            return acc + `(${transformedPawnPattern}?${colPattern}${rowPattern}|${CAPTURED_PIECE})`;
        }

        // If the piece is not a pawn, it's just a row and column OR the string XX
        return acc + `(${colPattern}${rowPattern}|${CAPTURED_PIECE})`;
    }, '');

    const gamePattern = `^(${hashPattern})${MESSAGE.HASH_DELIMITER}(${boardPattern})${MESSAGE.GAME_DELIMITER}(${colorPattern})${MESSAGE.GAME_DELIMITER}(${castlingPattern})$`;

    return content.match(gamePattern) !== null;
}

/**
 * Searches through history of messages to find the most recent game history
 * Under the assumption that the last message is the most recent. The logic is as follows:
 * Search for the most recent invite, accept and existing game. A game counts as existing if
 * it has at least an invite and accept, and any number of moves. Only one game can exist at a
 * time, and an existing game removes all existing invites and accepts that came before it.
 * Invites from both players are only valid if they come before an accepted game, and have not
 * recieved a response. Any invalid invites and games should be ignored, such as if both most
 * recent game moves are from the same player, or any status message is sent to an invite
 * 
 * @param {import('@xmtp/react-sdk').Message[]} messages The histor of messages to search through
 * @param {String} playerAddr The address of the player
 * @returns {{
 *  invite?: {
 *      hash: String,
 *      color: String
 *  },
 *  accept?: {
 *      hash: String,
 *      color: String
 *  },
 *  load?: {
 *      lastMove: String,
 *      currMove: String,
 *      hash: String,
 *      color: String
 *  }
 * }} The most recent game history, with the most recent invite from the player, the most recent 
 * invite from the opponent, and the most recent game found. If no history is found, the value will
 * be null.
 */
export const loadGameHistory = (messages, playerAddr) => {
    const data = {
        invite: {
            hash: null,
            color: undefined,
        },
        accept: {
            hash: null,
            color: undefined,
        },
        load: {
            lastMove: null,
            currMove: null,
            playerWent: null,
            hash: null,
            color: undefined,
        }
    }

    const searching = {
        invite: true,
        accept: true,
        load: true,
    }

    const invalidHashes = [];

    for (let i = messages.length - 1; i >= 0; i--) {
        if (Object.values(searching).every(val => !val)) {
            break;
        }

        const { content, senderAddress } = messages[i];
        const playerMessage = senderAddress === playerAddr;

        if (!content) {
            continue;
        }

        if (!hasHash(content)) {
            continue;
        }

        const hash = getHash(content);

        if (isGameMove(content)) {
            const gameContent = getContent(content);
            searching.invite = false;
            searching.accept = false;
            if (searching.load) {
                if (data.load.hash === hash && data.load.playerWent !== playerMessage) {
                    const determinedColor = gameContent.split(MESSAGE.GAME_DELIMITER)[1];
                    if ((playerMessage && determinedColor === data.load.color) || (!playerMessage && determinedColor === getEnemyColor(data.load.color))) {
                        data.load.lastMove = gameContent;
                        searching.load = false;
                    } else {
                        invalidHashes.push(hash);
                        searching.load = false;
                    }
                } else if (data.load.hash === null) {
                    const color = gameContent.split(MESSAGE.GAME_DELIMITER)[1];
                    data.load.hash = hash;
                    data.load.currMove = gameContent;
                    data.load.playerWent = playerMessage;
                    data.load.color = playerMessage ? color : getEnemyColor(color);
                } else {
                    searching.load = false;
                }
            }

            continue;
        } else if (isGameInvite(content)) {
            const gameContent = getContent(content);
            if (playerMessage && searching.invite && !invalidHashes.includes(hash)) {
                data.invite.hash = hash;
                data.invite.color = gameContent.split(MESSAGE.GAME_DELIMITER)[1];
                searching.invite = false;
            } else if (!playerMessage && searching.accept && !invalidHashes.includes(hash)) {
                data.accept.hash = hash;
                data.accept.color = getEnemyColor(gameContent.split(MESSAGE.GAME_DELIMITER)[1]);
                searching.accept = false;
            } else if (searching.load && data.load.hash === hash && !invalidHashes.includes(hash)) {
                if (playerMessage !== data.load.playerWent && data.load.currMove.startsWith(CONNECT_STATUS.ACCEPT + MESSAGE.GAME_DELIMITER)) {
                    const determinedColor = gameContent.split(MESSAGE.GAME_DELIMITER)[1];
                    if ((playerMessage && determinedColor === data.load.color) || (!playerMessage && determinedColor !== getEnemyColor(data.load.color))) {
                        data.load.lastMove = gameContent;
                        searching.load = false;
                    } else {
                        invalidHashes.push(hash);
                        searching.load = false;
                    }
                } else {
                    searching.load = false;
                    invalidHashes.push(hash);
                }
            }
        } else {
            if (isGameAccept(content) && searching.load) {
                const gameContent = getContent(content);
                if (data.load.hash === hash) {
                    const determinedColor = gameContent.split(MESSAGE.GAME_DELIMITER)[1];
                    if ((playerMessage && determinedColor === data.load.color) || (!playerMessage && determinedColor === getEnemyColor(data.load.color))) {
                        data.load.lastMove = gameContent;
                        searching.load = false;
                    } else {
                        invalidHashes.push(hash);
                        searching.load = false;
                    }
                } else if (data.load.hash === null) {
                    data.load.currMove = gameContent;
                    data.load.hash = hash;
                    data.load.hash = hash;
                    data.load.playerWent = playerMessage;
                    data.load.color = playerMessage ? gameContent.split(MESSAGE.GAME_DELIMITER)[1] : getEnemyColor(gameContent.split(MESSAGE.GAME_DELIMITER)[1]);
                }

                searching.accept = false;
                searching.invite = false;
            } else if (isGameDecline(content)) {
                if (playerMessage && searching.accept) {
                    invalidHashes.push(hash);
                    searching.accept = false;
                } else if (!playerMessage && searching.invite) {
                    invalidHashes.push(hash);
                    searching.invite = false;
                }
            } else if (isGameEnd(content) || isGameOver(content)) {
                searching.accept = false;
                searching.invite = false;
                searching.load = false;
            }
        }
    }

    const [moveNeg1, move0] = generateInitalMoves();

    if (data.load.lastMove && data.load.currMove) {
        const { hash: loadHash } = data.load;
        if (!isGameContent(loadHash + MESSAGE.HASH_DELIMITER + data.load.lastMove) && !isGameContent(loadHash + MESSAGE.HASH_DELIMITER + data.load.currMove)) {
            data.load.lastMove = moveNeg1;
            data.load.currMove = move0;
        } else if (!isGameContent(loadHash + MESSAGE.HASH_DELIMITER + data.load.lastMove) && isGameContent(loadHash + MESSAGE.HASH_DELIMITER + data.load.currMove)) {
            data.load.lastMove = move0;
        }

        delete data.load.playerWent;
    } else {
        data.load.lastMove = null;
        data.load.currMove = null;
        data.load.hash = null;
    }
    delete data.load.playerWent;

    if (!data.invite.hash) {
        data.invite = null;
    }
    if (!data.accept.hash) {
        data.accept = null;
    }
    if (!data.load.hash) {
        data.load = null;
    }

    return data;
};
