import { GAME_VALIDATION_MESSAGES, PIECE_VALUES, DIRECTION_VECTORS, PIECE_COLORS, CAPTURED_PIECE, ROW_TO_INDEX, COL_TO_INDEX, INDEX_TO_ROW, INDEX_TO_COL, ACTION_TYPES, INITIAL_BOARD_POSITIONS } from '../enum';
import { extractCoords } from './translate';
import { areAllies, areEnemies, canAttackDirection, isColor, isPiece } from './piece';
import { convertToAction, executeAction } from './action';

/**
 * Checks if a position is in range of the board
 *
 * @param {import('../../types').ChessPos} chessPos The position of the piece
 * @returns {Boolean} Whether the position is in range
 */
const isInRange = (chessPos) => {
    return chessPos !== null;
}

/**
 * Deep copies a board
 *
 * @param {import('../../types').Board} board The board to copy
 * @returns {import('../../types').Board} A copy of the board
 */
const copyBoard = (board) => {
    return { ...board };
}

/**
 * Gets the piece at a position on the board
 * 
 * @param {import('../../types').Board} board The board to get the piece of
 * @param {import('../../types').ChessPos} chessPos The position of the piece to get
 * @returns {import('../../types').Piece | undefined} The piece at the position
 */
export const getPieceAt = (board, chessPos) => {
    return board[chessPos];
}

/**
 * Moves a position by a certain amount of rows and columns. Returns null if the position is out of range
 * 
 * @param {import('../../types').ChessPos} chessPos The original position of the piece
 * @param {Number} rowAmt The amount of rows to move
 * @param {Number} colAmt The amount of columns to move
 * @returns {import('../../types').ChessPos | null} The new position of the piece, or null if the position is out of range
 */
const movePos = (chessPos, rowAmt, colAmt) => {
    const [col, row] = chessPos.split('');

    const newRow = ROW_TO_INDEX[row] + rowAmt;
    const newCol = COL_TO_INDEX[col] + colAmt;

    if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) {
        return null;
    }

    return INDEX_TO_COL[newCol] + INDEX_TO_ROW[newRow];
}

/**
 * Checks if a position is empty
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} chessPos The position to check
 * @param {import('../../types').Piece | undefined} ignore The piece to ignore
 * @returns {Boolean} Whether the position is empty
 */
const isEmpty = (board, chessPos, ignore) => {
    const piece = getPieceAt(board, chessPos);

    return !piece || piece === ignore;
}

/**
 * Finds the nearest piece in a given direction
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} chessPos The position to start at
 * @param {DIRECTION_VECTORS[keyof DIRECTION_VECTORS]} direction The direction to search in
 * @param {import('../../types').Piece} piece The piece to ignore
 * @returns {import('../../types').ChessPos | null} The position of the nearest piece in the direction, or null if there is none
 */
const findNearestPiece = (board, chessPos, direction, piece) => {
    const [rowDir, colDir] = direction;
    let checkPos = movePos(chessPos, rowDir, colDir);

    while (isInRange(checkPos)) {
        if (!isEmpty(board, checkPos, piece)) {
            return checkPos;
        }

        checkPos = movePos(checkPos, rowDir, colDir);
    }

    return null;
}

/**
 * Checks if en passant is possible based on the positions of the attacking and defending pawns
 * and the required rank to perform en passant
 *
 * @param {import('../../types').ChessPos} attackPos The position of the attacking pawn
 * @param {import('../../types').ChessPos} defensePos The position of the defending pawn
 * @param {Number} rank The required rank to perform en passant
 * @returns {Boolean} Whether en passant is possible
 */
const canEnpassant = (attackPos, defensePos, rank) => {
    const [attackRow, attackCol] = extractCoords(attackPos);
    const [defenseRow, defenseCol] = extractCoords(defensePos);

    return attackRow === defenseRow && attackRow === rank && Math.abs(attackCol - defenseCol) === 1;
}

