import { Client, useClient } from "@xmtp/react-sdk";
import { useWalletClient } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useSSX } from "@spruceid/ssx-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../Footer";
import Header from "../Header";
import Board from "../DisplayBoard";
import { createInitialBoard } from "../../utils/game/board";

function Home() {
    const { initialize, client } = useClient();
    const { data: signer } = useWalletClient();
    const { open } = useWeb3Modal();
    const { ssx } = useSSX();
    const navigate = useNavigate();

    const connectWallet = async () => {
        if (!ssx?.session()) {
            open();
        }
    }

    const connectXMTP = async () => {
        if (!client && ssx?.session()) {
            const options = { env: import.meta.env.VITE_XMTP_ENV };
            const keys = await Client.getKeys(signer, {
                ...options,
                skipContactPublishing: true,
                persistConversations: false,
            });

            await initialize({ options, signer, keys });
        }
    }

    useEffect(() => {
        if (ssx?.session()) {
            connectXMTP();
        }
    }, [ssx?.session()]);

    useEffect(() => {
        if (client) {
            navigate('/games')
        }
    }, [client]);

    const attemptConnect = async () => {
        await connectWallet();
        await connectXMTP();
    }

    return (
        <div className="min-h-screen bg-foreground grid grid-rows-[auto_1fr_auto]">
            <Header />
            <div>
                <div className="flex h-full">
                    <div className="w-1/2 bg-foreground m-auto">
                        <div className="w-[75%] h-full mx-auto">
                            <Board board={createInitialBoard()} />
                        </div>
                    </div>
                    <div className="w-1/2 bg-foreground">
                        <div className="w-[75%] h-full mx-auto my-auto flex flex-col justify-around items-center">
                            <div>
                                <h1 className="text-4xl text-center">
                                    Play chess with your friends online or against a bot!
                                </h1>
                            </div>
                            <div>
                                <button
                                    className="bg-primary-button py-8 px-16 text-4xl rounded-lg hover:bg-primary-button-hover transition duration-300 ease-in-out"
                                    onClick={attemptConnect}
                                >
                                    Start Playing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Home
