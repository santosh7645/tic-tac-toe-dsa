const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];


// Check winner
function checkWinner(board) {

    for (const pattern of winningPatterns) {

        const [a, b, c] = pattern;

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return board[a];
        }
    }

    // Draw
    if (board.every(cell => cell !== "")) {
        return "draw";
    }

    return null;
}


// Get empty positions
function getAvailableMoves(board) {

    const moves = [];

    for (let i = 0; i < board.length; i++) {

        if (board[i] === "") {
            moves.push(i);
        }

    }

    return moves;
}


// Make player move
function makeMove(board, position, player) {

    if (
        typeof position !== "number" ||
        position < 0 ||
        position > 8
    ) {
        return {
            success: false,
            message: "Invalid position"
        };
    }

    if (!["X", "O"].includes(player)) {
        return {
            success: false,
            message: "Invalid player"
        };
    }

    if (board[position] !== "") {
        return {
            success: false,
            message: "Cell is already occupied"
        };
    }

    board[position] = player;

    return {
        success: true,
        board: board,
        winner: checkWinner(board)
    };
}


// Minimax + Alpha-Beta Pruning
function minimax(board, depth, alpha, beta, maximizingPlayer, aiPlayer, humanPlayer) {

    const result = checkWinner(board);

    // Terminal states
    if (result === aiPlayer) {
        return 10 - depth;
    }

    if (result === humanPlayer) {
        return depth - 10;
    }

    if (result === "draw") {
        return 0;
    }


    const availableMoves = getAvailableMoves(board);


    // AI = Maximizing player
    if (maximizingPlayer) {

        let bestScore = -Infinity;

        for (const move of availableMoves) {

            board[move] = aiPlayer;

            const score = minimax(
                board,
                depth + 1,
                alpha,
                beta,
                false,
                aiPlayer,
                humanPlayer
            );

            board[move] = "";

            bestScore = Math.max(bestScore, score);

            alpha = Math.max(alpha, bestScore);

            // Alpha-Beta pruning
            if (beta <= alpha) {
                break;
            }
        }

        return bestScore;
    }


    // Human = Minimizing player
    else {

        let bestScore = Infinity;

        for (const move of availableMoves) {

            board[move] = humanPlayer;

            const score = minimax(
                board,
                depth + 1,
                alpha,
                beta,
                true,
                aiPlayer,
                humanPlayer
            );

            board[move] = "";

            bestScore = Math.min(bestScore, score);

            beta = Math.min(beta, bestScore);

            // Alpha-Beta pruning
            if (beta <= alpha) {
                break;
            }
        }

        return bestScore;
    }
}


// Find best AI move
function getBestMove(board, aiPlayer, humanPlayer) {

    const availableMoves = getAvailableMoves(board);

    let bestScore = -Infinity;
    let bestMove = null;


    for (const move of availableMoves) {

        board[move] = aiPlayer;

        const score = minimax(
            board,
            0,
            -Infinity,
            Infinity,
            false,
            aiPlayer,
            humanPlayer
        );

        board[move] = "";


        if (score > bestScore) {

            bestScore = score;
            bestMove = move;

        }
    }


    return bestMove;
}


module.exports = {
    checkWinner,
    makeMove,
    getAvailableMoves,
    getBestMove
};