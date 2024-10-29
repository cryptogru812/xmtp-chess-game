import { useConversations, useStreamConversations } from "@xmtp/react-sdk"
import { useEffect, useState } from "react";
import { isAddress } from "viem";

import Footer from "../Footer"
import Header from "../Header"
import GameCard from "../GameCard";
import SearchCard from "../SearchCard";

function GameList() {
    const [search, setSearch] = useState('')
    const { conversations: xmtpConversations, isLoaded } = useConversations();
    const [conversations, setConversations] = useState(xmtpConversations);

    useEffect(() => {
        setConversations(xmtpConversations);
    }, [isLoaded]);

    const addNewConversation = (conversation) => {
        const idential = conversations.find((oldConversation) => oldConversation.peerAddress === conversation.peerAddress);

        if (!idential) {
            setConversations([conversation, ...conversations]);
        } else {
            setConversations([conversation, ...conversations.filter((oldConversation) => oldConversation.peerAddress !== conversation.peerAddress)]);
        }
    };

    useStreamConversations({ onConversation: (conversation) => addNewConversation(conversation) })

    return (
        <div className="min-h-screen bg-foreground grid grid-rows-[auto_1fr_auto]">
            <Header />
            <div className="flex w-full justify-center">
                <div className="px-8 py-4 max-w-[1296px] w-full">
                    <div className="grid grid-cols-[3fr_auto_auto] w-full">
                        <div className="w-full flex justify-center">
                            <input
                                className={`bg-input rounded-lg text-xl px-4 py-4 w-full`}
                                type="text"
                                placeholder="Enter an ENS name or address..."
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="text-xl flex flex-col items-center px-4">
                            <div className="border-r border-white border-2 h-full inline" />
                            <div>or</div>
                            <div className="border-l border-white border-2 h-full inline" />
                        </div>
                        <div className="flex justify-center items-center">
                            <button
                                className="bg-primary-button text-2xl p-4 rounded-lg hover:bg-primary-button-hover transition duration-300 ease-in-out mx-2"
                            >
                                Play a Bot
                            </button>
                        </div>
                        <SearchCard search={search} isValid={isAddress(search) || search.endsWith('.eth')} addNewConversation={addNewConversation} />
                    </div>
                    <div className="my-8 text-2xl">
                        <div className="my-4">Player List</div>
                        <div className="space-y-4">
                            {
                                conversations.map((conversation, index) => {
                                    return (
                                        <GameCard conversation={conversation} index={index} key={index} />
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default GameList
