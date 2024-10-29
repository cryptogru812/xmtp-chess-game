import { useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useSSX } from "@spruceid/ssx-react"

import logo from '../assets/logo.png'
import { Link } from "react-router-dom";
import { useClient } from "@xmtp/react-sdk";

function Header() {
    const { ssx } = useSSX();
    const hasSession = ssx?.session() ? true : false;
    const { open } = useWeb3Modal();
    const { disconnect: walletDisconect } = useDisconnect();
    const { disconnect: xmtpDisconnect } = useClient();

    const toggleAccount = async () => {
        if (hasSession) {
            await xmtpDisconnect();
            localStorage.clear();
            walletDisconect();
            await ssx.signOut();
        } else {
            open();
        }
    }

    return (
        <header className="bg-header py-4 px-8 text-2xl">
            <div className="flex justify-between items-center">
                <div>
                    <Link to={'/'} reloadDocument ><img src={logo} alt="logo" className="w-[180px] h-[75px]" /></Link>
                </div>
                <div>
                    <button
                        className="bg-primary-button py-2 px-4 rounded-lg hover:bg-primary-button-hover transition duration-300 ease-in-out"
                        onClick={toggleAccount}
                    >
                        {hasSession ? 'Sign Out' : 'Sign In'}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