/**
 * Determines the end position of an en passant move for the attacking pawn
 *
 * @param {import('../../types').ChessPos} attackPos The position of the attacking pawn
 * @param {import('../../types').ChessPos} defensePos The position of the defending pawn
 * @param {-1 | 1} forward The forward direction of the attacking pawn
 * @returns {import('../../types').ChessPos} The end position of the en passant move
 */
const generateEnPassantCoords = (attackPos, defensePos, forward) => {
    const [attackRow, attackCol] = extractCoords(attackPos);
    const [defenseRow, defenseCol] = extractCoords(defensePos);

    return INDEX_TO_COL[defenseCol] + INDEX_TO_ROW[attackRow + forward];
}

/**
 * Generates possible moves for a black pawn. Pawns can move forward one space,
 * or two spaces if it is their first move. Pawns can also capture diagonally.
 * Pawns can transform when they reach the end of the board. Pawns can also
 * perform en passant.
 * 
 * @param {import('../../types').Board} board The board to generate moves from
 * @param {import('../../types').ChessPos} chessPos The position of the pawn
 * @param {import('../../types').Piece} piece The piece representation of the pawn
 * @param {import('../../types').ChessPos | undefined} enPassant The position of the pawn that opened an en passant move
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateBlackPawnMoves = (board, chessPos, piece, enPassant) => {
    const REQUIRED_DOUBLE_MOVE_ROW = 6; // The row where the pawn can move forward two spaces
    const REQUIRED_TRANSFORM_ROW = 1; // The row where the pawn can transform
    const REQUIRED_EN_PASSANT_ROW = 3; // The row where the pawn can perform en passant
    const moves = []; // The array of possible moves
    const possibleMove = movePos(chessPos, -1, 0); // The position of the pawn moving forward one space
    const possibleSpecialMove = movePos(chessPos, -2, 0); // The position of the pawn moving forward two spaces
    const possibleCaptures = [
        movePos(chessPos, -1, 1), // The position of the pawn capturing diagonally to the right
        movePos(chessPos, -1, -1), // The position of the pawn capturing diagonally to the left
    ];
    const [row] = extractCoords(chessPos);

    // Checks if the pawn can move forward one space
    if (isInRange(possibleMove) && isEmpty(board, possibleMove, piece)) {
        // Checks if the pawn is ready to transform or just moving forward
        if (row === REQUIRED_TRANSFORM_ROW) {
            moves.push(convertToAction(possibleMove, ACTION_TYPES.TRANSFORM));
        } else {
            moves.push(convertToAction(possibleMove, ACTION_TYPES.MOVE));
        }

        // Checks if the pawn can move forward two spaces
        if (row === REQUIRED_DOUBLE_MOVE_ROW && isEmpty(board, possibleSpecialMove, piece)) {
            moves.push(convertToAction(possibleSpecialMove, ACTION_TYPES.MOVE));
        }
    }

    // Checks if the pawns can capture on either side
    possibleCaptures.forEach((capture) => {
        if (isInRange(capture) && !isEmpty(board, capture, piece) && areEnemies(piece, getPieceAt(board, capture))) {
            const action = row === REQUIRED_TRANSFORM_ROW ? ACTION_TYPES.TRANSFORM : ACTION_TYPES.CAPTURE;

            moves.push(convertToAction(capture, action));
        }
    });

    // Checks if the pawn can perform en passant
    if (enPassant && canEnpassant(chessPos, enPassant, REQUIRED_EN_PASSANT_ROW)) {
        const enPassantCoords = generateEnPassantCoords(chessPos, enPassant, -1);

        moves.push(convertToAction(enPassantCoords, ACTION_TYPES.EN_PASSANT));
    }

    return moves;
};

/**
 * Generates possible moves for a white pawn. Pawns can move forward one space,
 * or two spaces if it is their first move. Pawns can also capture diagonally.
 * Pawns can transform when they reach the end of the board. Pawns can also
 * perform en passant.
 * 
 * @param {import('../../types').Board} board The board to generate moves from
 * @param {import('../../types').ChessPos} chessPos The position of the pawn
 * @param {import('../../types').Piece} piece The piece representation of the pawn
 * @param {import('../../types').ChessPos | undefined} enPassant The position of the pawn that opened an en passant move
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateWhitePawnMoves = (board, chessPos, piece, enPassant) => {
    const REQUIRED_DOUBLE_MOVE_ROW = 1; // The row where the pawn can move forward two spaces
    const REQUIRED_TRANSFORM_ROW = 6; // The row where the pawn can transform
    const REQUIRED_EN_PASSANT_ROW = 4; // The row where the pawn can perform en passant
    const moves = []; // The array of possible moves
    const possibleMove = movePos(chessPos, 1, 0); // The position of the pawn moving forward one space
    const possibleSpecialMove = movePos(chessPos, 2, 0); // The position of the pawn moving forward two spaces
    const possibleCaptures = [
        movePos(chessPos, 1, 1), // The position of the pawn capturing diagonally to the right
        movePos(chessPos, 1, -1), // The position of the pawn capturing diagonally to the left
    ];
    const [row] = extractCoords(chessPos);

    // Checks if the pawn can move forward one space
    if (isInRange(possibleMove) && isEmpty(board, possibleMove, piece)) {
        // Checks if the pawn is ready to transform or just moving forward
        if (row === REQUIRED_TRANSFORM_ROW) {
            moves.push(convertToAction(possibleMove, ACTION_TYPES.TRANSFORM));
        } else {
            moves.push(convertToAction(possibleMove, ACTION_TYPES.MOVE));
        }

        if (row === REQUIRED_DOUBLE_MOVE_ROW && isEmpty(board, possibleSpecialMove, piece)) {
            moves.push(convertToAction(possibleSpecialMove, ACTION_TYPES.MOVE));
        }
    }

    // Checks if the pawns can capture on either side
    possibleCaptures.forEach((capture) => {
        if (isInRange(capture) && !isEmpty(board, capture, piece) && areEnemies(piece, getPieceAt(board, capture))) {
            const action = row === REQUIRED_TRANSFORM_ROW ? ACTION_TYPES.TRANSFORM : ACTION_TYPES.CAPTURE;

            moves.push(convertToAction(capture, action));
        }
    });

    // Checks if the pawn can perform en passant
    if (enPassant && canEnpassant(chessPos, enPassant, REQUIRED_EN_PASSANT_ROW)) {
        const enPassantCoords = generateEnPassantCoords(chessPos, enPassant, 1);

        moves.push(convertToAction(enPassantCoords, ACTION_TYPES.EN_PASSANT));
    }

    return moves;
};

/**
 * Generates possible moves for a pawn. Pawns can move forward one space,
 * or two spaces if it is the first move. Pawns can also capture diagonally.
 * Pawns can transform when they reach the end of the board. Pawns can also
 * perform en passant.
 * 
 * @param {import('../../types').Board} board The board to generate moves from
 * @param {import('../../types').ChessPos} chessPos The position of the pawn
 * @param {import('../../types').Piece} piece The piece representation of the pawn
 * @param {import('../../types').PawnRegistry} registry The pawn registry
 * @param {import('../../types').ChessPos | undefined} enPassant The position of the pawn that opened an en passant move
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generatePawnMoves = (board, chessPos, piece, registry, enPassant) => {
    // Checks if the pawn is transformed
    if (registry[piece]) {
        const transformedPiece = piece[0] + registry[piece];

        // Sees what type of transformed piece it is
        if (isPiece(transformedPiece, PIECE_VALUES.ROOK)) {
            return generateRookMoves(board, chessPos, piece);
        } else if (isPiece(transformedPiece, PIECE_VALUES.KNIGHT)) {
            return generateKnightMoves(board, chessPos, piece);
        } else if (isPiece(transformedPiece, PIECE_VALUES.BISHOP)) {
            return generateBishopMoves(board, chessPos, piece);
        } else if (isPiece(transformedPiece, PIECE_VALUES.QUEEN)) {
            return generateQueenMoves(board, chessPos, piece);
        }
    }

    // Checks if the pawn is white or black
    if (isColor(piece, PIECE_COLORS.WHITE)) {
        return generateWhitePawnMoves(board, chessPos, piece, enPassant);
    } else {
        return generateBlackPawnMoves(board, chessPos, piece, enPassant);
    }
}

/**
 * Generates possible moves in a given direction
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} chessPos The position to start at
 * @param {DIRECTION_VECTORS[keyof DIRECTION_VECTORS]} direction The direction to search in
 * @param {import('../../types').Piece | undefined} ignore The piece to ignore
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateMovesInDirection = (board, chessPos, direction, ignore) => {
    const moves = []; // The array of possible moves
    const [rowDir, colDir] = direction; // The row and column direction to move in
    let actionPos = movePos(chessPos, rowDir, colDir); // The first position to check
    const piece = ignore || getPieceAt(board, chessPos); // The piece to ignore

    // Loops through the direction until it reaches the end of the board or a piece
    while (isInRange(actionPos)) {
        // Adds a move if the position is empty, a capture if it is an enemy, or stops if it is an ally
        if (isEmpty(board, actionPos, ignore)) {
            moves.push(convertToAction(actionPos, ACTION_TYPES.MOVE));
        } else if (areEnemies(piece, getPieceAt(board, actionPos))) {
            moves.push(convertToAction(actionPos, ACTION_TYPES.CAPTURE));
            break;
        } else {
            break;
        }

        // Moves to the next position
        actionPos = movePos(actionPos, rowDir, colDir);
    }

    return moves;
}

/**
 * Generates possible moves in multiple directions
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} chessPos The position to start at
 * @param {DIRECTION_VECTORS[keyof DIRECTION_VECTORS][]} directions The directions to search in
 * @param {import('../../types').Piece | undefined} ignore The piece to ignore
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateMovesInDirections = (board, chessPos, directions, ignore) => {
    const moves = [];

    // Loops through each direction and adds the moves to the array
    directions.forEach((direction) => {
        moves.push(...generateMovesInDirection(board, chessPos, direction, ignore));
    });

    return moves;
}

/**
 * Generates possible moves for a rook. Rooks can move in any direction
 * along a rank or file.
 * 
 * @param {import('../../types').Board} board The board to generate moves from
 * @param {import('../../types').ChessPos} chessPos The position of the rook
 * @param {import('../../types').Piece | undefined} ignore The piece to ignore
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateRookMoves = (board, chessPos, ignore) => {
    const directions = [
        DIRECTION_VECTORS.NORTH,
        DIRECTION_VECTORS.EAST,
        DIRECTION_VECTORS.SOUTH,
        DIRECTION_VECTORS.WEST,
    ]

    return generateMovesInDirections(board, chessPos, directions, ignore);
}

/**
 * Generates possible moves for a bishop. Bishops can move in any direction
 * along a diagonal.
 *
 * @param {import('../../types').Board} board The board to generate moves from
 * @param {import('../../types').ChessPos} chessPos The position of the bishop
 * @param {import('../../types').Piece} ignore The piece to ignore
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateBishopMoves = (board, chessPos, ignore) => {
    const directions = [
        DIRECTION_VECTORS.NORTH_EAST,
        DIRECTION_VECTORS.SOUTH_EAST,
        DIRECTION_VECTORS.SOUTH_WEST,
        DIRECTION_VECTORS.NORTH_WEST,
    ]

    return generateMovesInDirections(board, chessPos, directions, ignore);
}

/**
 * Generates possible moves for a queen. Queens can move in any direction
 * along a rank, file, or diagonal.
 * 
 * @param {import('../../types').Board} board The board to generate moves from
 * @param {import('../../types').ChessPos} chessPos The position of the queen
 * @param {import('../../types').Piece} ignore The piece to ignore
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateQueenMoves = (board, chessPos, ignore) => {
    const directions = [
        DIRECTION_VECTORS.NORTH,
        DIRECTION_VECTORS.EAST,
        DIRECTION_VECTORS.SOUTH,
        DIRECTION_VECTORS.WEST,
        DIRECTION_VECTORS.NORTH_EAST,
        DIRECTION_VECTORS.SOUTH_EAST,
        DIRECTION_VECTORS.SOUTH_WEST,
        DIRECTION_VECTORS.NORTH_WEST,
    ]

    return generateMovesInDirections(board, chessPos, directions, ignore);
}

/**
 * Generates possible moves for a knight. Knights can move in an L shape
 * in any direction, and can jump over other pieces.
 * 
 * @param {import('../../types').Board} board The board to generate moves from
 * @param {import('../../types').ChessPos} chessPos The position of the knight
 * @param {import('../../types').Piece} piece The piece representation of the knight
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateKnightMoves = (board, chessPos, piece) => {
    const moves = [];

    const possibleMoves = [
        movePos(chessPos, -2, -1),
        movePos(chessPos, -2, 1),
        movePos(chessPos, -1, -2),
        movePos(chessPos, -1, 2),
        movePos(chessPos, 1, -2),
        movePos(chessPos, 1, 2),
        movePos(chessPos, 2, -1),
        movePos(chessPos, 2, 1),
    ];

    possibleMoves.forEach((move) => {
        if (isInRange(move)) {
            if (isEmpty(board, move, piece)) {
                moves.push(convertToAction(move, ACTION_TYPES.MOVE));
            } else if (areEnemies(piece, getPieceAt(board, move))) {
                moves.push(convertToAction(move, ACTION_TYPES.CAPTURE));
            }
        }
    });

    return moves;
};


/**
 * Checks if a position is safe from enemy attacks
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} chessPos The position to check
 * @param {import('../../types').Piece} ignore The piece to ignore
 * @param {import('../../types').PawnRegistry} registry The pawn registry
 * @returns {Boolean} Whether the position is safe
 */
