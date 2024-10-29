import { useWalletClient, useDisconnect, useAccount } from 'wagmi';
import { SSXProvider } from '@spruceid/ssx-react';
import { useEffect } from 'react';

function SSXWatchProvider({ children }) {
    const { disconnect } = useDisconnect();
    const { data: walletClient, } = useWalletClient();
    const { isConnected } = useAccount();

    const web3Provider = { provider: walletClient };
    const ssxConfig = {
        siweConfig: {},
    };

    useEffect(() => {
        if (!isConnected) {
            disconnect();
        }

    }, [isConnected]);

    const watchProvider = async (provider, ssx) => {
        try {
            if (ssx) {
                // SignIn
                if (provider && !ssx.address()) {
                    await ssx.signIn();

                    return ssx;

                    // Change Account
                } else if (provider && ssx.address() && provider.account.address !== ssx.address()) {
                    await ssx.signOut();
                    await ssx.signIn();
                    return ssx;

                    // SignOut
                } else {
                    localStorage.clear();
                    await ssx.signOut();
                }
            }
        } catch {
            disconnect();
        }
    }

    return (
        <SSXProvider watchProvider={watchProvider} web3Provider={web3Provider} ssxConfig={ssxConfig} >
            {children}
        </SSXProvider>
    )
}

export default SSXWatchProvider;
