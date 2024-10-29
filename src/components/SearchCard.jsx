import { useCanMessage, useStartConversation } from "@xmtp/react-sdk"
import { useEnsAddress } from "wagmi"
import { isAddress } from "viem"
import { useState, useEffect } from "react"

function SearchCard({ search, isValid, addNewConversation }) {
    const { canMessage, isLoading } = useCanMessage();
    const { data, isFetched } = useEnsAddress({ name: search.endsWith('.eth') ? search : undefined });
    const [isOnline, setIsOnline] = useState(false);
    const cardData = {
        avatar: isValid ? `https://noun-api.com/beta/pfp?name=${search}` : undefined,
        primaryName: search,
    }
    const color = isOnline ? 'green-700' : 'red-700';
    const { startConversation } = useStartConversation();

    useEffect(() => {
        const exec = async () => {
            try {
                if (!isLoading && isAddress(search)) {
                    const results = await canMessage(search);
                    setIsOnline(results);
                } else if (isFetched && !isLoading && data) {
                    const results = await canMessage(data);
                    setIsOnline(results);
                } else {
                    setIsOnline(false);
                }
            } catch (error) {
                setIsOnline(false);
            }
        }

        if (isValid) {
            exec();
        }
    }, [isLoading, isFetched, search]);

    const addConversation = async () => {
        const address = search;

        if (isValid && isOnline) {
            const convoTypes = await startConversation(address, '');

            addNewConversation(convoTypes.cachedConversation);
        }
    }

    return (
        <button
            className={`bg-white rounded-lg p-4 text-black border-${color} border ${isValid ? 'visible' : 'invisible'}`}
            onClick={() => addConversation()}
            disabled={!isValid || !isOnline}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div>
                        <img
                            className="w-[50px] h-[50px] rounded-full border border-black mr-4"
                            src={cardData.avatar}
                            alt="avatar"
                        />
                    </div>
                    <div className="grid grid-rows-[1fr_auto] h-[50px]">
                        <div className="flex items-center">
                            {cardData.primaryName}
                        </div>
                        <div className="text-sm">{cardData.secondaryName}</div>
                    </div>
                </div>
                <div className={`text-${color}`}>
                    {isOnline ? 'Online' : 'Offline'}
                </div>
            </div>
        </button>
    )
}

export default SearchCard