export const isSafe = (board, chessPos, ignore, registry) => {
    // Checks if there is a piece to protect
    const piece = ignore ?? getPieceAt(board, chessPos);
    if (!piece) {
        return true;
    }

    // Checks all directions for enemy attacks
    const directionalDanger = Object.values(DIRECTION_VECTORS).some((direction) => {
        const nearestPiecePos = findNearestPiece(board, chessPos, direction, ignore);

        if (nearestPiecePos) {
            const nearestPiece = getPieceAt(board, nearestPiecePos);

            if (areEnemies(piece, nearestPiece)) {
                if (canAttackDirection(nearestPiece, direction, registry)) {
                    return true;
                }
            }
        }

        return false;
    });

    if (directionalDanger) {
        return false;
    }

    // Determines the direction of the knight attacks
    const knightMoves = [
        movePos(chessPos, -2, -1),
        movePos(chessPos, -2, 1),
        movePos(chessPos, -1, -2),
        movePos(chessPos, -1, 2),
        movePos(chessPos, 1, -2),
        movePos(chessPos, 1, 2),
        movePos(chessPos, 2, -1),
        movePos(chessPos, 2, 1),
    ];

    // Checks for enemy knight attacks
    const knightDanger = knightMoves.some((actionPos) => {
        if (isInRange(actionPos)) {
            const knight = getPieceAt(board, actionPos);
            return areEnemies(piece, knight) && isPiece(knight, PIECE_VALUES.KNIGHT, registry);
        }
    });

    // Determines the direction of the pawn attacks
    const pawnAttacks = isColor(piece, PIECE_COLORS.BLACK) ? [DIRECTION_VECTORS.NORTH_EAST, DIRECTION_VECTORS.NORTH_WEST] : [DIRECTION_VECTORS.SOUTH_EAST, DIRECTION_VECTORS.SOUTH_WEST];

    // Checks for enemy pawn attacks
    const pawnDanger = pawnAttacks.some((direction) => {
        const [rowDir, colDir] = direction;
        const tempPos = movePos(chessPos, rowDir, colDir);

        if (isInRange(tempPos) && !isEmpty(board, tempPos, ignore)) {
            const pawn = getPieceAt(board, tempPos);
            return areEnemies(piece, pawn) && isPiece(pawn, PIECE_VALUES.PAWN);
        }
    });

    return !knightDanger && !pawnDanger
};

