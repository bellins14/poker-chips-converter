// Variabili globali
let denominationsData = []; // { denom: number, quantity: number }
let baseValue = 0; // valore in € di 1 "unità chip"

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const totalPotInput = document.getElementById("totalPot");
  const addDenominationBtn = document.getElementById("addDenomination");
  const denominationsTable = document.getElementById("denominationsTable");
  const denominationsTableBody = denominationsTable.querySelector("tbody");
  const calculateBaseValueBtn = document.getElementById("calculateBaseValue");
  const baseValueResultDiv = document.getElementById("baseValueResult");

  const numPlayersInput = document.getElementById("numPlayers");
  const createPlayersTableBtn = document.getElementById("createPlayersTable");
  const playersTable = document.getElementById("playersTable");
  const calculatePlayersValueBtn = document.getElementById(
    "calculatePlayersValue"
  );
  const playersValueResultDiv = document.getElementById("playersValueResult");

  // Aggiunta di un nuovo taglio di fiche
  addDenominationBtn.addEventListener("click", () => {
    const row = document.createElement("tr");

    // colonna: valore fiche
    const denomCell = document.createElement("td");
    const denomInput = document.createElement("input");
    denomInput.type = "number";
    denomInput.placeholder = "Valore";
    denomCell.appendChild(denomInput);

    // colonna: quantità
    const quantityCell = document.createElement("td");
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.placeholder = "Quantità";
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

    // assemblaggio riga
    row.appendChild(denomCell);
    row.appendChild(quantityCell);
    row.appendChild(removeCell);
    denominationsTableBody.appendChild(row);
  });

  // Calcolo del valore base di 1 unità di fiche
  calculateBaseValueBtn.addEventListener("click", () => {
    const totalPot = parseFloat(totalPotInput.value) || 0;
    if (totalPot <= 0) {
      alert("Inserisci un importo totale valido.");
      return;
    }

    // raccogli i dati dalla tabella
    denominationsData = [];
    const rows = denominationsTableBody.querySelectorAll("tr");
    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      if (inputs.length === 2) {
        const denom = parseFloat(inputs[0].value) || 0;
        const qty = parseFloat(inputs[1].value) || 0;
        if (denom > 0 && qty > 0) {
          denominationsData.push({ denom, quantity: qty });
        }
      }
    });

    if (denominationsData.length === 0) {
      alert("Inserisci almeno un taglio di fiche con quantità > 0.");
      return;
    }

    // somma totale (unità "fittizie")
    let totalUnits = 0;
    denominationsData.forEach((item) => {
      totalUnits += item.denom * item.quantity;
    });

    if (totalUnits === 0) {
      alert("Impossibile calcolare il valore base.");
      return;
    }

    baseValue = totalPot / totalUnits;
    baseValueResultDiv.innerHTML = `
      <p><strong>Valore base di 1 unità chip:</strong> ${baseValue.toFixed(
        4
      )} €</p>
      <ul>
        ${denominationsData
          .map(
            (d) =>
              `<li>Fiche da ${d.denom} → ${(d.denom * baseValue).toFixed(
                2
              )} €</li>`
          )
          .join("")}
      </ul>
    `;
  });

  // Creazione tabella giocatori
  createPlayersTableBtn.addEventListener("click", () => {
    const numPlayers = parseInt(numPlayersInput.value) || 0;
    if (numPlayers <= 0) {
      alert("Inserisci un numero di giocatori valido (>= 1).");
      return;
    }

    // svuota la tabella prima di ricostruirla
    playersTable.innerHTML = "";

    // crea intestazione
    const thead = playersTable.createTHead();
    const headerRow = thead.insertRow();

    // colonna "Giocatore"
    const thName = document.createElement("th");
    thName.textContent = "Giocatore";
    headerRow.appendChild(thName);

    // colonna per ogni taglio di fiche
    denominationsData.forEach(({ denom }) => {
      const th = document.createElement("th");
      th.textContent = `Fiche da ${denom}`;
      headerRow.appendChild(th);
    });

    // crea corpo tabella
    const tbody = playersTable.createTBody();

    for (let i = 0; i < numPlayers; i++) {
      const row = tbody.insertRow();

      // cella nome giocatore
      const cellName = row.insertCell();
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = `Giocatore ${i + 1}`;
      cellName.appendChild(nameInput);

      // celle per i tagli di fiche
      denominationsData.forEach(({ denom }) => {
        const cell = row.insertCell();
        const qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.min = "0";
        qtyInput.value = "0";
        cell.appendChild(qtyInput);
      });
    }
  });

  // Calcolo valore finale per ogni giocatore
  calculatePlayersValueBtn.addEventListener("click", () => {
    if (!baseValue || baseValue === 0) {
      alert("Devi prima calcolare il valore base delle fiche.");
      return;
    }

    const tbody = playersTable.tBodies[0];
    if (!tbody || tbody.rows.length === 0) {
      alert("Non ci sono giocatori. Crea la tabella prima di calcolare.");
      return;
    }

    let risultatiHTML = "<h3>Risultati Finali</h3><ul>";
    for (let i = 0; i < tbody.rows.length; i++) {
      const row = tbody.rows[i];
      const playerName = row.cells[0].querySelector("input").value;

      let totalAmount = 0;
      // per ogni colonna di fiches
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
    playersValueResultDiv.innerHTML = risultatiHTML;
  });
});
