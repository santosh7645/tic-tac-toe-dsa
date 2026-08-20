// ==========================================
// TIC-TAC-TOE FRONTEND
// Connected to Node.js + Express Backend
// ==========================================

// Fix viewport height for mobile
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", `${vh}px`);


// ==========================================
// GAME VARIABLES
// ==========================================

let player_mark;
let opponent_mark;
let curr_turn;
let ai_level;

const BACKEND_URL = "https://tic-tac-toe-dsa.onrender.com";

const redX = "#F83157";
const greenO = "green";

const winning_combos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// 0 = empty, X/O = occupied
let origBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];


// ==========================================
// DOM ELEMENTS
// ==========================================

const bg_img = document.getElementById("illus");
const menu_div = document.getElementById("menu");
const game_div = document.getElementById("game");
const matches = document.getElementById("matches");
const timer = document.getElementById("time");
const msg = document.getElementById("msg");
const cells = document.querySelectorAll("#board td");
const scoreboard = document.getElementById("scoreboard");

const player1_score = document.getElementById("player1_score");
const player2_score = document.getElementById("player2_score");
const draw_score = document.getElementById("draw_score");

let seconds = 0;
let timer_is_on = false;
let t;

let processingMove = false;


// ==========================================
// TIMER
// ==========================================

function padnum(num) {
    if (num <= 9) {
        num = `0${num}`;
    }

    return num;
}


function timedCount() {
    const mins = padnum(Math.floor(seconds / 60));
    const secs = padnum(seconds % 60);

    timer.innerHTML = `${mins}:${secs}`;

    seconds++;

    t = setTimeout(timedCount, 1000);
}


function startCount() {
    if (!timer_is_on) {
        timer_is_on = true;
        timedCount();
    }
}


function stopCount() {
    clearTimeout(t);
    timer_is_on = false;
}


// ==========================================
// SHOW GAME / MENU
// ==========================================

function show_game() {
    menu_div.style.animationName = "slide-menu-up";
    game_div.style.animationName = "slide-game-up";
    bg_img.style.animationName = "fadeout";

    scoreboard.style.bottom = "0";

    matches.innerHTML = "0";

    seconds = 0;
    timer.innerHTML = "00:00";

    player1_score.innerHTML = "0";
    player2_score.innerHTML = "0";
    draw_score.innerHTML = "0";
}


function show_menu() {
    menu_div.style.animationName = "slide-menu-down";
    game_div.style.animationName = "slide-game-down";
    bg_img.style.animationName = "fadein";

    scoreboard.style.bottom = "-100px";

    stopCount();
}


// ==========================================
// PLAYER / AI DATA
// ==========================================

function get_data(opponent) {

    if (document.getElementById("x").checked) {

        player_mark = "X";
        opponent_mark = "O";

        document.getElementById("player1").className = "mark_inactive";
        document.getElementById("player2").className = "mark_inactive";

        document.getElementById("player1_mark").innerHTML = `${player_mark} `;
        document.getElementById("player1_mark").style.color = redX;

        document.getElementById("player2_mark").innerHTML = `${opponent_mark} `;
        document.getElementById("player2_mark").style.color = greenO;

    } else {

        player_mark = "O";
        opponent_mark = "X";

        document.getElementById("player1").className = "mark_inactive";
        document.getElementById("player2").className = "mark_inactive";

        document.getElementById("player1_mark").innerHTML = `${player_mark} `;
        document.getElementById("player1_mark").style.color = greenO;

        document.getElementById("player2_mark").innerHTML = `${opponent_mark} `;
        document.getElementById("player2_mark").style.color = redX;
    }


    if (opponent === "ai") {

        const diff_list = document.querySelectorAll(".carousel-item");

        diff_list.forEach((tag) => {

            if (tag.classList.contains("active")) {
                ai_level = tag.id;
            }

        });

        document.getElementById("level").style.display = "block";

        if (ai_level === "E") {
            document.getElementById("diff_chosen").innerHTML = "Easy";
        } else if (ai_level === "M") {
            document.getElementById("diff_chosen").innerHTML = "Medium";
        } else {
            document.getElementById("diff_chosen").innerHTML = "Impossible";
        }

        document.getElementById("player2").innerHTML = "AI";

    } else {

        ai_level = -1;

        document.getElementById("level").style.display = "none";
        document.getElementById("player2").innerHTML = "Player 2";
    }
}


