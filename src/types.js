import { PIECE_VALUES } from "./utils/enum"

/**
 * @typedef {String} GameMessage
 * 
 * A message that represents a game state. It is a string that has
 * the following format:
 * 
 * [A-H][1-8]{32},{typeof PIECE_COLORS},[T|F]{4}
 * 
 * The first part of the string is the board, which is 32 pairs of
 * 2 characters. The first character is the letter of the column
 * and the second character is the number of the row.
 * 
 * The second part of the string is the color of the player who made the turn.
 * 
 * The third part of the string is whether or not each color can castle. The first
 * two characters are whether the left and right rooks of the white player can castle.
 * The third and fourth characters are whether the left and right rooks of the black
 * player can castle.
 */

/**
 * @typedef {String} Action
 * 
 * An action is a string that represents a action type and where it is being
 * executed. It has the following format:
 * [A-H][1-8][ActionType]
 */

/**
 * @typedef {String} Piece
 * 
 * A piece is a string that represents a piece in the game. It has the following
 * format:
 * [typeof PIECE_COLORS][typeof PIECE_VALUES](PIECE_NUMBER?)
 * ex. WP1, BR2, WQ, BK
 * 
 * The first character is the color of the piece. The second character is the type
 * of the piece. The third character is the number of the piece. This is optional
 * and not used for queens and kings.
 */

/**
 * @typedef {String} ChessPos
 * 
 * A chess position is a string that represents a position on the board. It has
 * the following format:
 * [A-H][1-8]
 * 
 * The first character is the letter of the column and the second character is
 * the number of the row.
 */

/**
 * @typedef {{
 *   [key: Piece]: PIECE_VALUES[keyof PIECE_VALUES]
 * }} PawnRegistry
 * 
 * The pawn registry keeps track of all transformed pawns. It is a map of
 * pawns to their transformed piece type
 */

/**
 * @typedef {{
 *   [position: ChessPos]: [piece: Piece]
 * }} Board
 * 
 * The board is a map of chess positions to pieces. It keeps track of the
 * chess positions that have pieces on them. Does not keep track of dead
 * pieces.
 */

/**
 * @typedef {{
 *   [piece: Piece]: [position: ChessPos]
 * }} Positions
 * 
 * The positions is a map of pieces to their current position. It keeps track
 * of the current position of all pieces. Does keep track of dead pieces.
 */

/**
 * @typedef {{
 *   [piece: Piece]: [lastPos: ChessPos, currPos: ChessPos]
 * }} TurnDifferences
 * 
 * The turn difference is a map of pieces to their last position and their
 * current position. The key is a chess piece and the value is a tuple of
 * the last position and the current position.
 */
