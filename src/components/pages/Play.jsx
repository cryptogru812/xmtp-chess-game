import { useContext, useEffect, useState } from "react"
import { useSendMessage, useStartConversation, useStreamAllMessages, useStreamMessages } from "@xmtp/react-sdk"
import { useSSX } from "@spruceid/ssx-react"

import Header from "../Header"
import Footer from "../Footer"
import { CONNECT_STATUS, GAME_STATUS, PIECE_COLORS } from "../../utils/enum"
import { generateInitalMoves } from "../../utils/game/message"
import MessageBoard from "../MessageBoard"
import GameContainer from "../GameContainer"
import { GameContext } from "../middleware/FindGame"
import GameManager from "../../utils/managers/GameManager"

function Play() {
    const gameData = useContext(GameContext);

    const { hash, color, initLastMove, initCurrMove, conversation } = gameData;
    const { sendMessage } = useSendMessage();
    const { ssx } = useSSX();

    const [status, setStatus] = useState(CONNECT_STATUS.ACCEPT);
    const [lastMove, setLastMove] = useState(initLastMove);
    const [currMove, setCurrMove] = useState(initCurrMove);
    const [sendData, setSendData] = useState('');
    const sets = { setStatus, setLastMove, setCurrMove, setSendData }
    const manager = new GameManager(lastMove, currMove, status, ssx.address(), color, hash);

    useEffect(() => {
        if (sendData.trim() !== '') {
            sendMessage(conversation, sendData.trim())
            setSendData('')
        }
    }, [sendData])

    const sendMove = (nextMove) => {
        setLastMove(currMove);
        setCurrMove(nextMove);

        sendMessage(conversation, `${hash}-${nextMove}`)
    }

    return (
        <div className="min-h-screen bg-foreground grid grid-rows-[auto_1fr_auto]">
            <Header />
            <div className="mt-4">
                <div className="flex h-full flex-col xl:flex-row space-y-4 xl:space-y-0">
                    <div className="w-[100%] md:w-[75%] xl:w-1/2 bg-foreground mx-auto">
                        <GameContainer
                            connectStatus={status}
                            currMove={currMove}
                            lastMove={lastMove}
                            player={color}
                            sendMove={sendMove}
                            gameOver={manager.isGameOver()}
                            endGame={(gameStatus) => manager.endGame({ setStatus, setSendData }, gameStatus)}
                        />
                    </div>
                    <div className="w-[100%] md:w-[75%] xl:w-1/2 mx-auto h-[450px] md:h-[600px] xl:h-[90%]">
                        <MessageBoard
                            hash={hash}
                            conversation={conversation}
                            playerAddr={ssx.address()}
                            sendGameDetails={(first) => {
                                manager.updateStatus(sets, first)
                            }}
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Play
