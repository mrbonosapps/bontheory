// 1. ISOLATED STATE: This cannot collide with anything in index.html!
let gameState = {
    running: false,
    score: 0,
    round: 1
};

// 2. INTERNAL FUNCTIONS: Write all your game logic here
function handleGameClick() {
    gameState.score++;
    // You can even use your existing global functions like playTonePitch!
    if (window.playTonePitch) window.playTonePitch(440, 0.1, 0.3, 'sine');
    renderGameUI(document.getElementById('embedded-tool-container'));
}

function renderGameUI(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="bg-slate-900 p-8 rounded-3xl text-white text-center">
            <h2 class="text-2xl font-black text-amber-400">My New Modular Game</h2>
            <p class="mt-4">Score: ${gameState.score}</p>
            <button id="new-game-btn" class="mt-4 px-6 py-3 bg-indigo-600 rounded-xl font-bold">
                Click Me!
            </button>
        </div>
    `;

    // Attach events using JavaScript so we don't pollute the HTML with inline onclicks
    document.getElementById('new-game-btn').addEventListener('click', handleGameClick);
}

// 3. THE BRIDGE: Expose ONLY the start/stop functions to your main app
window.mountMyNewGame = function(container) {
    gameState.score = 0;
    gameState.running = true;
    renderGameUI(container);
};

window.stopMyNewGame = function() {
    gameState.running = false;
};

