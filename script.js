const canvas = document.getElementById('gameMap');
const ctx = canvas.getContext('2d');
const mapContainer = document.getElementById('map-section');
const cmdInput = document.getElementById('commandInput');
const gridSize = 25;

const state = {
    player: { x: 4, y: 4, hp: 100, fuel: 100, alive: true },
    port: { x: 0, y: 0 },
    items: [],
    isRunning: false,
    intervals: { hp: null, fuel: null }
};

// --- NASTAVENÍ MAPY ---
function resizeCanvas() {
    canvas.width = mapContainer.clientWidth;
    canvas.height = mapContainer.clientHeight;
    state.port.x = Math.floor(canvas.width / gridSize) - 3;
    state.port.y = Math.floor(canvas.height / gridSize) - 3;
    
    if (state.items.length === 0) {
        for(let i=0; i<15; i++) {
            state.items.push({
                x: Math.floor(Math.random() * (canvas.width/gridSize - 2)) + 1,
                y: Math.floor(Math.random() * (canvas.height/gridSize - 2)) + 1,
                type: Math.random() > 0.4 ? 'L' : 'P'
            });
        }
    }
    draw();
}

window.addEventListener('resize', resizeCanvas);

// --- KRESLENÍ ---
function draw() {
    ctx.fillStyle = "#000011";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mřížka
    ctx.strokeStyle = "#000033";
    for(let x=0; x<canvas.width; x+=gridSize) { 
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); 
    }
    for(let y=0; y<canvas.height; y+=gridSize) { 
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); 
    }

    // Přístav
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(state.port.x * gridSize + 2, state.port.y * gridSize + 2, gridSize - 4, gridSize - 4);
    if(Date.now() % 1000 < 500) {
        ctx.fillStyle = "rgba(0, 255, 255, 0.4)";
        ctx.fillRect(state.port.x * gridSize + 5, state.port.y * gridSize + 5, gridSize - 10, gridSize - 10);
    }

    // Předměty (Lékárničky a Palivo)
    state.items.forEach(it => {
        ctx.fillStyle = it.type === 'L' ? "#ff0000" : "#ffff00";
        ctx.beginPath();
        ctx.arc(it.x * gridSize + gridSize/2, it.y * gridSize + gridSize/2, gridSize/4, 0, Math.PI*2);
        ctx.fill();
    });

    // Loď
    ctx.save();
    ctx.translate(state.player.x * gridSize + gridSize/2, state.player.y * gridSize + gridSize/2);
    ctx.fillStyle = "#00ff41";
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(8, 8); ctx.lineTo(-8, 8); ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Fog of War
    const grad = ctx.createRadialGradient(
        state.player.x * gridSize + gridSize/2, state.player.y * gridSize + gridSize/2, gridSize,
        state.player.x * gridSize + gridSize/2, state.player.y * gridSize + gridSize/2, gridSize * 6
    );
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "rgba(0,0,10,0.96)");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0, canvas.width, canvas.height);
}

// --- LOGIKA ---
function log(msg, type = "") {
    const div = document.createElement('div');
    if (type) div.className = type;
    div.textContent = msg;
    const output = document.getElementById('output');
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
}

function updateHUD() {
    document.getElementById('pos-x').textContent = state.player.x;
    document.getElementById('pos-y').textContent = state.player.y;
    document.getElementById('hp').textContent = state.player.hp;
    document.getElementById('fuel').textContent = state.player.fuel;
    draw();
}

function move(dx, dy, dist = 1) {
    dist = parseInt(dist) || 1;
    let count = 0;
    for(let i=0; i<dist; i++) {
        if (!state.player.alive || state.player.fuel <= 0) break;

        let newX = state.player.x + dx;
        let newY = state.player.y + dy;

        if(newX >= 0 && newX < canvas.width/gridSize && newY >= 0 && newY < canvas.height/gridSize) {
            state.player.x = newX;
            state.player.y = newY;
            count++;
        } else {
            log("Hranice sektoru!", "warning");
            break;
        }

        state.items.forEach((it, idx) => {
            if(it.x === state.player.x && it.y === state.player.y) {
                log(`Sběr: ${it.type === 'L' ? 'Lékárnička' : 'Palivo'}`, "success");
                if(it.type === 'L') state.player.hp = Math.min(100, state.player.hp + 20);
                else state.player.fuel = Math.min(100, state.player.fuel + 20);
                state.items.splice(idx, 1);
            }
        });
    }
    if(count > 0) log(`Přesun: ${count} bloků.`);
    updateHUD();
}

function gameOver(reason) {
    state.isRunning = false;
    clearInterval(state.intervals.hp); 
    clearInterval(state.intervals.fuel);
    document.getElementById('status').textContent = "CRITICAL";
    log(`!!! ${reason} !!!`, "error");
}

// --- PARSER ---
cmdInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        const parts = e.target.value.toLowerCase().trim().split(" ");
        const cmd = parts[0];
        const arg = parts[1];
        e.target.value = '';
        log(`> ${cmd}${arg ? ' ' + arg : ''}`);

        if(cmd === 'play') {
            if(state.isRunning) return;
            state.isRunning = true;
            document.getElementById('status').textContent = "RUNNING";
            state.intervals.hp = setInterval(() => { 
                state.player.hp--; 
                if(state.player.hp <= 0) gameOver("Kritické poškození trupu."); 
                updateHUD(); 
            }, 1500);
            state.intervals.fuel = setInterval(() => { 
                state.player.fuel--; 
                if(state.player.fuel <= 0) gameOver("Palivo vyčerpáno."); 
                updateHUD(); 
            }, 4000); // 4 sekundy na jednotku
            log("Systémy online.", "success");
        } 
        else if(cmd === 'stop') {
            state.isRunning = false;
            document.getElementById('status').textContent = "STANDBY";
            clearInterval(state.intervals.hp); 
            clearInterval(state.intervals.fuel);
            log("Standby režim.");
        }
        else if(cmd === 'reset') location.reload();
        else if(!state.isRunning && ['vpred','vzad','vlevo','vpravo','zalodit'].includes(cmd)) {
            log("Chyba: Motory vypnuty.", "error");
        }
        else {
            switch(cmd) {
                case 'vpred':  move(0, -1, arg); break;
                case 'vzad':   move(0, 1, arg); break;
                case 'vlevo':  move(-1, 0, arg); break;
                case 'vpravo': move(1, 0, arg); break;
                case 'zalodit':
                    if(state.player.x === state.port.x && state.player.y === state.port.y) {
                        log("MISE SPLNĚNA: Přístav dosažen!", "success");
                        state.isRunning = false;
                        clearInterval(state.intervals.hp); 
                        clearInterval(state.intervals.fuel);
                        document.getElementById('status').textContent = "DOCKED";
                    } else log("Nelze zalodit - jsi mimo souřadnice.", "error");
                    break;
                default: log("Neplatný příkaz.", "error");
            }
        }
    }
});

// Start
resizeCanvas();
setInterval(draw, 200);