/**
 * Checks if a long castle is possible for the player
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} chessPos The position of the king
 * @param {import('../../types').Piece} piece The piece representation of the king 
 * @param {{
 *   1: boolean,
 *   2: boolean
 * }} canCastle The details of the castling ability of the player
 * @param {import('../../types').PawnRegistry} registry The pawn registry
 * @returns {Boolean} Whether the long castle is valid
 */
const validLongCastle = (board, chessPos, piece, canCastle, registry) => {
    // Checks if the player hasn't lost the ability to long castle
    if (!canCastle[1]) {
        return false;
    }

    // Checks if every position between the king and the rook is empty
    const isAllEmpty = [1, 2, 3, 4].every((castleCol) => {
        const checkPos = INDEX_TO_COL[castleCol] + chessPos[1]

        return isEmpty(board, checkPos, piece);
    });
    if (!isAllEmpty) {
        return false;
    }

    // Checks if every position between the king and the rook is safe
    const isAllSafe = [1, 2, 3, 4].every((castleCol) => {
        const checkPos = INDEX_TO_COL[castleCol] + chessPos[1]

        return isSafe(board, checkPos, piece, registry);
    });
    if (!isAllSafe) {
        return false;
    }

    // Checks if the rook is in the correct position and is the correct piece
    if (!isPiece(getPieceAt(board, 'A' + chessPos[1]), PIECE_VALUES.ROOK) || !areAllies(piece, getPieceAt(board, 'A' + chessPos[1]))) {
        return false;
    }

    return true;
}

