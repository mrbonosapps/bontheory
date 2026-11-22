// ==========================================
// ELTON JOHN'S PIANO: GOLDEN GLISSANDO
// ==========================================

const pianoKeys = [
    { id: 0, note: 'C4', label: 'Low C', freq: 261.63, type: 'white' },
    { id: 1, note: 'C#4', label: 'C#', freq: 277.18, type: 'black', left: '11%' },
    { id: 2, note: 'D4', label: 'D', freq: 293.66, type: 'white' },
    { id: 3, note: 'D#4', label: 'D#', freq: 311.13, type: 'black', left: '25%' },
    { id: 4, note: 'E4', label: 'E', freq: 329.63, type: 'white' },
    { id: 5, note: 'F4', label: 'F', freq: 349.23, type: 'white' },
    { id: 6, note: 'F#4', label: 'F#', freq: 369.99, type: 'black', left: '54%' },
    { id: 7, note: 'G4', label: 'G', freq: 392.00, type: 'white' },
    { id: 8, note: 'G#4', label: 'G#', freq: 415.30, type: 'black', left: '68%' },
    { id: 9, note: 'A4', label: 'A', freq: 440.00, type: 'white' },
    { id: 10, note: 'A#4', label: 'A#', freq: 466.16, type: 'black', left: '82%' },
    { id: 11, note: 'B4', label: 'B', freq: 493.88, type: 'white' },
    { id: 12, note: 'C5', label: 'High C', freq: 523.25, type: 'white' }
];

let state = {
    running: false,
    round: 1,
    totalRounds: 5,
    score: 0,
    startKey: null,
    targetKey: null,
    currentKey: null,
    isSliding: false,
    completed: false
};

function setupRound() {
    // Pick a random start key
    state.startKey = Math.floor(Math.random() * pianoKeys.length);
    
    // Pick a target key ensuring the slide is greater than a major third (>4 semitones)
    let validTargets = pianoKeys.filter(k => Math.abs(k.id - state.startKey) >= 5);
    state.targetKey = validTargets[Math.floor(Math.random() * validTargets.length)].id;
    
    state.isSliding = false;
    state.currentKey = null;
}

function handlePointerDown(e) {
    if (!state.running || state.completed) return;
    
    // Use touch coordinates if available, otherwise mouse
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    const el = document.elementFromPoint(clientX, clientY);
    if (!el || !el.hasAttribute('data-key-id')) return;
    
    const keyId = parseInt(el.getAttribute('data-key-id'));
    
    if (keyId !== state.startKey) {
        if (window.playTonePitch) window.playTonePitch(150, 0.2, 0.3, 'sawtooth'); // Error buzz
        return;
    }

    state.isSliding = true;
    state.currentKey = keyId;
    if (window.playTonePitch) window.playTonePitch(pianoKeys[keyId].freq, 0.3, 0.4, 'triangle');
    renderUI(document.getElementById('embedded-tool-container'));
}

function handlePointerMove(e) {
    if (!state.isSliding) return;
    e.preventDefault(); // Prevent scrolling on mobile while sliding
    
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    const el = document.elementFromPoint(clientX, clientY);
    if (!el || !el.hasAttribute('data-key-id')) return;
    
    const keyId = parseInt(el.getAttribute('data-key-id'));
    
    if (keyId !== state.currentKey) {
        state.currentKey = keyId;
        if (window.playTonePitch) window.playTonePitch(pianoKeys[keyId].freq, 0.15, 0.4, 'triangle');
        
        // Optimize rendering by just updating classes instead of full DOM replacement to prevent lag
        updateKeyHighlights(); 
    }
}

function handlePointerUp(e) {
    if (!state.isSliding) return;
    state.isSliding = false;
    
    if (state.currentKey === state.targetKey) {
        state.score++;
        if (window.addTokens) window.addTokens(5);
        if (window.playTonePitch) {
            window.playTonePitch(659.25, 0.2, 0.4, 'sine');
            setTimeout(() => window.playTonePitch(783.99, 0.3, 0.4, 'sine'), 150);
        }
    } else {
        if (window.playTonePitch) window.playTonePitch(150, 0.4, 0.3, 'sawtooth');
    }

    if (state.round < state.totalRounds) {
        state.round++;
        setupRound();
    } else {
        state.completed = true;
    }
    
    renderUI(document.getElementById('embedded-tool-container'));
}

function updateKeyHighlights() {
    pianoKeys.forEach(k => {
        const btn = document.getElementById(`gold-key-${k.id}`);
        if (!btn) return;
        
        // Reset classes
        btn.classList.remove('ring-4', 'ring-emerald-400', 'ring-rose-400', 'brightness-125', 'z-20');
        
        if (k.id === state.startKey) btn.classList.add('ring-4', 'ring-emerald-400', 'z-20');
        if (k.id === state.targetKey) btn.classList.add('ring-4', 'ring-rose-400', 'z-20');
        if (k.id === state.currentKey) btn.classList.add('brightness-125', 'z-20');
    });
}

