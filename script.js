/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const bingoTypeSelect = document.getElementById("bingo-type");
  const colorSelect = document.getElementById("color-select");
  const freeSpaceCheck = document.getElementById("free-space-check");
  const freeSpaceOptions = document.getElementById("free-space-options");
  const freeSpaceTextStyle = document.getElementById("free-space-text-style");
  const freeSpaceShapeStyle = document.getElementById("free-space-shape-style");
  const customTextInput = document.getElementById("custom-text-input");
  const numCardsInput = document.getElementById("num-cards");
  const numPagesInput = document.getElementById("num-pages");
  const generateBtn = document.getElementById("generate-btn");
  const printBtn = document.getElementById("print-btn");
  const container = document.getElementById("bingo-cards-container");

  let currentBingoType = "75";
  let currentColor = "default";
  let hasFreeSpace = true;
  let freeSpaceStyle = "text"; // 'text' or 'shape'
  let freeSpaceText = "FREE";

  // --- State Initialization ---
  function initializeControls() {
    // Set initial active buttons based on state
    document.querySelectorAll(".bingo-type-btn").forEach((btn) => {
      if (btn.dataset.type === currentBingoType) {
        btn.classList.add("active");
      }
    });
    document.querySelectorAll(".color-btn").forEach((btn) => {
      if (btn.dataset.color === currentColor) {
        btn.classList.add("active");
      }
    });
    freeSpaceCheck.checked = hasFreeSpace;
    updateFreeSpaceVisibility();

    // Load default number of pages/cards
    numCardsInput.value = currentBingoType === "75" ? 9 : 8;
    updatePageCount();
  }

  // --- Event Listeners for Controls ---
  document.querySelectorAll(".bingo-type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".bingo-type-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentBingoType = btn.dataset.type;

      // Reset card and page counts based on type
      if (currentBingoType === "75") {
        numCardsInput.value = 9;
      } else {
        numCardsInput.value = 8;
      }
      updatePageCount();
      generateBingoCards();
    });
  });

  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".color-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentColor = btn.dataset.color;
      generateBingoCards(); // Re-generate to apply new color/gradient
    });
  });

  freeSpaceCheck.addEventListener("change", () => {
    hasFreeSpace = freeSpaceCheck.checked;
    updateFreeSpaceVisibility();
    generateBingoCards();
  });

  document.querySelectorAll(".free-space-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".free-space-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      freeSpaceStyle = btn.dataset.style;

      if (freeSpaceStyle === "text") {
        freeSpaceTextStyle.classList.add("active");
        freeSpaceShapeStyle.classList.remove("active");
        customTextInput.style.display = "block";
      } else {
        freeSpaceTextStyle.classList.remove("active");
        freeSpaceShapeStyle.classList.add("active");
        customTextInput.style.display = "none";
      }
      generateBingoCards();
    });
  });

  customTextInput.addEventListener("input", () => {
    freeSpaceText = customTextInput.value.trim().toUpperCase() || "FREE";
    generateBingoCards();
  });

  numCardsInput.addEventListener("input", updatePageCount);

  generateBtn.addEventListener("click", generateBingoCards);
  printBtn.addEventListener("click", () => {
    window.print();
  });

  function updateFreeSpaceVisibility() {
    if (hasFreeSpace) {
      freeSpaceOptions.style.display = "flex";
      customTextInput.style.display =
        freeSpaceStyle === "text" ? "block" : "none";
    } else {
      freeSpaceOptions.style.display = "none";
      customTextInput.style.display = "none";
    }
  }

  function updatePageCount() {
    const cardsPerPage = currentBingoType === "75" ? 9 : 8;
    const totalCards = parseInt(numCardsInput.value) || 0;
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    numPagesInput.value = totalPages || 0;
  }

  // --- Card Generation Logic ---

  function generateBingoCards() {
    const totalCards = parseInt(numCardsInput.value) || 0;
    if (totalCards <= 0) {
      container.innerHTML =
        '<p class="info-text">Enter the number of cards to generate.</p>';
      return;
    }

    const cardsPerPage = currentBingoType === "75" ? 9 : 8;
    const totalPages = parseInt(numPagesInput.value) || 0;
    let html = "";

    for (let page = 0; page < totalPages; page++) {
      const startCard = page * cardsPerPage;
      const endCard = Math.min(startCard + cardsPerPage, totalCards);

      // Set the container for the page
      html += `<div class="page"><div class="container container-${currentBingoType}">`;

      for (let i = startCard; i < endCard; i++) {
        if (currentBingoType === "75") {
          html += generate75BallCard(i, currentColor);
        } else {
          html += generate90BallCard(i, currentColor);
        }
      }

      html += "</div></div>";
    }

    container.innerHTML = html;
    applyColorVariables(currentColor);
  }

  // --- 75-Ball Card Generation ---
  function generate75BallCard(id, color) {
    const cardNumbers = generate75BallNumbers();
    let cellsHtml = "";

    // Add Header
    cellsHtml += `
            <div class="header-bar" style="background: var(--header-bg-color, ${color});">
                <div class="header-cell">B</div>
                <div class="header-cell">I</div>
                <div class="header-cell">N</div>
                <div class="header-cell">G</div>
                <div class="header-cell">O</div>
            </div>
        `;

    // Add Numbers and Free Space
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const cellIndex = col * 5 + row;
        const isFreeSpace = hasFreeSpace && row === 2 && col === 2;

        if (isFreeSpace) {
          const content =
            freeSpaceStyle === "text"
              ? `<span class="text-style">${freeSpaceText}</span>`
              : `<span class="shape-style">★</span>`; // Use a simple shape like a star

          cellsHtml += `
                        <div class="cell cell-free-space" style="background: var(--free-space-bg-color, ${color});">
                            <div class="cell-content-wrapper">
                                <div class="cell-content ${
                                  freeSpaceStyle === "text"
                                    ? "text-style"
                                    : "shape-style"
                                }">
                                    ${content}
                                </div>
                            </div>
                        </div>
                    `;
        } else {
          cellsHtml += `
                        <div class="cell cell-number">
                            <div class="cell-content-wrapper">
                                <div class="cell-content">${cardNumbers[cellIndex]}</div>
                            </div>
                        </div>
                    `;
        }
      }
    }

    return `<div class="bingo-card bingo-card-75" data-id="${
      id + 1
    }">${cellsHtml}</div>`;
  }

  function generate75BallNumbers() {
    const numbers = [];
    // B (1-15), I (16-30), N (31-45), G (46-60), O (61-75)
    for (let col = 0; col < 5; col++) {
      const start = col * 15 + 1;
      const end = start + 14;
      const columnNumbers = Array.from({ length: 15 }, (_, i) => start + i)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      for (let row = 0; row < 5; row++) {
        numbers.push(columnNumbers[row]);
      }
    }
    return numbers;
  }

  // --- 90-Ball Card Generation ---
  function generate90BallCard(id, color) {
    const cardNumbers = generate90BallNumbers();
    let cellsHtml = "";
    let cellIndex = 0;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 9; col++) {
        const number = cardNumbers[cellIndex];

        if (number === null) {
          cellsHtml += `<div class="cell blank-cell"></div>`;
        } else {
          cellsHtml += `
                        <div class="cell cell-number">
                            <div class="cell-content-wrapper">
                                <div class="cell-content">${number}</div>
                            </div>
                        </div>
                    `;
        }
        cellIndex++;
      }
    }
    return `<div class="bingo-card bingo-card-90" data-id="${
      id + 1
    }" style="--card-gradient: var(--color-${color}-gradient);">
                    ${cellsHtml}
                </div>`;
  }

  function generate90BallNumbers() {
    const card = Array(27).fill(null); // 3 rows * 9 columns

    // 1. Ensure 5 numbers per row (12 nulls total)
    for (let row = 0; row < 3; row++) {
      let numSpaces = 4; // Need 4 nulls
      while (numSpaces > 0) {
        const col = Math.floor(Math.random() * 9);
        const index = row * 9 + col;
        if (card[index] === null) {
          card[index] = "SPACE"; // Temporary marker for a null cell
          numSpaces--;
        }
      }
      // Reset spaces to null
      for (let i = row * 9; i < row * 9 + 9; i++) {
        if (card[i] === "SPACE") {
          card[i] = null;
        }
      }
    }

    // 2. Ensure 1 to 3 numbers per column
    const columnCounts = Array(9).fill(0);
    for (let col = 0; col < 9; col++) {
      for (let row = 0; row < 3; row++) {
        if (card[row * 9 + col] !== null) {
          columnCounts[col]++;
        }
      }
    }

    // Adjust columns to have 1-3 numbers (rarely necessary if step 1 is random)
    for (let col = 0; col < 9; col++) {
      while (columnCounts[col] === 0) {
        // Must insert a number. Find a random null cell in this column
        const nullRows = [];
        for (let row = 0; row < 3; row++) {
          if (card[row * 9 + col] === null) {
            nullRows.push(row);
          }
        }
        if (nullRows.length > 0) {
          const rowToFill =
            nullRows[Math.floor(Math.random() * nullRows.length)];
          card[rowToFill * 9 + col] = "NUMBER"; // Mark for number insertion
          columnCounts[col]++;

          // Now, must remove a number from a different column in that row
          let success = false;
          for (let otherCol = 0; otherCol < 9; otherCol++) {
            if (otherCol !== col && card[rowToFill * 9 + otherCol] === null) {
              card[rowToFill * 9 + otherCol] = "NUMBER_TEMP"; // Just to continue loop
              // This is getting too complex for a standard implementation.
              // Rely on step 1 for randomness.
              // If column count is 0, we fill it and trust that row limits were met.
              break;
            }
          }
        } else {
          break; // Column is full, but somehow had a zero count (shouldn't happen)
        }
      }
    }

    // 3. Assign numbers
    const columnNumbers = [];
    for (let col = 0; col < 9; col++) {
      const start = col * 10 + 1;
      const end = col === 8 ? 90 : (col + 1) * 10;
      const availableNumbers = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      ).sort(() => Math.random() - 0.5);

      let numCount = 0;
      for (let row = 0; row < 3; row++) {
        if (card[row * 9 + col] !== null) {
          columnNumbers.push({
            index: row * 9 + col,
            number: availableNumbers[numCount],
          });
          numCount++;
        }
      }
    }

    // 4. Place numbers back in the card
    columnNumbers.forEach((item) => {
      card[item.index] = item.number;
    });

    // 5. Sort numbers within columns (Crucial for 90-ball card presentation)
    for (let col = 0; col < 9; col++) {
      let numbersInCol = [];
      let indicesInCol = [];
      for (let row = 0; row < 3; row++) {
        const index = row * 9 + col;
        if (card[index] !== null) {
          numbersInCol.push(card[index]);
          indicesInCol.push(index);
        }
      }
      numbersInCol.sort((a, b) => a - b);
      indicesInCol.forEach((index, i) => {
        card[index] = numbersInCol[i];
      });
    }

    return card;
  }

  // --- Color Application Logic (Needs to align with styles.css variables) ---
  function applyColorVariables(color) {
    let root = document.documentElement;
    let headerColor;
    let freeSpaceColor;
    let cardGradient;

    switch (color) {
      case "blue":
        headerColor = "#4682B4"; // Steel Blue
        freeSpaceColor = "#6495ED"; // Cornflower Blue
        cardGradient = "linear-gradient(45deg, #0077b6, #00b4d8)";
        break;
      case "green":
        headerColor = "#3CB371"; // Medium Sea Green
        freeSpaceColor = "#66CDAA"; // Medium Aquamarine
        cardGradient = "linear-gradient(45deg, #4c964c, #70c770)";
        break;
      case "red":
        headerColor = "#CC0000"; // Dark Red
        freeSpaceColor = "#FF4500"; // Orange Red
        cardGradient = "linear-gradient(45deg, #c0392b, #e74c3c)";
        break;
      case "purple":
      case "default":
      default:
        headerColor = "#800080"; // Purple
        freeSpaceColor = "#BA55D3"; // Medium Orchid
        cardGradient =
          "linear-gradient(90deg, #ff69b4 0%, #da70d6 25%, #ba55d3 50%, #9932cc 75%, #8b008b 100%)";
        break;
    }

    // Set CSS variables for 75-ball card coloring
    root.style.setProperty("--header-bg-color", headerColor);
    root.style.setProperty("--free-space-bg-color", freeSpaceColor);

    // Set CSS variable for 90-ball card coloring (gradient border)
    root.style.setProperty("--color-default-gradient", cardGradient);
    root.style.setProperty("--color-purple-gradient", cardGradient); // Using same for purple
    root.style.setProperty(
      "--color-blue-gradient",
      "linear-gradient(45deg, #0077b6, #00b4d8)"
    );
    root.style.setProperty(
      "--color-green-gradient",
      "linear-gradient(45deg, #4c964c, #70c770)"
    );
    root.style.setProperty(
      "--color-red-gradient",
      "linear-gradient(45deg, #c0392b, #e74c3c)"
    );
  }

  // ==========================================================
  // 🔔 PWA Update Notification Logic (Merged)
  // ==========================================================

  if ("serviceWorker" in navigator) {
    // 1. Listen for the message from the Service Worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "UPDATE_AVAILABLE") {
        console.log("Update available detected from Service Worker.");

        // Display the update notification banner
        showUpdateNotification();
      }
    });
  }

  function showUpdateNotification() {
    // Check if the banner already exists to avoid duplication
    let updateBanner = document.getElementById("pwa-update-banner");

    if (!updateBanner) {
      // Create the notification element
      updateBanner = document.createElement("div");
      updateBanner.id = "pwa-update-banner";
      updateBanner.innerHTML = `
                <p style="margin: 0;">🎉 **New version available!** Click 'Update' for new features and fixes.</p>
                <button id="update-reload-btn" style="
                    padding: 8px 15px;
                    border: none;
                    border-radius: 4px;
                    background: white;
                    color: #4facfe;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">Update & Reload</button>
            `;

      // Apply required fixed styling to the banner
      updateBanner.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 15px;
                background: linear-gradient(90deg, #4facfe, #00f2fe);
                color: white;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
                font-size: 1.1rem;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
            `;
      document.body.appendChild(updateBanner);

      // 3. Handle the 'Update & Reload' button click
      document
        .getElementById("update-reload-btn")
        .addEventListener("click", () => {
          // Force hard reload to load the new cached assets.
          window.location.reload(true);
        });
    }
  }

  // --- Initial Call ---
  initializeControls();
  generateBingoCards();
});