/**
 * Checks if a short castle is possible for the player
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} chessPos The position of the king
 * @param {import('../../types').Piece} piece The piece representation of the king
 * @param {{
 *  1: boolean,
 *  2: boolean,
 * }} canCastle The details of the castling ability of the player
 * @param {import('../../types').PawnRegistry} registry The pawn registry
 * @returns {Boolean} Whether the short castle is valid
 */
const validShortCastle = (board, chessPos, piece, canCastle, registry) => {
    // Checks if the player hasn't lost the ability to short castle
    if (!canCastle[2]) {
        return false;
    }

    // Checks if every position between the king and the rook is empty
    const isAllEmpty = [4, 5, 6].every((castleCol) => {
        const checkPos = INDEX_TO_COL[castleCol] + chessPos[1]

        return isEmpty(board, checkPos, piece);
    });
    if (!isAllEmpty) {
        return false;
    }

    // Checks if every position between the king and the rook is safe
    const isAllSafe = [4, 5, 6].every((castleCol) => {
        const checkPos = INDEX_TO_COL[castleCol] + chessPos[1]

        return isSafe(board, checkPos, piece, registry);
    });
    if (!isAllSafe) {
        return false;
    }

    // Checks if the rook is in the correct position and is the correct piece
    if (!isPiece(getPieceAt(board, 'H' + chessPos[1]), PIECE_VALUES.ROOK) || !areAllies(piece, getPieceAt(board, 'H' + chessPos[1]))) {
        return false;
    }

    return true;
}

