const canvas = document.getElementById('gameMap');
const ctx = canvas.getContext('2d');
const mapContainer = document.getElementById('map-section');
const cmdInput = document.getElementById('commandInput');
const gridSize = 25;

const fuelImg = new Image();
const medkitImg = new Image();

fuelImg.src = "gas.svg";
medkitImg.src = "medkit.svg";

// jen pro jistotu — překreslí mapu po načtení
fuelImg.onload = () => draw();
medkitImg.onload = () => draw();



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
    // 1. Vyčištění plátna
    ctx.fillStyle = "#000011";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Předměty (Lékárničky a Palivo)
    state.items.forEach(it => {
        const px = it.x * gridSize;
        const py = it.y * gridSize;
        if (it.type === 'L') {
            if (medkitImg.complete) ctx.drawImage(medkitImg, px + 4, py + 4, gridSize - 8, gridSize - 8);
        } else {
            if (fuelImg.complete) ctx.drawImage(fuelImg, px + 4, py + 4, gridSize - 8, gridSize - 8);
        }
    });

    // 3. Přístav (Vykreslujeme ho POD mlhu a loď, aby zářil zespodu)
    const centerX = state.port.x * gridSize + gridSize / 2;
    const centerY = state.port.y * gridSize + gridSize / 2;
    const time = Date.now() * 0.002;

    // --- Glow základ ---
    ctx.save();
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 1;
    const baseGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, gridSize * 2);
    baseGlow.addColorStop(0, "rgba(0,255,255,1)");
    baseGlow.addColorStop(0.4, "rgba(0,200,255,0.6)");
    baseGlow.addColorStop(1, "rgba(0,0,50,0)");
    ctx.fillStyle = baseGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, gridSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- Rotující vrstvy ---
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 1;
    
    ctx.rotate(time);
    ctx.beginPath(); ctx.arc(0, 0, gridSize * 0.45, 0, Math.PI * 2); ctx.stroke();
    
    ctx.rotate(-time * 2);
    ctx.beginPath(); ctx.arc(0, 0, gridSize * 0.35, 0, Math.PI * 2); ctx.stroke();
    
    ctx.restore();

    // --- Energetické jádro ---
    ctx.beginPath();
    ctx.arc(centerX, centerY, gridSize * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // 4. Fog of War (Vykreslíme před loď, ale díky "transparent" středu bude loď vidět)
    ctx.save();
    const grad = ctx.createRadialGradient(
        state.player.x * gridSize + gridSize / 2, state.player.y * gridSize + gridSize / 2, gridSize,
        state.player.x * gridSize + gridSize / 2, state.player.y * gridSize + gridSize / 2, gridSize * 6
    );
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "rgba(0, 0, 10, 0.8)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 5. Loď (Vykreslena jako POSLEDNÍ - bude vždy na vrchu a nebude blikat)
    ctx.save();
    ctx.translate(state.player.x * gridSize + gridSize / 2, state.player.y * gridSize + gridSize / 2);
    // Malý trik: přidáme lodi jemnou záři, aby v portálu "nesplynula"
    ctx.fillStyle = "#00ff41";
    ctx.beginPath();
    ctx.moveTo(0, -10); 
    ctx.lineTo(8, 8); 
    ctx.lineTo(-8, 8); 
    ctx.closePath();
    ctx.fill();
    ctx.restore();
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

// Přidej do objektu state proměnnou pro sledování pohybu
state.isMoving = false; 

/**
 * Hlavní funkce pro plynulý pohyb
 * @param {number} dx - směr X (-1, 0, 1)
 * @param {number} dy - směr Y (-1, 0, 1)
 * @param {number} dist - kolik bloků celkem
 */
async function move(dx, dy, dist = 1) { {
    // KONTROLA: Pokud neběží motory (state.isRunning je false), funkce se ukončí
    if (!state.isRunning) {
        log("KRITICKÁ CHYBA: Motory jsou OFFLINE. Zadejte 'play'.", "error");
        return; 
    }

    // Zámek proti vícenásobnému pohybu (pokud už loď pluje)
    if (state.isMoving) return; 

    // ... zbytek logiky pro pohyb ...
    }
    if (state.isMoving) {
        log("Navigační počítač je zaneprázdněn.", "warning");
        return;
    }

    dist = parseInt(dist) || 1;
    state.isMoving = true;
    let movedTotal = 0;

    log(`Zahajuji přesun: ${dist} jednotek...`);

    for (let i = 0; i < dist; i++) {
        // Kontrola paliva a stavu během cesty
        if (!state.player.alive || state.player.fuel <= 0) {
            log("Pohyb přerušen - nedostatek zdrojů!", "error");
            break;
        }

        let targetX = state.player.x + dx;
        let targetY = state.player.y + dy;

        // Kontrola hranic mapy
        if (targetX >= 0 && targetX < Math.floor(canvas.width / gridSize) &&
            targetY >= 0 && targetY < Math.floor(canvas.height / gridSize)) {
            
            // Samotná plynulá animace mezi dvěma bloky
            await animateStep(dx, dy);
            
            movedTotal++;
            
            // Kontrola předmětů na nové pozici
            checkItems();
        } else {
            log("Kolize s hranicí sektoru!", "warning");
            break;
        }
    }

    state.isMoving = false;
    log(`Přesun dokončen. Uraženo ${movedTotal} jednotek.`);
    updateHUD();
}

/**
 * Pomocná funkce, která rozdělí pohyb mezi dvěma políčky na drobné kroky
 */
function animateStep(dx, dy) {
    return new Promise((resolve) => {
        let steps = 10; // Počet mezikroků (čím víc, tím plynulejší, ale pomalejší)
        let currentStep = 0;
        
        // Uložíme si původní pozici
        const startX = state.player.x;
        const startY = state.player.y;

        const interval = setInterval(() => {
            currentStep++;
            
            // Posouváme loď o zlomek bloku
            state.player.x = startX + (dx * (currentStep / steps));
            state.player.y = startY + (dy * (currentStep / steps));
            
            draw(); // Překreslíme plátno

            if (currentStep >= steps) {
                clearInterval(interval);
                // Zaokrouhlíme na celá čísla, aby loď "seděla" v mřížce
                state.player.x = Math.round(state.player.x);
                state.player.y = Math.round(state.player.y);
                resolve();
            }
        }, 30); // Rychlost animace (30ms mezi kroky)
    });
}

function checkItems() {
    state.items.forEach((it, idx) => {
        if (Math.round(state.player.x) === it.x && Math.round(state.player.y) === it.y) {
            log(`Sběr: ${it.type === 'L' ? 'Lékárnička' : 'Palivo'}`, "success");
            if (it.type === 'L') state.player.hp = Math.min(100, state.player.hp + 20);
            else state.player.fuel = Math.min(100, state.player.fuel + 20);
            state.items.splice(idx, 1);
        }
    });
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
        else if(cmd === 'help') {
            log(`Příkazy: ${state.isRunning ? "RUNNING" : " dopredu [x], vzadu [x], doleva [x], doprava [x] Systém: play, stop, zalodit, reset"}`);
            console.log("Dostupné příkazy: vpred [x], vzad [x], vlevo [x], vpravo [x] Systém: play, stop, zalodit, reset");
        }
        else if(cmd === 'reset') location.reload();
        else if(!state.isRunning && ['vpred','vzad','vlevo','vpravo','zalodit'].includes(cmd)) {
            log("Chyba: Motory vypnuty.", "error");
        }
        else {
            switch(cmd) {
                case 'dopredu':  move(0, -1, arg); break;
                case 'dozadu':   move(0, 1, arg); break;
                case 'doleva':  move(-1, 0, arg); break;
                case 'doprava': move(1, 0, arg); break;
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

