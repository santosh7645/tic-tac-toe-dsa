const express = require("express");
const cors = require("cors");

const {
    checkWinner,
    makeMove,
    getBestMove
} = require("./gameLogic");

const app = express();

const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {

    res.json({
        message: "Tic-Tac-Toe Backend is running!"
    });

});


// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Backend API is working!"
    });

});


// ===============================
// GAME BOARD
// ===============================

let board = [
    "", "", "",
    "", "", "",
    "", "", ""
];


// ===============================
// GET GAME STATE
// ===============================

app.get("/api/game/state", (req, res) => {

    res.json({
        success: true,
        board: board,
        winner: checkWinner(board)
    });

});


// ===============================
// PLAYER MOVE
// ===============================

app.post("/api/game/move", (req, res) => {

    const { position, player } = req.body;


    if (!["X", "O"].includes(player)) {

        return res.status(400).json({
            success: false,
            message: "Invalid player"
        });

    }


    const result = makeMove(
        board,
        position,
        player
    );


    res.json(result);

});


// ===============================
// AI MOVE
// ===============================

app.post("/api/game/ai-move", (req, res) => {

    const {
        aiPlayer,
        humanPlayer
    } = req.body;


    if (
        !["X", "O"].includes(aiPlayer) ||
        !["X", "O"].includes(humanPlayer)
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid players"
        });

    }


    const move = getBestMove(
        board,
        aiPlayer,
        humanPlayer
    );


    if (move === null) {

        return res.json({
            success: false,
            message: "No moves available",
            board: board,
            winner: checkWinner(board)
        });

    }


    board[move] = aiPlayer;


    res.json({

        success: true,

        move: move,

        board: board,

        winner: checkWinner(board)

    });

});


// ===============================
// RESET GAME
// ===============================

app.post("/api/game/reset", (req, res) => {

    board = [
        "", "", "",
        "", "", "",
        "", "", ""
    ];


    res.json({

        success: true,

        board: board,

        winner: null

    });

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running on port ${PORT}`
    );

});