/**
 * Generates possible moves for a king. Kings can move in any direction
 * along a rank, file, or diagonal, but only one space at a time. Kings can
 * also perform castling if the conditions are met.
 * 
 * @param {import('../../types').Board} board The board to generate moves from
 * @param {import('../../types').ChessPos} chessPos The position of the king
 * @param {import('../../types').Piece} piece The piece representation of the king
 * @param {{
 *   1: boolean,
 *   2: boolean
 * }} canCastle The details of the castling ability of the player
 * @param {import('../../types').PawnRegistry} registry The pawn registry
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateKingMoves = (board, chessPos, piece, canCastle, registry) => {
    const moves = [];

    // Generates possible moves for the king
    const possibleMoves = [
        movePos(chessPos, -1, -1),
        movePos(chessPos, -1, 0),
        movePos(chessPos, -1, 1),
        movePos(chessPos, 0, -1),
        movePos(chessPos, 0, 1),
        movePos(chessPos, 1, -1),
        movePos(chessPos, 1, 0),
        movePos(chessPos, 1, 1),
    ];

    // Checks if the king can move to each position, or capture if there is an enemy
    possibleMoves.forEach((move) => {
        if (isInRange(move) && isSafe(board, move, piece, registry) && !areAllies(piece, getPieceAt(board, move))) {
            if (isEmpty(board, move, piece)) {
                moves.push(convertToAction(move, ACTION_TYPES.MOVE));
            } else {
                moves.push(convertToAction(move, ACTION_TYPES.CAPTURE));
            }
        }
    });

    // Checks if the king can perform a long castle
    if (validLongCastle(board, 'A' + chessPos[1], piece, canCastle, registry)) {
        moves.push(convertToAction('C' + chessPos[1], ACTION_TYPES.CASTLE));
    }

    // Checks if the king can perform a short castle
    if (validShortCastle(board, 'H' + chessPos[1], piece, canCastle, registry)) {
        moves.push(convertToAction('G' + chessPos[1], ACTION_TYPES.CASTLE));
    }

    return moves;
};

/**
 * Generates possible moves for a piece
 * 
 * @param {import('../../types').Board} board The board to generate moves from
 * @param {import('../../types').ChessPos} chessPos The position of the piece
 * @param {{
 *   1: boolean,
 *   2: boolean,
 * }} canCastle The details of the castling ability of the player
 * @param {import('../../types').PawnRegistry} registry The pawn registry
 * @param {import('../../types').ChessPos} kingPos The position of the king
 * @param {import('../../types').ChessPos | undefined} ignore The piece to ignore
 * @param {import('../../types').ChessPos | undefined} enPassant The position of the pawn that opened an en passant move
 * @returns {import('../../types').Action[]} An array of possible moves
 */
