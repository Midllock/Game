// Přístav
// === ULTRA VÍCEVRSTVÝ ENERGETICKÝ PORTÁL (méně tlustý shadow) ===
const centerX = state.port.x * gridSize + gridSize / 2;
const centerY = state.port.y * gridSize + gridSize / 2;
const time = Date.now() * 0.002;

// ====== GLOW ZÁKLAD (méně tlustý) ======
ctx.save();
ctx.shadowColor = "#00ffff";
ctx.shadowBlur = 40;  // původně 40 → méně tlusté svícení

const baseGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, gridSize * 2);
baseGlow.addColorStop(0, "rgba(0,255,255,1)");
baseGlow.addColorStop(0.4, "rgba(0,200,255,0.6)");
baseGlow.addColorStop(1, "rgba(0,0,50,0)");

ctx.fillStyle = baseGlow;
ctx.beginPath();
ctx.arc(centerX, centerY, gridSize * 1.2, 0, Math.PI * 2); // menší radius než 1.6
ctx.fill();
ctx.restore();

// ====== ROTUJÍCÍ VRSTVY ======
ctx.save();
ctx.translate(centerX, centerY);

// Vrstva 1
ctx.rotate(time);
ctx.beginPath();
ctx.arc(0, 0, gridSize * 0.85, 0, Math.PI * 2); // mírně menší
ctx.strokeStyle = "#00ffff";
ctx.lineWidth = 2; // původně 3
ctx.stroke();

// Vrstva 2 (opačný směr)
ctx.rotate(-time * 2);
ctx.beginPath();
ctx.arc(0, 0, gridSize * 0.65, 0, Math.PI * 2);
ctx.strokeStyle = "#00ffcc";
ctx.lineWidth = 1.5; // původně 2
ctx.stroke();

// Vrstva 3 (rychlejší)
ctx.rotate(time * 3);
ctx.beginPath();
ctx.arc(0, 0, gridSize * 0.45, 0, Math.PI * 2);
ctx.strokeStyle = "#ffffff";
ctx.lineWidth = 1; // původně 1.5
ctx.stroke();

ctx.restore();

// ====== PULZUJÍCÍ VLNA ======
ctx.beginPath();
ctx.arc(
    centerX,
    centerY,
    gridSize * 0.5 + Math.sin(time * 4) * 3, // menší amplituda
    0,
    Math.PI * 2
);
ctx.strokeStyle = "rgba(0,255,255,0.6)";
ctx.lineWidth = 1.5; // původně 2
ctx.stroke();

// ====== ENERGETICKÉ JÁDRO ======
ctx.beginPath();
ctx.arc(centerX, centerY, gridSize * 0.25, 0, Math.PI * 2);
ctx.fillStyle = "#ffffff";
ctx.fill();

    }