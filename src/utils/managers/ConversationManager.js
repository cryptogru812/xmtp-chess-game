import { CONNECT_STATUS, MESSAGE, PIECE_COLORS } from "../enum";
import { getEnemyColor } from "../game/piece";
import { createGameMessage, generateHash, getContent, getHash, isGameInvite, isGameMove, isHashContent } from "../message/message";

class ConversationManager {
    /**
     * The constructor for the ConversationManager class
     * 
     * @param {{
     *  hash?: String,
     *  accepted: Boolean,
     *  color?: String,
     * }} invite The invite option data for starting a game
     * @param {{
     *  hash?: String,
     *  accepted: Boolean,
     *  color?: String,
     * }} accept The accept option data for starting a game
     * @param {{
     *  hash: String,
     *  color: String,
     *  lastMove: String,
     *  currMove: String,
     * }?} load The load option data for starting a game
     * @param {String} playerAddr The address of the player
     */
    constructor(invite, accept, load, playerAddr) {
        this.invite = invite;
        this.accept = accept;
        this.load = load;
        this.playerAddr = playerAddr;
    }

    /**
     * Gets a random color for the game
     * 
     * @private
     * @returns {PIECE_COLORS[keyof PIECE_COLORS]} The random color for the game
     */
    getRandomColor() {
        const number = Math.random();

        return number < 0.5 ? PIECE_COLORS.WHITE : PIECE_COLORS.BLACK;
    }

    /**
     * Sends an invite to the opponent if one has not been sent already
     * 
     * @param {{
     *   setInvite: Function,
     *   setSendData: Function,
     * }} sets The object containing the functions to set the invite and send data
     */
    sendInvite(sets) {
        if (this.invite.hash == null) {
            const hash = generateHash();
            const color = this.getRandomColor();

            this.invite.hash = hash;
            this.invite.color = color;
            sets.setInvite({ accepted: false, hash, color });
            sets.setSendData(createGameMessage(hash, CONNECT_STATUS.INVITE, color));
        }
    }

    /**
     * Determines if the message is an invite message. Can only be an invite message
     * if the invite hash is set and the message content contains the invite hash
     * 
     * @private
     * @param {import('@xmtp/react-sdk').MessageV2} message The message to check
     * @returns {Boolean} If the message is an invite message
     */
    isInviteMessage(message) {
        if (this.invite.hash) {
            return isHashContent(message.content, this.invite.hash);
        }

        return false;
    }

    /**
     * Determines if the message is an accept message. Can be an accept message if
     * the accept hash is set and the message content contains the accept hash or
     * if the message content is a game invite from the opponent
     * 
     * @private
     * @param {import('@xmtp/react-sdk').MessageV2} message The message to check
     * @returns {Boolean} If the message is an accept message
     */
    isAcceptMessage(message) {
        if (this.accept.hash) {
            return isHashContent(message.content, this.accept.hash);
        }

        return isGameInvite(message.content);
    }

    /**
     * Updates the invite status based on the message content
     * 
     * @private
     * @param {import('@xmtp/react-sdk').MessageV2} message The message to update the invite status with
     * @param {{
     *   setInvite: Function,
     * }} sets The object containing the functions to set the invite, send data, accept, and load
     */
    updateInviteStatus(message, sets) {
        const isOpponentMsg = message.senderAddress !== this.playerAddr;

        if (this.invite.hash && isOpponentMsg) {
            const content = getContent(message.content);
            const [connectStatus, opponentColor] = content.split(MESSAGE.GAME_DELIMITER);

            // If the opponent accepts the invite and the opponent color is not the same as the invite color
            // then the invite is accepted, otherwise the invite is declined and the invite hash is reset
            if (connectStatus === CONNECT_STATUS.ACCEPT && opponentColor !== this.invite.color) {
                this.invite.accepted = true;
                sets.setInvite({ ...this.invite, accepted: true });
            } else {
                this.invite.color = undefined;
                this.invite.hash = undefined;
                this.invite.accepted = false;
                sets.setInvite({ accepted: false, hash: undefined, color: undefined });
            }
        }
    }

