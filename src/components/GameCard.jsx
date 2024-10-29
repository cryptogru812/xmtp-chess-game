import { useEnsName, useEnsAvatar } from "wagmi"
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSSX } from "@spruceid/ssx-react";

import ConversationManager from "../utils/managers/ConversationManager";
import { useSendMessage, useStreamMessages, useMessages } from "@xmtp/react-sdk";
import { generateInitalMoves } from "../utils/game/message";
import { loadGameHistory } from "../utils/message/message";

function GameCard({ conversation }) {
    const { messages, isLoaded, error } = useMessages(conversation);
    const cardData = {
        primaryName: conversation.peerAddress,
        secondaryName: '',
        avatar: `https://noun-api.com/beta/pfp?name=${conversation.peerAddress}`,
    }
    const { data: ensNameData, isFetched: ensNameIsLoaded } = useEnsName({ address: conversation.peerAddress });
    const { data: ensAvatarData, isFetched: ensAvatarIsLoaded } = useEnsAvatar({ name: cardData.primaryName.includes('.eth') ? cardData.primaryName : undefined });
    const [invite, setInvite] = useState({ accepted: false, hash: undefined, color: undefined });
    const [accept, setAccept] = useState({ accepted: false, hash: undefined, color: undefined });
    const [load, setLoad] = useState(null);
    const [message, setMessage] = useState(undefined);
    const [sendData, setSendData] = useState('');
    const navigate = useNavigate();
    const manager = new ConversationManager(invite, accept, load, conversation.walletAddress);
    const sets = { setInvite, setAccept, setSendData, setLoad };
    const { sendMessage } = useSendMessage();
    const profiles = {
        opponent: {
            name: cardData.secondaryName ? cardData.primaryName : undefined,
            img: cardData.avatar,
        }
    }
    const { ssx } = useSSX();

    useEffect(() => {
        if (ensNameIsLoaded && ensNameData) {
            cardData.secondaryName = cardData.primaryName;
            cardData.primaryName = ensNameData;
        }
    }, [ensNameIsLoaded]);

    useEffect(() => {
        if (ensAvatarIsLoaded && ensAvatarData) {
            cardData.avatar = ensAvatarData;
        }
    }, [ensAvatarIsLoaded]);

    useEffect(() => {
        if (sendData) {
            sendMessage(conversation, sendData);
        }
    }, [sendData]);

    const onMessage = useCallback((newMessage) => {
        if (newMessage.id !== message?.id) {
            setMessage(newMessage);
        }
    }, [message]);

    useEffect(() => {
        if (message) {
            manager.processMessage(message, sets);
        }
    }, [message]);

    useStreamMessages(conversation, { onMessage });

    useEffect(() => {
        if (invite.accepted) {
            const [moveNeg1, move0] = generateInitalMoves();
            const color = invite.color;
            const hash = invite.hash;

            navigate('/play', {
                state: {
                    conversation,
                    hash,
                    color,
                    profiles,
                    firstLastMove: moveNeg1,
                    firstCurrMove: move0,
                }
            })
        }
    }, [invite.accepted]);

    useEffect(() => {
        if (accept.accepted) {
            const [moveNeg1, move0] = generateInitalMoves();
            const color = accept.color;
            const hash = accept.hash;

            navigate('/play', {
                state: {
                    conversation,
                    hash,
                    color,
                    profiles,
                    firstLastMove: moveNeg1,
                    firstCurrMove: move0,
                }
            })
        }
    }, [accept.accepted]);

    const loadGame = () => {
        const { lastMove, currMove, color, hash } = load || {};

        navigate('/play', {
            state: {
                conversation,
                hash,
                color,
                profiles,
                firstLastMove: lastMove,
                firstCurrMove: currMove,
            }
        });
    }

    useEffect(() => {
        if (isLoaded && messages.length > 0) {
            const data = loadGameHistory(messages, ssx.address())

            if (!invite.hash) {
                setInvite({ ...invite, hash: data.invite?.hash, color: data.invite?.color });
            }
            if (!accept.hash) {
                setAccept({ ...accept, hash: data.accept?.hash, color: data.accept?.color });
            }

            setLoad(data.load);
        }
    }, [isLoaded]);

    return (
        <div
            className="bg-input rounded-lg text-xl px-4 py-4 w-full my-2 flex justify-between items-center"
        >
            <div className="flex items-center">
                <div>
                    <img
                        className="w-[75px] h-[75px] rounded-full border border-black mr-4"
                        src={cardData.avatar}
                        alt="avatar"
                    />
                </div>
                <div className="grid grid-rows-[1fr_auto] h-[75px]">
                    <div className="flex items-center">
                        {cardData.primaryName}
                    </div>
                    <div className="text-sm">{cardData.secondaryName}</div>
                </div>
            </div>
            <div>
                <button
                    className="bg-primary-button text-2xl p-4 rounded-lg hover:bg-primary-button-hover transition duration-300 ease-in-out mx-2"
                    disabled={!accept.hash}
                    hidden={!accept.hash}
                    onClick={() => manager.sendDecline(sets)}
                >
                    Decline Game
                </button>
                <button
                    className="bg-primary-button text-2xl p-4 rounded-lg hover:bg-primary-button-hover transition duration-300 ease-in-out mx-2"
                    disabled={!accept.hash}
                    hidden={!accept.hash}
                    onClick={() => manager.sendAccept(sets)}
                >
                    Accept Game
                </button>
                <button
                    className="bg-primary-button text-2xl p-4 rounded-lg hover:bg-primary-button-hover transition duration-300 ease-in-out mx-2"
                    onClick={() => manager.sendInvite(sets)}
                    disabled={invite.hash}
                >
                    {invite.hash ? 'Invite Sent' : 'Send Invite'}
                </button>
                <button
                    className="bg-primary-button text-2xl p-4 rounded-lg hover:bg-primary-button-hover transition duration-300 ease-in-out mx-2"
                    onClick={() => loadGame()}
                    hidden={!load}
                >
                    Load Game
                </button>
            </div>
        </div>
    )
}

export default GameCard