const generateMovesForPiece = (board, chessPos, canCastle, registry, kingPos, ignore, enPassant) => {
    const piece = ignore || getPieceAt(board, chessPos);
    let actions = [];

    // Checks if a piece was found
    if (!piece) {
        return [];
    }

    // Figures out what type of piece it is
    if (isPiece(piece, PIECE_VALUES.PAWN)) {
        actions = generatePawnMoves(board, chessPos, piece, registry, enPassant);
    } else if (isPiece(piece, PIECE_VALUES.ROOK)) {
        actions = generateRookMoves(board, chessPos, piece);
    } else if (isPiece(piece, PIECE_VALUES.KNIGHT)) {
        actions = generateKnightMoves(board, chessPos, piece);
    } else if (isPiece(piece, PIECE_VALUES.BISHOP)) {
        actions = generateBishopMoves(board, chessPos, piece);
    } else if (isPiece(piece, PIECE_VALUES.QUEEN)) {
        actions = generateQueenMoves(board, chessPos, piece);
    } else if (isPiece(piece, PIECE_VALUES.KING)) {
        return generateKingMoves(board, chessPos, piece, canCastle, registry);
    } else {
        return [];
    }

    // Filters out any moves that would put the king in check
    return actions.filter((action) => {
        const nextBoard = movePiece(copyBoard(board), chessPos, action.substring(0, 2));

        return isSafe(nextBoard, kingPos, undefined, registry);
    })
}

/**
 * Executes an action on the board and sees if it keeps the king safe
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').PawnRegistry} registry The pawn registry
 * @param {import('../../types').ChessPos} piecePos The position of the piece to move
 * @param {import('../../types').Action} action The action to execute
 * @param {import('../../types').ChessPos} kingPos The position of the king
 * @returns {Boolean} The updated board
 */
const exitsCheck = (board, registry, piecePos, action, kingPos) => {
    // Executes the action on a clone board
    const nextBoard = executeAction(copyBoard(board), piecePos, action, {});

    // If the king is not moved, we can use the king's position to check if the move is safe
    const newKingChessPos = piecePos === kingPos ? action.substring(0, 2) : kingPos;

    return isSafe(nextBoard, newKingChessPos, undefined, registry);
}

