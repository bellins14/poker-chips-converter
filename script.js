// script.js

// Strutture dati globali:
let denominationsData = []; // {denom: number, quantity: number}
let baseValue = 0; // valore in € (o altra valuta) di 1 "unità chip"
let playersData = []; // per memorizzare quante fiches ha ogni giocatore

document.addEventListener("DOMContentLoaded", () => {
  // Riferimenti agli elementi DOM
  const totalPotInput = document.getElementById("totalPot");
  const addDenominationBtn = document.getElementById("addDenomination");
  const denominationsTableBody = document
    .getElementById("denominationsTable")
    .querySelector("tbody");
  const calculateBaseValueBtn = document.getElementById("calculateBaseValue");
  const baseValueResultDiv = document.getElementById("baseValueResult");

  const numPlayersInput = document.getElementById("numPlayers");
  const createPlayersTableBtn = document.getElementById("createPlayersTable");
  const playersTable = document.getElementById("playersTable");
  const calculatePlayersValueBtn = document.getElementById(
    "calculatePlayersValue"
  );
  const playersValueResultDiv = document.getElementById("playersValueResult");

  // 1) Aggiunge una nuova riga di "taglio" fiche nella tabella
  addDenominationBtn.addEventListener("click", () => {
    const row = document.createElement("tr");

    // Colonna del valore della fiche
    const denomCell = document.createElement("td");
    const denomInput = document.createElement("input");
    denomInput.type = "number";
    denomInput.placeholder = "Valore";
    denomCell.appendChild(denomInput);

    // Colonna della quantità
    const quantityCell = document.createElement("td");
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.placeholder = "Quantità";
    quantityCell.appendChild(quantityInput);

    // Colonna per rimuovere la riga
    const removeCell = document.createElement("td");
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.style.background = "red";
    removeBtn.addEventListener("click", () => {
      row.remove();
    });
    removeCell.appendChild(removeBtn);

    // Aggiunge le celle alla riga
    row.appendChild(denomCell);
    row.appendChild(quantityCell);
    row.appendChild(removeCell);

    // Aggiunge la riga al tbody
    denominationsTableBody.appendChild(row);
  });

  // 2) Calcola il valore base di 1 "unità chip"
  //    baseValue = totalPot / (somma di (denom * quantity))
  calculateBaseValueBtn.addEventListener("click", () => {
    // Leggiamo i dati inseriti
    const totalPot = parseFloat(totalPotInput.value) || 0;

    // Se non c'è un importo valido, blocchiamo l'esecuzione
    if (!totalPot || totalPot <= 0) {
      alert("Inserisci un importo totale valido.");
      return;
    }

    // Azzeriamo e ricarichiamo denominationsData
    denominationsData = [];
    const rows = denominationsTableBody.querySelectorAll("tr");
    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      if (inputs.length === 2) {
        const denomValue = parseFloat(inputs[0].value) || 0;
        const quantityValue = parseFloat(inputs[1].value) || 0;

        if (denomValue > 0 && quantityValue > 0) {
          denominationsData.push({
            denom: denomValue,
            quantity: quantityValue,
          });
        }
      }
    });

    if (denominationsData.length === 0) {
      alert("Devi inserire almeno un taglio di fiche con quantità > 0.");
      return;
    }

    // Calcoliamo la somma totale "virtuale" dei chip
    let totalChipCapacity = 0;
    denominationsData.forEach(({ denom, quantity }) => {
      totalChipCapacity += denom * quantity;
    });

    if (totalChipCapacity === 0) {
      alert(
        "Impossibile calcolare il valore base. Controlla i tagli inseriti."
      );
      return;
    }

    // Calcoliamo il valore base
    baseValue = totalPot / totalChipCapacity;

    // Mostriamo il risultato
    baseValueResultDiv.innerHTML = `
      <p><strong>Valore base di 1 unità chip:</strong> ${baseValue.toFixed(
        4
      )} €</p>
      <ul>
        ${denominationsData
          .map(
            ({ denom }) =>
              `<li>Fiche di valore ${denom} → ${(denom * baseValue).toFixed(
                4
              )} €</li>`
          )
          .join("")}
      </ul>
    `;
  });

  // 3) Creazione dinamica della tabella giocatori
  createPlayersTableBtn.addEventListener("click", () => {
    const numPlayers = parseInt(numPlayersInput.value) || 0;

    if (numPlayers <= 0) {
      alert("Inserisci un numero di giocatori valido (>= 1).");
      return;
    }

    // Svuotiamo la tabella prima di ricostruirla
    playersTable.innerHTML = "";
    playersData = []; // reset

    // Creiamo l'header:
    const thead = playersTable.createTHead();
    const headerRow = thead.insertRow();

    // Prima colonna: Nome giocatore
    let thName = document.createElement("th");
    thName.textContent = "Giocatore";
    headerRow.appendChild(thName);

    // Creiamo una colonna per ciascun taglio di fiche
    denominationsData.forEach(({ denom }) => {
      let th = document.createElement("th");
      th.textContent = `Fiche da ${denom}`;
      headerRow.appendChild(th);
    });

    // Creiamo il corpo della tabella
    const tbody = playersTable.createTBody();

    for (let i = 0; i < numPlayers; i++) {
      const row = tbody.insertRow();

      // Colonna del nome giocatore
      const cellName = row.insertCell();
      const playerNameInput = document.createElement("input");
      playerNameInput.type = "text";
      playerNameInput.value = `Giocatore ${i + 1}`;
      cellName.appendChild(playerNameInput);

      // Colonne per i tagli di fiche
      denominationsData.forEach(({ denom }) => {
        const cell = row.insertCell();
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.value = "0";
        cell.appendChild(input);
      });
    }
  });

  // 4) Calcolo del valore finale per ciascun giocatore
  calculatePlayersValueBtn.addEventListener("click", () => {
    if (!baseValue || baseValue === 0) {
      alert("Devi prima calcolare il valore base delle fiche.");
      return;
    }

    // Preleviamo i dati dalla tabella dei giocatori
    const rows = playersTable.tBodies[0]?.rows;
    if (!rows || rows.length === 0) {
      alert(
        "Non ci sono righe di giocatori. Crea la tabella prima di calcolare."
      );
      return;
    }

    let results = []; // array di oggetti { playerName, totalAmount }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // La prima cella è il nome, le altre corrispondono alle denominazioni
      const playerNameInput = row.cells[0].querySelector("input");
      const playerName = playerNameInput.value.trim();

      let sumAmount = 0; // totale in €

      for (let j = 1; j < row.cells.length; j++) {
        const chipsInput = row.cells[j].querySelector("input");
        const chipCount = parseInt(chipsInput.value) || 0;

        // Corrispondenza con denominationsData
        // j-1 perché l'indice 0 è la colonna "Nome"
        const denom = denominationsData[j - 1].denom;

        // Calcoliamo il valore in €
        sumAmount += chipCount * (denom * baseValue);
      }

      results.push({
        playerName,
        totalAmount: sumAmount,
      });
    }

    // Mostriamo i risultati
    playersValueResultDiv.innerHTML = `
      <h3>Risultati:</h3>
      <ul>
        ${results
          .map(
            (res) =>
              `<li><strong>${
                res.playerName
              }</strong>: ${res.totalAmount.toFixed(2)} €</li>`
          )
          .join("")}
      </ul>
    `;
  });
});
