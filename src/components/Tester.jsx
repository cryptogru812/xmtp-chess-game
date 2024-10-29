import { useStartConversation, useCanMessage, useConversations } from "@xmtp/react-sdk";
import { useEffect } from "react";

function Tester() {
    const { canMessage, canMessageStatic } = useCanMessage();
    const { startConversation } = useStartConversation();
    const { conversations } = useConversations();

    // useEffect(() => {
    //     const exec = async () => {
    //         const results = await canMessageStatic('0x99FD46b167B0FBB8aC6f79E6f575A6199c2cb536');
    //         console.log(results);

    //         const convo = await startConversation('0x99FD46b167B0FBB8aC6f79E6f575A6199c2cb536', 'Hi there!');
    //         console.log(convo);

    //         console.log(conversations)
    //     }

    //     exec();
    // }, [])

    return (
        <div>
            <p>Attempting to establish a connection</p>
        </div>
    )
}

export default Tester