// ==========================================
// MESSAGE
// ==========================================

function start_msg(turn) {

    const name =
        turn === player_mark
            ? `Player 1 (${turn})`
            : ai_level === -1
                ? `Player 2 (${turn})`
                : `AI (${turn})`;

    msg.innerHTML = `${name} Starts`;

    msg.style.animationDelay = "0.3s";
    msg.style.animationName = "slide-in";

    setTimeout(() => {

        msg.style.animationName = "slide-out";

        startCount();

        check_ai_turn();

    }, 1500);
}


function winner_msg(winner) {

    const name =
        winner === player_mark
            ? `Player 1 (${winner})`
            : ai_level === -1
                ? `Player 2 (${winner})`
                : `AI (${winner})`;

    msg.innerHTML = `${name} Wins!`;

    stopCount();

    msg.style.animationDelay = "0s";
    msg.style.animationName = "slide-in";
}


function draw_msg() {

    msg.innerHTML = "Draw!";

    stopCount();

    msg.style.animationDelay = "0s";
    msg.style.animationName = "slide-in";
}


// ==========================================
// TOSS
// ==========================================

function toss() {

    if (Math.round(Math.random()) === 0) {
        return player_mark;
    }

    return opponent_mark;
}


// ==========================================
// RESET FRONTEND BOARD
// ==========================================

function reset() {

    origBoard = [
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
    ];

    cells.forEach((cell) => {

        cell.innerHTML = "";
        cell.style.backgroundColor = "";
        cell.style.opacity = "1";
        cell.style.color = "";

    });

    remove_event();

    processingMove = false;
}


// ==========================================
// RESET BACKEND
// ==========================================

