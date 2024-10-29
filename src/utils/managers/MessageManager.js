import { DEV_MODE } from "../enum";
import { createGameMessage, filterMessages, generateHash, getContent, isHashContent } from "../message/message";

class MessageManager {
    /**
     * The constructor for the MessageManager class. Seperates the game messages from the conversation messages
     * 
     * @param {import('@xmtp/react-sdk').ConversationV2} conversation The conversation object
     * @param {import('@xmtp/react-sdk').MessageV2[]} messages The messages in the conversation
     * @param {String} playerAddr The address of the player
     * @param {String} hash The hash to use for the game messages
     */
    constructor(conversation, messages, playerAddr, hash = generateHash()) {
        const { gameMessages, convoMessages } = filterMessages(messages, hash);

        this.conversation = conversation;
        this.gameMessages = gameMessages;
        this.convoMessages = convoMessages;
        this.playerAddr = playerAddr;
        this.hash = hash;
    }

    /**
     * Get the conversation messages
     * 
     * @returns {import('@xmtp/react-sdk').MessageV2[]} The conversation messages
     */
    getMessages() {
        return this.convoMessages;
    }

    /**
     * Get the game messages
     * 
     * @returns {import('@xmtp/react-sdk').MessageV2[]} The game messages
     */
    getGameMessages() {
        return this.gameMessages;
    }

    /**
     * Send a game message
     * 
     * @param {Function} sendMessageFn The function to send the message
     * @param  {...any} content The content of the message to send
     */
    sendGameMessage(sendMessageFn, ...content) {
        const message = createGameMessage(this.hash, ...content);

        sendMessage(sendMessageFn, this.conversation, message);
    }

    /**
     * Process a new message. If the message is a game message, it will be added to the game messages and the game 
     * details will be sent upwards. Otherwise, it will be added to the conversation messages
     * 
     * @param {import('@xmtp/react-sdk').MessageV2} message The message to process
     * @param {Function} sendGameDetailsFn The function to send the game details
     */
    processMessage(message, sendGameDetailsFn) {
        if (isHashContent(message.content, this.hash)) {
            this.gameMessages.push(message);
            sendGameDetailsFn(message);

            // If in dev mode, add the message to the conversation messages as well
            if (DEV_MODE) {
                this.convoMessages.push(message);
            }
        } else {
            this.convoMessages.push(message);
        }
    }

    /**
     * Sends a message. Only sends it if it does not start with the hash
     * 
     * @param {Function} sendMessageFn The function to send the message
     * @param {String} content The content of the message to send
     */
    sendMessage(sendMessageFn, content) {
        if (!content.startsWith(this.hash)) {
            sendMessageFn(this.conversation, content);
        }
    }

    /**
     * Determines if a message should include a profile image. If the previous message was sent by the same person,
     * it should not include the image
     * 
     * @param {import('@xmtp/react-sdk').MessageV2} message The message to check
     * @param {import('@xmtp/react-sdk').MessageV2} prevMessage The previous message
     * @returns {Boolean} True if the message should include the image, false otherwise
     */
    includeImage(message, prevMessage) {
        if (!prevMessage || prevMessage.senderAddress !== message.senderAddress) {
            return true;
        }

        return false;
    }

    /**
     * Generates the display details for the conversation messages
     *
     * @returns {{
     *   content: String,
     *   includeImage: Boolean,
     *   isPlayer: Boolean,
     * }} The display details for the conversation messages
     */
    getDisplayDetails() {
        const details = [];

        this.convoMessages.forEach((message, index) => {
            const prevMessage = this.convoMessages[index - 1];
            const includeImage = this.includeImage(message, prevMessage);

            details.push({
                content: message.content,
                includeImage,
                isPlayer: message.senderAddress === this.playerAddr,
            });
        });

        return details;
    }
}

export default MessageManager;