/**
 * Validates a given move by generating all possible moves for the piece and checking if the move is in the list
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {{
 *   piecePos: import('../../types').ChessPos,
 *   action: import('../../types').Action,
 * }} actionDetails The details of the action to validate
 * @param {{
 *   1: boolean,
 *   2: boolean,
 * }} canCastle The details of the castling ability of the player
 * @param {import('../../types').PawnRegistry} registry The pawn registry
 * @param {import('../../types').ChessPos} kingPos The position of the king
 * @param {import('../../types').ChessPos | undefined} ignore The piece to ignore
 * @param {import('../../types').ChessPos | undefined} enPassant The position of the pawn that opened an en passant move
 * @returns {{
 *   error: import('../../types').GameValidationMessage | null
 * }} The result of the validation
 */
export const validateMove = (board, { piecePos, action }, canCastle, registry = {}, kingPos = 'XX', ignore, enPassant) => {
    // Generates all possible moves for the piece
    const actions = generateMovesForPiece(board, piecePos, canCastle, registry, kingPos, ignore, enPassant);

    // Checks if the action is in the list of possible moves
    if (!actions.includes(action)) {
        return {
            error: GAME_VALIDATION_MESSAGES.INVALID_ACTION
        };
    }

    return { error: null };
}

/**
 * Generates all possible moves for a player
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').Piece} player The player to generate moves for
 * @param {import('../../types').ChessPos} positions The positions of the pieces
 * @param {import('../../types').PawnRegistry} registry The pawn registry
 * @param {{
 *   1: boolean,
 *   2: boolean,
 * }} canCastle The details of the castling ability of the player
 * @param {import('../../types').ChessPos | undefined} enPassant The position of the pawn that opened an en passant move
 * @returns {{
 *   actions: {
 *     [key: import('../../types').Piece]: import('../../types').Action[]
 *   },
 *   isKingSafe: boolean
 * }} The possible actions for the player and whether the king is safe
 */
export const getTurnInfo = (board, player, positions, registry, canCastle, enPassant) => {
    const actions = {};
    const isKingSafe = isSafe(board, positions[player + PIECE_VALUES.KING], undefined, registry);

    // Generates all possible moves for all pieces controlled by the player
    Object.keys(positions).forEach((piece) => {
        if (isColor(piece, player)) {
            if (positions[piece] !== 'XX') {
                actions[piece] = generateMovesForPiece(
                    board,
                    positions[piece],
                    canCastle,
                    registry,
                    positions[player + PIECE_VALUES.KING],
                    piece,
                    enPassant,
                );
            } else {
                actions[piece] = [];
            }
        }
    });

    // Filters out any moves don't save the king if it is in check
    if (!isKingSafe) {
        Object.keys(actions).forEach((piece) => {
            actions[piece] = actions[piece].filter((move) => {
                return exitsCheck(board, registry, positions[piece], move, positions[player + PIECE_VALUES.KING]);
            });
        });
    }

    return { actions, isKingSafe };
}

/**
 * Moves a piece on the board
 *
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} start The position to move the piece from
 * @param {import('../../types').ChessPos} end The position to move the piece to
 * @returns {import('../../types').Board} The updated board
 */
export const movePiece = (board, start, end) => {
    board[end] = board[start];
    board[start] = PIECE_VALUES.EMPTY;

    return board;
}

/**
 * Places a piece on the board
 *
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} chessPos The position to place the piece
 * @param {import('../../types').Piece} piece The piece to place
 * @returns {import('../../types').Board} The updated board
 */
export const placePiece = (board, chessPos, piece) => {
    // Only place the piece if it is not a captured piece
    if (chessPos !== CAPTURED_PIECE) {
        board[chessPos] = piece;
    }

    return board;
}

/**
 * Removes a piece from the board
 * 
 * @param {import('../../types').Board} board The board to use
 * @param {import('../../types').ChessPos} chessPos The position to remove the piece from
 * @returns {import('../../types').Board} The updated board
 */
export const removePiece = (board, chessPos) => {
    delete board[chessPos];

    return board;
}

/**
 * Creates the initial board state
 * 
 * @returns {import('../../types').Board} The initial board state
 */
export const createInitialBoard = () => {
    const board = {};

    Object.keys(INITIAL_BOARD_POSITIONS).forEach((piece) => {
        board[INITIAL_BOARD_POSITIONS[piece]] = piece;
    });

    return board;
}