async function resetBackend() {

    try {

        const response = await fetch(
            `${BACKEND_URL}/api/game/reset`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        console.log("Backend reset:", data);

        return data;

    } catch (error) {

        console.error(
            "Could not reset backend:",
            error
        );

        return null;
    }
}


// ==========================================
// EVENT HANDLERS
// ==========================================

function add_event() {

    cells.forEach((cell) => {

        cell.addEventListener("mouseover", turnmouse);
        cell.addEventListener("mouseleave", turnmouse);
        cell.addEventListener("click", turnmouse);

        cell.style.cursor = "pointer";

    });
}


function remove_event() {

    cells.forEach((cell) => {

        cell.removeEventListener("mouseover", turnmouse);
        cell.removeEventListener("mouseleave", turnmouse);
        cell.removeEventListener("click", turnmouse);

        cell.style.cursor = "default";

    });
}


function turnmouse(event) {

    turn(
        event.target.id,
        curr_turn,
        event.type
    );
}


// ==========================================
// ACTIVE PLAYER
// ==========================================

function active_player() {

    document.getElementById("player1").className =
        "mark_inactive";

    document.getElementById("player2").className =
        "mark_inactive";

    if (player_mark === curr_turn) {

        document.getElementById("player1").className =
            `mark_${curr_turn}_active`;

    } else {

        document.getElementById("player2").className =
            `mark_${curr_turn}_active`;
    }
}


// ==========================================
// EASY AI
// ==========================================

function easy_level() {

    const available = [];

    for (let i = 0; i < origBoard.length; i++) {

        if (origBoard[i] === 0) {
            available.push(i);
        }

    }

    if (available.length === 0) {
        return null;
    }

    return available[
        Math.floor(Math.random() * available.length)
    ];
}


// ==========================================
// MEDIUM AI
// ==========================================

function medium_level(board, player) {

    const available = [];

    for (let i = 0; i < board.length; i++) {

        if (board[i] === 0) {
            available.push(i);
        }

    }

    if (checkWin(board, opponent_mark)) {
        return {
            score: -10
        };
    }

    if (checkWin(board, player_mark)) {
        return {
            score: 10
        };
    }

    if (available.length === 0) {
        return {
            score: 0
        };
    }

    const moves = [];

    for (let i = 0; i < available.length; i++) {

        const move = {};

        move.index = available[i];

        board[available[i]] = player;

        let result;

        if (player === opponent_mark) {
            result = medium_level(
                board,
                player_mark
            );
        } else {
            result = medium_level(
                board,
                opponent_mark
            );
        }

        move.score = result.score;

        board[available[i]] = 0;

        moves.push(move);
    }

    let bestMove;

    // Random move sometimes
    if (Math.random() > 0.8) {

        bestMove =
            Math.floor(Math.random() * moves.length);

    } else if (player === opponent_mark) {

        let bestScore = Infinity;

        for (let i = 0; i < moves.length; i++) {

            if (moves[i].score < bestScore) {

                bestScore = moves[i].score;
                bestMove = i;

            }
        }

    } else {

        let bestScore = -Infinity;

        for (let i = 0; i < moves.length; i++) {

            if (moves[i].score > bestScore) {

                bestScore = moves[i].score;
                bestMove = i;

            }
        }
    }

    return moves[bestMove];
}


// ==========================================
// LOCAL IMPOSSIBLE MINIMAX
// Backup only
// ==========================================

function minimax(
    board,
    depth,
    alpha,
    beta,
    player
) {

    const available = [];

    for (let i = 0; i < board.length; i++) {

        if (board[i] === 0) {
            available.push(i);
        }

    }

    if (checkWin(board, opponent_mark)) {

        return {
            score: -20 + depth
        };

    }

    if (checkWin(board, player_mark)) {

        return {
            score: 20 - depth
        };

    }

    if (available.length === 0) {

        return {
            score: 0
        };

    }


    if (player === opponent_mark) {

        let bestScore = Infinity;
        let bestMove = {};

        for (let i = 0; i < available.length; i++) {

            board[available[i]] = player;

            const value = minimax(
                board,
                depth + 1,
                alpha,
                beta,
                player_mark
            );

            if (value.score < bestScore) {

                bestScore = value.score;

                bestMove.index =
                    available[i];

                bestMove.score =
                    bestScore;
            }

            board[available[i]] = 0;

            beta = Math.min(
                beta,
                bestScore
            );

            if (beta <= alpha) {
                break;
            }
        }

        return bestMove;

    } else {

        let bestScore = -Infinity;
        let bestMove = {};

        for (let i = 0; i < available.length; i++) {

            board[available[i]] = player;

            const value = minimax(
                board,
                depth + 1,
                alpha,
                beta,
                opponent_mark
            );

            if (value.score > bestScore) {

                bestScore = value.score;

                bestMove.index =
                    available[i];

                bestMove.score =
                    bestScore;
            }

            board[available[i]] = 0;

            alpha = Math.max(
                alpha,
                bestScore
            );

            if (beta <= alpha) {
                break;
            }
        }

        return bestMove;
    }
}


// ==========================================
// BACKEND AI
// ==========================================

async function backendAI() {

    try {

        const response = await fetch(
            `${BACKEND_URL}/api/game/ai-move`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    aiPlayer: opponent_mark,
                    humanPlayer: player_mark
                })
            }
        );

        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            "Backend AI response:",
            data
        );

        if (!data.success) {

            console.error(
                "AI error:",
                data.message
            );

            return null;
        }

        // Convert backend board
        // "" -> 0
        origBoard = data.board.map(
            (cell) => cell === "" ? 0 : cell
        );

        return data.move;

    } catch (error) {

        console.error(
            "Backend AI connection error:",
            error
        );

        return null;
    }
}


