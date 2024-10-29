import { useStartConversation, useStreamMessages } from "@xmtp/react-sdk";
import { useEffect, useState } from "react";

function Game({ conversation }) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const exec = async () => {
            const messages = await conversation.conversation.messages();
            setMessages(messages);
        }

        exec();
    }, [])

    const sendInvite = async (e) => {
        e.preventDefault();

        const message = await conversation.conversation.send('ABCDEF-INVITE');
    }

    useStreamMessages(conversation.cachedConversation, {
        onMessage: (message) => {
            setMessages([...messages, message])
        }
    })

    return <div className="min-w-screen min-h-screen bg-[#4a752c] flex justify-center items-center">
        <div className="min-w-[90vw] min-h-[90vh] bg-[#578a34] rounded-lg">
            <div className="w-full p-8 flex items-center justify-between flex-col">
                <div className="mb-8">
                    <h1 className="text-black text-3xl">Let's play</h1>
                </div>
                <div className="w-full">
                    <div>Game here</div>
                </div>
                <div>
                    Chat:
                    <div>
                        {
                            messages.filter(m => !m.content.includes('ABCDEF')).map(m => {
                                return <div>{m.content}</div>
                            })
                        }
                    </div>
                    <div>
                        <button onClick={sendInvite}>Send invite</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default Game;
