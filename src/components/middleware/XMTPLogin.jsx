import { Client, XMTPProvider, useClient } from "@xmtp/react-sdk";
import { useWalletClient } from "wagmi";
import { useState } from "react";

function XMTPLogin({ children }) {
    const { client, initialize } = useClient();
    const { data: signer } = useWalletClient();
    const [ready, setReady] = useState(false);

    const connect = async () => {
        const options = { env: import.meta.env.VITE_XMTP_ENV };
        const keys = await Client.getKeys(signer, {
            ...options,
            skipContactPublishing: true,
            persistConversations: false,
        });

        console.log({ keys, options, signer });
        await initialize({ options, signer, keys });
        setReady(true);
    }

    return (
        <>
            {client ?
                children : (
                    <div className="min-w-screen min-h-screen bg-[#4a752c] flex justify-center items-center">
                        <div className="min-w-[90vw] min-h-[90vh] bg-[#578a34] rounded-lg">
                            <div className="w-full p-8 flex items-center justify-between flex-col">
                                <div className="mb-24">
                                    <h1 className="text-black text-3xl">Play chess with your friends</h1>
                                </div>
                                <div className="text-lg">
                                    <div>Now let's initialize your XMTP account</div>
                                    <div className="flex justify-center">
                                        <button
                                            className="bg-[#236E19] text-white rounded-lg px-4 py-2 mt-4 w-full"
                                            onClick={connect}
                                        >
                                            Connect to XMTP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </>
    )
}

export default XMTPLogin