// ==========================================
// RENDER BOARD
// ==========================================

function renderBoard() {

    cells.forEach((cell) => {

        const index = Number(cell.id);
        const value = origBoard[index];

        cell.style.opacity = "1";

        if (value === 0) {

            cell.innerHTML = "";

        } else {

            cell.innerHTML = value;

            if (value === "X") {
                cell.style.color = redX;
            } else {
                cell.style.color = greenO;
            }

        }
    });
}


// ==========================================
// CHECK AI TURN
// ==========================================

async function check_ai_turn() {

    if (
        ai_level !== -1 &&
        curr_turn === opponent_mark
    ) {

        remove_event();

        processingMove = true;

        setTimeout(async () => {

            let aiMove = null;

            // Easy
            if (ai_level === "E") {

                aiMove = easy_level();

            }

            // Medium
            else if (ai_level === "M") {

                const result =
                    medium_level(
                        [...origBoard],
                        opponent_mark
                    );

                aiMove =
                    result ? result.index : null;

            }

            // Impossible
            else if (ai_level === "I") {

                // IMPORTANT:
                // Impossible AI is handled by backend
                aiMove = await backendAI();

            }


            if (aiMove === null) {

                processingMove = false;
                return;

            }


            // For Easy/Medium we need to update backend too
            if (
                ai_level === "E" ||
                ai_level === "M"
            ) {

                try {

                    const response = await fetch(
                        `${BACKEND_URL}/api/game/move`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                position:
                                    Number(aiMove),

                                player:
                                    opponent_mark
                            })
                        }
                    );

                    const data =
                        await response.json();

                    console.log(
                        "Backend AI move:",
                        data
                    );

                } catch (error) {

                    console.error(
                        "Backend AI move error:",
                        error
                    );
                }
            }


            // For backend Impossible AI,
            // origBoard was already updated
            if (
                ai_level === "E" ||
                ai_level === "M"
            ) {

                origBoard[aiMove] =
                    opponent_mark;
            }


            renderBoard();


            // Check AI win
            const aiWon =
                checkWin(
                    origBoard,
                    opponent_mark
                );

            if (aiWon) {

                gameOver(aiWon);

                processingMove = false;

                return;
            }


            // Check draw
            if (checkTie()) {

                processingMove = false;

                return;
            }


            // Change turn
            curr_turn = player_mark;

            active_player();

            processingMove = false;

            add_event();

        }, 700);

    } else {

        add_event();
    }
}


// ==========================================
// PLAYER / AI MOVE
// ==========================================