function renderUI(container) {
    if (!container) return;

    if (state.completed) {
        container.innerHTML = `
          <div class="bg-slate-900 rounded-3xl p-8 text-center text-white shadow-xl border border-amber-500/50">
            <div class="text-amber-400 text-5xl mb-4"><i class="fa-solid fa-keyboard"></i></div>
            <h2 class="text-3xl font-black mb-2 text-amber-400">Glissando Master!</h2>
            <p class="text-slate-300 mb-6">You successfully completed ${state.score} / ${state.totalRounds} glissandos and earned +${state.score * 5} Tokens!</p>
            <button onclick="window.mountEltonPianoGame(document.getElementById('app-viewport'))" class="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl text-sm transition-all shadow-md">
              Play Again
            </button>
          </div>
        `;
        return;
    }

    const startNoteName = pianoKeys[state.startKey].label;
    const targetNoteName = pianoKeys[state.targetKey].label;
    const direction = state.targetKey > state.startKey ? 'UP' : 'DOWN';

    container.innerHTML = `
        <div class="bg-slate-900 p-6 sm:p-8 rounded-3xl text-white space-y-6 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/50 pb-4">
                <div>
                    <span class="text-[11px] font-black uppercase tracking-widest text-amber-400">Solid Gold Piano • +5 Tokens</span>
                    <h3 class="text-xl font-black text-white">Golden Glissando Challenge</h3>
                    <p class="text-xs text-amber-200/70 mt-1">Press the glowing green key and <strong>SLIDE</strong> your finger (or mouse) ${direction} to the red target key!</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <span class="px-3 py-1.5 rounded-xl bg-amber-950 border border-amber-700 text-xs font-black text-amber-300">Round ${state.round} / ${state.totalRounds}</span>
                    <span class="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-xs font-black text-emerald-300">Score: ${state.score}</span>
                </div>
            </div>

            <div class="text-center bg-amber-950/40 p-4 rounded-xl border border-amber-500/30">
                <span class="text-sm font-black text-amber-100">
                    Start on <span class="text-emerald-400">${startNoteName}</span> and slide to <span class="text-rose-400">${targetNoteName}</span>
                </span>
            </div>

            <div class="relative flex justify-center h-48 w-full max-w-2xl mx-auto bg-amber-900 p-3 rounded-2xl shadow-inner touch-none select-none" id="elton-piano-board">
                <div class="relative flex w-full h-full">
                    ${pianoKeys.filter(k => k.type === 'white').map(k => `
                        <div id="gold-key-${k.id}" data-key-id="${k.id}" class="flex-1 h-full bg-gradient-to-b from-amber-100 to-amber-400 border-2 border-amber-600 rounded-b-lg text-amber-900 font-black text-sm flex items-end justify-center pb-3 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.2)] transition-all">
                            <span class="pointer-events-none">${k.label}</span>
                        </div>
                    `).join('')}
                    
                    ${pianoKeys.filter(k => k.type === 'black').map(k => `
                        <div id="gold-key-${k.id}" data-key-id="${k.id}" class="absolute top-0 w-[9%] h-[65%] bg-gradient-to-b from-amber-700 to-amber-950 border-2 border-amber-950 rounded-b-md text-amber-200 font-bold text-[10px] flex items-end justify-center pb-2 shadow-xl transition-all" style="left: ${k.left};">
                            <span class="pointer-events-none">${k.note}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    updateKeyHighlights();

    // Attach event listeners safely
    const board = document.getElementById('elton-piano-board');
    if (board) {
        board.addEventListener('pointerdown', handlePointerDown);
        board.addEventListener('pointermove', handlePointerMove);
        board.addEventListener('pointerup', handlePointerUp);
        board.addEventListener('pointerleave', handlePointerUp);
        
        // Touch specific for better mobile slide support
        board.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown(e); }, {passive: false});
        board.addEventListener('touchmove', (e) => { e.preventDefault(); handlePointerMove(e); }, {passive: false});
        board.addEventListener('touchend', (e) => { e.preventDefault(); handlePointerUp(e); }, {passive: false});
    }
}

// BRIDGE: Mount logic to global window
window.mountEltonPianoGame = function(container) {
    state.running = true;
    state.round = 1;
    state.score = 0;
    state.completed = false;
    setupRound();

    // Wrap the game in the standard app layout
    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <button onclick="window.stopEltonPianoGame(); window.app.navigate('shop')" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Rewards Shop
          </button>
          <span class="text-xs font-black uppercase text-amber-500 tracking-widest"><i class="fa-solid fa-keyboard"></i> Glissando Game</span>
        </div>
        <div id="embedded-tool-container"></div>
      </div>
    `;

    renderUI(document.getElementById('embedded-tool-container'));
};

window.stopEltonPianoGame = function() {
    state.running = false;
};
