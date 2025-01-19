// script.js

// Dati globali
let denominationsData = []; // array di oggetti {denom, quantity}
let totalPot = 0; // Somma di tutti i buy-in
let baseValue = 0; // Valore in € di 1 "unità chip" = totalPot / totalChipCapacity

document.addEventListener("DOMContentLoaded", () => {
  // Selettori Fiches Disponibili
  const addDenominationBtn = document.getElementById("addDenomination");
  const denominationsTable = document.getElementById("denominationsTable");
  const denominationsTableBody = denominationsTable.querySelector("tbody");

  // Selettori Giocatori & Buy-In
  const numPlayersInput = document.getElementById("numPlayers");
  const createPlayersBuyInTableBtn = document.getElementById(
    "createPlayersBuyInTable"
  );
  const playersBuyInTable = document.getElementById("playersBuyInTable");
  const sameBuyInForAllBtn = document.getElementById("sameBuyInForAll");
  const calculateTotalPotBtn = document.getElementById("calculateTotalPot");
  const totalPotResultDiv = document.getElementById("totalPotResult");

  // Selettori Distribuzione Iniziale
  const distributeChipsBtn = document.getElementById("distributeChipsBtn");
  const distributionResultDiv = document.getElementById("distributionResult");

  // Selettori Calcolo Finale
  const createPlayersTableEndBtn = document.getElementById(
    "createPlayersTableEnd"
  );
  const playersTableEnd = document.getElementById("playersTableEnd");
  const calculatePlayersValueEndBtn = document.getElementById(
    "calculatePlayersValueEnd"
  );
  const playersValueResultEndDiv = document.getElementById(
    "playersValueResultEnd"
  );

  // =======================
  // Funzione per bloccare i decimali nei campi quantità
  // =======================
  const enforceIntegerInput = (inputElement) => {
    inputElement.addEventListener("keydown", (event) => {
      // Previene l'inserimento di punti o virgole
      if (event.key === "." || event.key === ",") {
        event.preventDefault();
      }
    });

    inputElement.addEventListener("blur", () => {
      // Controlla che il valore finale sia valido
      if (
        isNaN(parseInt(inputElement.value)) ||
        parseInt(inputElement.value) < 0
      ) {
        inputElement.value = "";
      }
    });
  };

  // =======================
  // 1) CONFIGURAZIONE FICHES
  // =======================

  // Aggiungi una nuova riga (taglio, quantita') alla tabella
  addDenominationBtn.addEventListener("click", () => {
    const row = document.createElement("tr");

    // colonna: valore fiche
    const denomCell = document.createElement("td");
    const denomInput = document.createElement("input");
    denomInput.type = "number";
    denomInput.placeholder = "Valore";
    enforceIntegerInput(quantityInput); // Applica il blocco decimali
    denomCell.appendChild(denomInput);

    // colonna: quantita'
    const quantityCell = document.createElement("td");
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.placeholder = "Quantità";
    enforceIntegerInput(quantityInput); // Applica il blocco decimali
    quantityCell.appendChild(quantityInput);

    // colonna: rimuovi
    const removeCell = document.createElement("td");
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.style.backgroundColor = "red";
    removeBtn.addEventListener("click", () => {
      row.remove();
    });
    removeCell.appendChild(removeBtn);

    // Assembla la riga
    row.appendChild(denomCell);
    row.appendChild(quantityCell);
    row.appendChild(removeCell);
    denominationsTableBody.appendChild(row);
  });

  // =======================
  // 2) GESTIONE GIOCATORI & BUY-IN
  // =======================

  createPlayersBuyInTableBtn.addEventListener("click", () => {
    // Creiamo la tabella dei buy-in
    const numPlayers = parseInt(numPlayersInput.value) || 0;
    if (numPlayers <= 0) {
      alert("Inserisci un numero di giocatori valido (>=1).");
      return;
    }

    // Svuota la tabella prima di ricostruirla
    playersBuyInTable.innerHTML = "";

    // Header
    const thead = playersBuyInTable.createTHead();
    const headerRow = thead.insertRow();

    const thNickname = document.createElement("th");
    thNickname.textContent = "Nickname";
    headerRow.appendChild(thNickname);

    const thBuyIn = document.createElement("th");
    thBuyIn.textContent = "Buy-In";
    headerRow.appendChild(thBuyIn);

    // Corpo
    const tbody = playersBuyInTable.createTBody();
    for (let i = 0; i < numPlayers; i++) {
      const row = tbody.insertRow();

      // Nickname
      const cellNickname = row.insertCell();
      const nicknameInput = document.createElement("input");
      nicknameInput.type = "text";
      nicknameInput.value = `Giocatore ${i + 1}`;
      cellNickname.appendChild(nicknameInput);

      // Buy-in
      const cellBuyIn = row.insertCell();
      const buyInInput = document.createElement("input");
      buyInInput.type = "number";
      buyInInput.step = "0.01"; // Permetti decimali
      buyInInput.min = "0";
      buyInInput.value = "0";
      cellBuyIn.appendChild(buyInInput);
    }
  });

  // Imposta lo stesso buy-in per tutti i giocatori
  sameBuyInForAllBtn.addEventListener("click", () => {
    const rows = playersBuyInTable.tBodies[0]?.rows;
    if (!rows) {
      alert("Prima crea la tabella buy-in.");
      return;
    }

    const importo = prompt(
      "Inserisci l'importo buy-in da assegnare a tutti:",
      "50"
    );
    if (importo === null) return; // se annulla

    const value = parseFloat(importo);
    if (isNaN(value) || value < 0) {
      alert("Valore buy-in non valido.");
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const buyInInput = rows[i].cells[1].querySelector("input");
      buyInInput.value = value.toString();
    }
  });

  // Calcola la somma di tutti i buy-in (Pot)
  calculateTotalPotBtn.addEventListener("click", () => {
    const rows = playersBuyInTable.tBodies[0]?.rows;
    if (!rows) {
      alert("Tabella buy-in vuota. Crea la tabella prima.");
      return;
    }

    let sum = 0;
    for (let i = 0; i < rows.length; i++) {
      const buyInValue =
        parseFloat(rows[i].cells[1].querySelector("input").value) || 0;
      sum += buyInValue;
    }

    totalPot = sum;
    totalPotResultDiv.innerHTML = `
      <p><strong>Totale Buy-In (Pot):</strong> ${totalPot.toFixed(2)} €</p>
    `;
  });

  // =======================
  // 3) DISTRIBUZIONE INIZIALE FICHES
  // =======================

  distributeChipsBtn.addEventListener("click", () => {
    // 1) Carichiamo i dati dei tagli di fiche
    denominationsData = [];
    const denomRows = denominationsTableBody.querySelectorAll("tr");
    denomRows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      if (inputs.length === 2) {
        const d = parseFloat(inputs[0].value) || 0;
        const q = parseFloat(inputs[1].value) || 0;
        if (d > 0 && q > 0) {
          denominationsData.push({ denom: d, quantity: q });
        }
      }
      enforceIntegerInput(quantityInput);
    });
    if (denominationsData.length === 0) {
      alert(
        "Devi inserire almeno un taglio di fiche (valore > 0, quantità > 0)."
      );
      return;
    }

    // 2) Carichiamo i dati dei giocatori e buy-in
    const rows = playersBuyInTable.tBodies[0]?.rows;
    if (!rows || rows.length === 0) {
      alert("Tabella buy-in vuota. Crea la tabella prima.");
      return;
    }
    if (totalPot <= 0) {
      alert(
        "Il Pot risulta 0. Calcola il totale buy-in prima di distribuire le fiches."
      );
      return;
    }

    // Costruiamo array di giocatori
    let players = [];
    let totalBuyIn = 0;
    for (let i = 0; i < rows.length; i++) {
      const nickname = rows[i].cells[0].querySelector("input").value.trim();
      const buyInValue =
        parseFloat(rows[i].cells[1].querySelector("input").value) || 0;
      totalBuyIn += buyInValue;
      players.push({ nickname, buyIn: buyInValue });
    }

    // 3) Calcoliamo la capacità totale di chip
    let totalChipCapacity = 0;
    denominationsData.forEach((item) => {
      totalChipCapacity += item.denom * item.quantity;
    });
    if (totalChipCapacity === 0) {
      alert("La capacità totale delle fiches è 0. Controlla i tagli inseriti.");
      return;
    }

    // 4) Calcoliamo la baseValue (quanto vale 1 unità di chip in euro)
    baseValue = totalPot / totalChipCapacity;

    // 5) Distribuzione equa in base ai buy-in
    //    Per ogni taglio di fiche, calcoliamo quante spettano a ciascun giocatore
    //    usando metodo "largest remainder".

    // Risultato finale: array di oggetti:
    // playersDistribution = [
    //   { nickname: 'Giocatore 1', chips: { 5: 10, 10: 3, ... } },
    //   { nickname: 'Giocatore 2', chips: { 5: 7, 10: 5, ... } },
    //   ...
    // ];

    let playersDistribution = players.map((p) => {
      return {
        nickname: p.nickname,
        buyIn: p.buyIn,
        chips: {}, // chiave = denom, valore = quante fiches
      };
    });

    denominationsData.forEach((den) => {
      const { denom, quantity } = den;
      if (quantity <= 0) return;

      // 1) Calcola "desired" per ciascun giocatore: fraction * quantity
      //    fraction = buyIn_i / totalBuyIn
      let totalAssigned = 0;
      let partial = players.map((p, index) => {
        const fraction = p.buyIn / totalBuyIn;
        const desired = fraction * quantity;
        const assignedFloor = Math.floor(desired);
        return {
          index,
          remainder: desired - assignedFloor,
          assigned: assignedFloor,
        };
      });

      // 2) Sommiamo i floor per capire quante fiches restano da distribuire
      let sumAssignedFloor = partial.reduce(
        (acc, obj) => acc + obj.assigned,
        0
      );
      let leftover = quantity - sumAssignedFloor;

      // 3) Ordiniamo in base al remainder discendente
      partial.sort((a, b) => b.remainder - a.remainder);

      // 4) Assegniamo gli "avanzi" uno a uno, partendo da chi ha remainder maggiore
      let i = 0;
      while (leftover > 0) {
        partial[i].assigned++;
        leftover--;
        i++;
        if (i >= partial.length) i = 0; // se abbiamo più leftover del numero di giocatori
      }

      // 5) Salviamo i risultati finali in playersDistribution
      partial.forEach((item) => {
        const playerIndex = item.index;
        playersDistribution[playerIndex].chips[denom] =
          (playersDistribution[playerIndex].chips[denom] || 0) + item.assigned;
      });
    });

    // Mostriamo il risultato in distributionResultDiv
    // Creiamo una piccola tabella con: Giocatore | BuyIn | (Fiche denom1) | (Fiche denom2) | ...
    let html = "<h3>Distribuzione Iniziale</h3>";
    html += "<table>";
    // Header
    html += "<thead><tr>";
    html += "<th>Giocatore</th>";
    html += "<th>Buy-In</th>";
    denominationsData.forEach((den) => {
      html += `<th>Fiche da ${den.denom}</th>`;
    });
    html += "</tr></thead>";

    // Corpo
    html += "<tbody>";
    playersDistribution.forEach((pd) => {
      html += `<tr><td>${pd.nickname}</td><td>${pd.buyIn.toFixed(2)}</td>`;
      denominationsData.forEach((den) => {
        const numFiches = pd.chips[den.denom] || 0;
        html += `<td>${numFiches}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";

    // Info sul baseValue
    html += `<p><strong>Valore base di 1 unità chip:</strong> ${baseValue.toFixed(
      4
    )} €</p>`;
    denominationsData.forEach((den) => {
      html += `<p>Fiche da ${den.denom}: ${(den.denom * baseValue).toFixed(
        4
      )} €</p>`;
    });

    distributionResultDiv.innerHTML = html;
  });

  // =======================
  // 4) CALCOLO FINALE PARTITA
  // =======================

  createPlayersTableEndBtn.addEventListener("click", () => {
    const rows = playersBuyInTable.tBodies[0]?.rows;
    if (!rows || rows.length === 0) {
      alert("Devi prima creare la tabella buy-in (e magari distribuire?).");
      return;
    }
    if (denominationsData.length === 0) {
      alert("Devi prima definire i tagli di fiche.");
      return;
    }

    // Svuota la tabella finale
    playersTableEnd.innerHTML = "";

    // Crea header
    const thead = playersTableEnd.createTHead();
    const headerRow = thead.insertRow();

    const thName = document.createElement("th");
    thName.textContent = "Giocatore";
    headerRow.appendChild(thName);

    denominationsData.forEach(({ denom }) => {
      const th = document.createElement("th");
      th.textContent = `Fiche da ${denom}`;
      headerRow.appendChild(th);
    });

    // Corpo tabella
    const tbody = playersTableEnd.createTBody();
    for (let i = 0; i < rows.length; i++) {
      const nickname = rows[i].cells[0].querySelector("input").value.trim();
      const tr = tbody.insertRow();

      // Nickname
      const cellName = tr.insertCell();
      cellName.textContent = nickname;

      // Colonne per i tagli di fiche
      denominationsData.forEach(({ denom }) => {
        const cell = tr.insertCell();
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        //input.value = "0";
        enforceIntegerInput(input); // Applica il blocco decimali
        cell.appendChild(input);
      });
    }
  });

  calculatePlayersValueEndBtn.addEventListener("click", () => {
    if (!baseValue || baseValue === 0) {
      alert(
        "Devi prima calcolare e distribuire (così da calcolare il baseValue)."
      );
      return;
    }

    const tbody = playersTableEnd.tBodies[0];
    if (!tbody || tbody.rows.length === 0) {
      alert(
        'Non ci sono giocatori nella tabella finale. Clicca su "Crea/Reset tabella finale".'
      );
      return;
    }

    let risultatiHTML = "<h3>Risultati Finali</h3><ul>";
    for (let i = 0; i < tbody.rows.length; i++) {
      const row = tbody.rows[i];
      const playerName = row.cells[0].textContent;

      let totalAmount = 0;
      for (let j = 1; j < row.cells.length; j++) {
        const chipCount =
          parseInt(row.cells[j].querySelector("input").value) || 0;
        const denom = denominationsData[j - 1].denom;
        totalAmount += chipCount * (denom * baseValue);
      }

      risultatiHTML += `
        <li><strong>${playerName}</strong>: ${totalAmount.toFixed(2)} €</li>
      `;
    }
    risultatiHTML += "</ul>";
    playersValueResultEndDiv.innerHTML = risultatiHTML;
  });
});