async function turn(
    cell_index,
    mark,
    mouseevent
) {

    const index = Number(cell_index);

    const cell =
        document.getElementById(index);


    // Invalid cell
    if (!cell) {
        return;
    }


    // Cell already occupied
    if (origBoard[index] !== 0) {
        return;
    }


    // Ignore mouse actions during AI
    if (processingMove) {
        return;
    }


    // ======================================
    // MOUSEOVER
    // ======================================

    if (mouseevent === "mouseover") {

        cell.style.opacity = "0.5";
        cell.style.color = "gray";
        cell.innerHTML = mark;

        return;
    }


    // ======================================
    // MOUSELEAVE
    // ======================================

    if (mouseevent === "mouseleave") {

        cell.style.opacity = "1";
        cell.innerHTML = "";

        return;
    }


    // ======================================
    // CLICK
    // ======================================

    if (mouseevent !== "click") {
        return;
    }


    // Only player can click
    if (mark !== player_mark) {
        return;
    }


    processingMove = true;

    remove_event();


    // ======================================
    // FRIEND MODE
    // ======================================

    if (ai_level === -1) {

        origBoard[index] = mark;

        renderBoard();

        const gameWon =
            checkWin(
                origBoard,
                mark
            );

        if (gameWon) {

            gameOver(gameWon);

            processingMove = false;

            return;
        }


        if (checkTie()) {

            processingMove = false;

            return;
        }


        curr_turn =
            curr_turn === "X"
                ? "O"
                : "X";

        active_player();

        processingMove = false;

        add_event();

        return;
    }


    // ======================================
    // AI MODE
    // ======================================

    try {

        // Send player move to backend
        const response = await fetch(
            `${BACKEND_URL}/api/game/move`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    position: index,
                    player: mark
                })
            }
        );


        const data =
            await response.json();


        console.log(
            "Backend player move:",
            data
        );


        if (!data.success) {

            console.error(
                "Move rejected:",
                data.message
            );

            processingMove = false;

            add_event();

            return;
        }


        // Get board from backend
        origBoard =
            data.board.map(
                (cell) =>
                    cell === ""
                        ? 0
                        : cell
            );


        renderBoard();


        // Check winner returned by backend
        if (data.winner === mark) {

            const gameWon =
                checkWin(
                    origBoard,
                    mark
                );

            if (gameWon) {
                gameOver(gameWon);
            }

            processingMove = false;

            return;
        }


        // Check draw
        if (data.winner === "draw") {

            checkTie();

            processingMove = false;

            return;
        }


        // Change to AI
        curr_turn =
            opponent_mark;

        active_player();

        processingMove = false;

        // AI's turn
        await check_ai_turn();

    } catch (error) {

        console.error(
            "Backend connection error:",
            error
        );

        alert(
            "Backend is not connected. Please run node server.js"
        );

        processingMove = false;

        add_event();
    }
}


// ==========================================
// CHECK DRAW
// ==========================================

function checkTie() {

    for (
        let i = 0;
        i < origBoard.length;
        i++
    ) {

        if (origBoard[i] === 0) {
            return false;
        }
    }


    remove_event();

    document.getElementById(
        "next_match"
    ).disabled = false;

    draw_msg();

    matches.innerHTML =
        parseInt(matches.innerHTML) + 1;

    draw_score.innerHTML =
        parseInt(draw_score.innerHTML) + 1;

    return true;
}


// ==========================================
// CHECK WIN
// ==========================================

function checkWin(board, player) {

    let gameWon = null;

    for (
        let i = 0;
        i < winning_combos.length;
        i++
    ) {

        const combo =
            winning_combos[i];

        if (
            board[combo[0]] === player &&
            board[combo[1]] === player &&
            board[combo[2]] === player
        ) {

            gameWon = {
                index: i,
                player: player
            };

            break;
        }
    }

    return gameWon;
}


// ==========================================
// GAME OVER
// ==========================================

function gameOver(gameWon) {

    for (let i = 0; i < 3; i++) {

        document.getElementById(
            winning_combos[
                gameWon.index
            ][i]
        ).style.backgroundColor =
            "#f5f52c";
    }


    remove_event();

    document.getElementById(
        "next_match"
    ).disabled = false;


    winner_msg(
        gameWon.player
    );


    matches.innerHTML =
        parseInt(matches.innerHTML) + 1;


    if (
        gameWon.player === player_mark
    ) {

        player1_score.innerHTML =
            parseInt(
                player1_score.innerHTML
            ) + 1;

    } else {

        player2_score.innerHTML =
            parseInt(
                player2_score.innerHTML
            ) + 1;
    }
}


// ==========================================
// START GAME
// ==========================================

async function play(opponent) {

    document.getElementById(
        "next_match"
    ).disabled = true;


    reset();


    get_data(opponent);


    // Reset backend only for AI games
    if (opponent === "ai") {

        await resetBackend();
    }


    curr_turn = toss();


    start_msg(curr_turn);


    active_player();
}


// ==========================================
// NEXT MATCH
// ==========================================

function next_match() {

    document.getElementById(
        "next_match"
    ).disabled = true;


    msg.style.animationName =
        "slide-out";


    setTimeout(() => {

        if (ai_level === -1) {

            play("frnd");

        } else {

            play("ai");
        }

    }, 500);
}