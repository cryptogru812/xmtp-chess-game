import { PIECE_COLORS, PIECE_VALUES } from "../utils/enum";

const positions = {
    'top-left': 'rounded-tl-xl',
    'top-right': 'rounded-tr-xl',
    'bottom-left': 'rounded-bl-xl',
    'bottom-right': 'rounded-br-xl',
}

const colors = {
    [PIECE_COLORS.WHITE]: 'white',
    [PIECE_COLORS.BLACK]: 'black',
}

const types = {
    [PIECE_VALUES.QUEEN]: 'queen',
    [PIECE_VALUES.ROOK]: 'rook',
    [PIECE_VALUES.BISHOP]: 'bishop',
    [PIECE_VALUES.KNIGHT]: 'knight',
}

function TransformButton({ position, type, color, transform }) {
    const image = `${colors[color]}_${types[type]}`;

    return (
        <button
            className={`${positions[position]} ${image} bg-primary-button black_pawn border border-white`}
            onClick={() => transform(type)}
        />
    );
}

export default TransformButton;
