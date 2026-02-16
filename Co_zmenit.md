grafiku
rotace lodi



// VYKRESLENÍ LODĚ
    ctx.save(); // Uloží aktuální stav plátna (bez rotace)
    
    // 1. Přesuneme střed souřadnic na střed lodi
    const centerX = state.player.x * gridSize + gridSize / 2;
    const centerY = state.player.y * gridSize + gridSize / 2;
    ctx.translate(centerX, centerY);
    
    // 2. Otočíme celé plátno o úhel lodi
    ctx.rotate(state.player.angle);
    
    // 3. Vykreslíme obrázek (vycentrovaný)
    // Kreslíme od -gridSize/2, aby střed obrázku byl přesně na souřadnicích centerX, centerY
    if (shipImg.complete) { // Kontrola, zda je obrázek načten
        ctx.drawImage(
            shipImg, 
            -gridSize / 2 + 2, 
            -gridSize / 2 + 2, 
            gridSize - 4, 
            gridSize - 4
        );
    } else {
        // Záložní řešení (trojúhelník), pokud se obrázek ještě nenačetl
        ctx.fillStyle = "#00ff41";
        ctx.beginPath();
        ctx.moveTo(0, -10); ctx.lineTo(8, 8); ctx.lineTo(-8, 8); ctx.closePath();
        ctx.fill();
    }

    ctx.restore(); // Vrátí plátno do původního stavu (zruší rotaci a přesun)