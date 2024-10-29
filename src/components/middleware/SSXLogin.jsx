import { useSSX } from "@spruceid/ssx-react"
import { useWeb3Modal } from "@web3modal/wagmi/react"

function SSXLogin({ children }) {
    const { ssx } = useSSX();
    const { open } = useWeb3Modal();

    return (
        <>
            {ssx?.session() ? children : (
                <div className="min-w-screen min-h-screen bg-[#4a752c] flex justify-center items-center">
                    <div className="min-w-[90vw] min-h-[90vh] bg-[#578a34] rounded-lg">
                        <div className="w-full p-8 flex items-center justify-between flex-col">
                            <div className="mb-24">
                                <h1 className="text-black text-3xl">Play chess with your friends</h1>
                            </div>
                            <div className="text-lg">
                                <div>To start, please connect your wallet</div>
                                <div className="flex justify-center">
                                    <button
                                        className="bg-[#236E19] text-white rounded-lg px-4 py-2 mt-4 w-full"
                                        onClick={open}
                                    >
                                        Connect Wallet
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

export default SSXLogin
