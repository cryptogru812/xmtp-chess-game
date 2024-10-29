function GameSquare({ details, manager, position, makeMove, setSelected }) {
    const divStyle = details?.selectable && details?.action ? `div-${details.action[2]}` : 'hidden';
    const checkerBackground = manager.getTileBackground(position) === 1 ? 'bg-checker1' : 'bg-checker2';
    const pieceStatus = manager.isSelectedPiece(position) ? 'bg-selected-piece-background' : 'border-white/0';
    const imageClass = manager.getImageClass(details?.piece)
    let action = undefined;

    if (details?.selectable) {
        if (details?.action) {
            action = () => manager.executeAction(details.action, makeMove);
        } else {
            action = () => manager.toggleTile(position, setSelected);
        }
    }

    return (
        <button
            className={`border ${checkerBackground} ${pieceStatus} ${imageClass} flex items-center justify-center`}
            disabled={!details?.selectable}
            onClick={action}
        >
            <div className={`rounded-full w-1/2 h-1/2 ${divStyle}`}></div>
        </button>
    )
}

export default GameSquare;