    /**
     * Updates the accept status based on the message content
     * 
     * @private
     * @param {import('@xmtp/react-sdk').MessageV2} message The message to update the accept status with
     * @param {{
     *   setAccept: Function,
     * }} sets The object containing the functions to set the accept, send data, accept, and load
     */
    updateAcceptStatus(message, sets) {
        const isOpponentMsg = message.senderAddress !== this.playerAddr;

        // Only update the accept status if the accept hash is not set and the message is from the opponent
        if (!this.accept.hash && isOpponentMsg) {
            // Update the accept status if the message is a game invite otherwise reset the accept status
            if (isGameInvite(message.content)) {
                const content = getContent(message.content);
                const [connectStatus, opponentColor] = content.split(MESSAGE.GAME_DELIMITER);
                const hash = getHash(message.content);
                const color = getEnemyColor(opponentColor);

                this.accept.hash = hash;
                this.accept.color = color;
                sets.setAccept({ accepted: false, hash, color });
            } else {
                this.accept.color = undefined;
                this.accept.hash = undefined;
                this.accept.accepted = false;
                sets.setAccept({ accepted: false, hash: undefined, color: undefined });
            }
        }
    }

    /**
     * Sends an accept to the opponent's invite
     * 
     * @param {{
     *   setAccept: Function,
     *   setSendData: Function,
     * }} sets The object containing the functions to set the accept and send data
     */
    sendAccept(sets) {
        if (!this.accept.accepted || !this.accept.hash) {
            this.accept.accepted = true;
            sets.setAccept({ ...this.accept, accepted: true });
            sets.setSendData(createGameMessage(this.accept.hash, CONNECT_STATUS.ACCEPT, this.accept.color));
        }
    }

    /**
     * Sends a decline to the opponent's invite
     * 
     * @param {{
     *   setAccept: Function,
     *   setSendData: Function,
     * }} sets The object containing the functions to set the accept and send data
     */
    sendDecline(sets) {
        if (this.accept.hash) {
            sets.setSendData(createGameMessage(this.accept.hash, CONNECT_STATUS.DECLINE));
            this.accept.color = undefined;
            this.accept.hash = undefined;
            this.accept.accepted = false;
            sets.setAccept({ accepted: false, hash: undefined, color: undefined });
        }
    }

    /**
     * Determines if the message is a game message.
     * 
     * @private
     * @param {import('@xmtp/react-sdk').MessageV2} message The message to check
     * @returns {Boolean} If the message is a game message
     */
    isGameMessage(message) {
        return this.load && isGameMove(message.content, this.load.hash);
    }

    /**
     * Updates the load status based on the message content. Only works if a loaded game
     * was already found. Used to update a loaded game as moves are made in app
     * 
     * @private
     * @param {import('@xmtp/react-sdk').MessageV2} message The message to update the load status with
     * @param {{
     *   setLoad: Function,
     * }} sets The object containing the functions to set the load
     */
    updateLoadStatus(message, sets) {
        const contents = getContent(message.content);
        const [board, messageColor, castling] = contents.split(MESSAGE.GAME_DELIMITER);

        // If the message color is the same as the load color and the current move is not the same as the message content
        // then update the last move and current move, otherwise reset the load status
        if (this.load.color === getEnemyColor(messageColor) && this.load.currMove !== contents) {
            this.load.lastMove = this.load.currMove;
            this.load.currMove = contents;

            sets.setLoad({ ...this.load });
        } else if (this.load.color === messageColor) {
            this.load = null

            sets.setLoad(null);
        }
    }

    /**
     * Processes a message to update the invite, accept, and load status if the message
     * content is related to the invite, accept, or load
     * 
     * @param {import('@xmtp/react-sdk').MessageV2} message The message to process
     * @param {{
     *   setInvite: Function,
     *   setAccept: Function,
     *   setLoad: Function,
     *   setSendData: Function,
     * }} sets The object containing the functions to set the invite, accept, load, and send data
     */
    processMessage(message, sets) {
        if (this.isInviteMessage(message)) {
            this.updateInviteStatus(message, sets);
        } else if (this.isAcceptMessage(message)) {
            this.updateAcceptStatus(message, sets);
        } else if (this.isGameMessage(message)) {
            this.updateLoadStatus(message, sets);
        }
    }
}

export default ConversationManager;
