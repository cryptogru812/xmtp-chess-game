import { useMessages } from "@xmtp/react-sdk";
import { createContext, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { generateInitalMoves } from "../../utils/game/message";
import { findMostRecentGameMessages } from "../../utils/message/message";

export const GameContext = createContext();

function FindGame({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [state] = useState(location.state || {});
    const { color, hash, conversation, firstLastMove, firstCurrMove } = state;
    const [initLastMove, setInitLastMove] = useState(firstLastMove);
    const [initCurrMove, setInitCurrMove] = useState(firstCurrMove);

    useEffect(() => {
        navigate('.', { replace: true, state: { ...state, firstLastMove: undefined, firstCurrMove: undefined } })
    }, [navigate])

    if ([color, hash, conversation].includes(undefined)) {
        return <Navigate to="/" />
    }

    const { messages, isLoaded, error } = useMessages(conversation);

    useEffect(() => {
        if (isLoaded && !error && !initLastMove && !initCurrMove) {
            const searchResults = findMostRecentGameMessages(messages, hash);
            const [moveNeg1, move0] = generateInitalMoves();

            if (searchResults.length === 1) {
                searchResults.unshift(move0)
            }
            const [tempFirstLastMove, tempFirstCurrMove] = searchResults;

            setInitLastMove(tempFirstLastMove || moveNeg1);
            setInitCurrMove(tempFirstCurrMove || move0);
        }
    }, [isLoaded]);

    if (!initLastMove || !initCurrMove) {
        return <div>Loading...</div>
    }

    return (
        <GameContext.Provider value={{ ...state, initLastMove, initCurrMove }}>
            {children}
        </GameContext.Provider>
    )
}

export default FindGame;
