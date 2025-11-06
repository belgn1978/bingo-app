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
  let freeSpaceStyle = "text"; // 'text' or other emoji styles
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

    // Handle free space checkbox - only for 75-ball
    const freeSpaceSection = document.getElementById("freeSpaceSection");
    const allowRepeatsSection = document.getElementById("allowRepeatsSection");
    
    if (currentBingoType === "75") {
      freeSpaceSection.style.display = "block";
      updateFreeSpaceVisibility();
    } else {
      freeSpaceSection.style.display = "none";
    }

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

      // Show/hide free space section
      const freeSpaceSection = document.getElementById("freeSpaceSection");
      if (currentBingoType === "75") {
        freeSpaceSection.style.display = "block";
      } else {
        freeSpaceSection.style.display = "none";
      }

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

  document.querySelectorAll(".free-space-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".free-space-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      freeSpaceStyle = btn.dataset.style;

      const customTextContainer = document.getElementById("customTextContainer");
      
      if (freeSpaceStyle === "custom") {
        customTextContainer.style.display = "block";
      } else {
        customTextContainer.style.display = "none";
      }
      generateBingoCards();
    });
  });

  customTextInput.addEventListener("input", () => {
    freeSpaceText = customTextInput.value.trim() || "FREE";
    generateBingoCards();
  });

  numCardsInput.addEventListener("input", updatePageCount);

  generateBtn.addEventListener("click", generateBingoCards);
  
  // IMPROVED PRINT BUTTON
  printBtn.addEventListener("click", handlePrint);

  function handlePrint(e) {
    console.log("🖨️ Print button clicked!");
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Check if cards exist
    const hasCards = container && 
                     container.children.length > 0 && 
                     container.querySelector(".bingo-card");

    if (!hasCards) {
      console.warn("⚠️ No cards to print");
      alert("Please generate bingo cards first!");
      return;
    }

    console.log("✅ Cards found, initiating print...");
    
    try {
      setTimeout(() => {
        window.print();
        console.log("✅ Print dialog opened");
      }, 50);
    } catch (error) {
      console.error("❌ Print failed:", error);
      alert(`Print failed: ${error.message}\n\nTry using Ctrl+P (Cmd+P on Mac) instead.`);
    }
  }

  function updateFreeSpaceVisibility() {
    const customTextContainer = document.getElementById("customTextContainer");
    if (freeSpaceStyle === "custom") {
      customTextContainer.style.display = "block";
    } else {
      customTextContainer.style.display = "none";
    }
  }

  function updatePageCount() {
    const cardsPerPage = currentBingoType === "75" ? 9 : 8;
    const totalCards = parseInt(numCardsInput.value) || 0;
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    numPagesInput.value = totalPages || 0;
    
    // Update the info text
    const cardsPerPageText = document.getElementById("cardsPerPageText");
    if (cardsPerPageText) {
      cardsPerPageText.textContent = `Cards (${cardsPerPage} per page)`;
    }
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
        const isFreeSpace = row === 2 && col === 2; // Center cell

        if (isFreeSpace) {
          let content = "";
          
          // Get the appropriate free space content
          if (freeSpaceStyle === "text") {
            content = `<span class="text-style">${freeSpaceText}</span>`;
          } else if (freeSpaceStyle === "custom") {
            content = `<span class="text-style">${freeSpaceText}</span>`;
          } else {
            // Emoji styles
            const emojiMap = {
              star: "⭐",
              heart: "❤️",
              tree: "🎄",
              snowflake: "❄️",
              pumpkin: "🎃",
              ghost: "👻",
              turkey: "🦃",
              gift: "🎁",
              firework: "🎆",
              balloon: "🎈",
              cake: "🎂",
              clover: "🍀",
              egg: "🥚",
              bunny: "🐰",
              flag: "🎌",
              menorah: "🕎",
              dreidel: "🔯",
              owl: "🦉"
            };
            content = `<span class="shape-style">${emojiMap[freeSpaceStyle] || "⭐"}</span>`;
          }

          cellsHtml += `
            <div class="cell cell-free-space" style="background: var(--free-space-bg-color, ${color});">
              <div class="cell-content-wrapper">
                <div class="cell-content">
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

    return `<div class="bingo-card bingo-card-75" data-id="${id + 1}">${cellsHtml}</div>`;
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
          cellsHtml += `<div class="cell blank-cell"><div class="cell-content-90"></div></div>`;
        } else {
          cellsHtml += `
            <div class="cell cell-number">
              <div class="cell-content-90">${number}</div>
            </div>
          `;
        }
        cellIndex++;
      }
    }
    return `<div class="bingo-card bingo-card-90" data-id="${id + 1}" style="--card-gradient: var(--color-${color}-gradient);">
      ${cellsHtml}
    </div>`;
  }

  function generate90BallNumbers() {
    const card = Array(27).fill(null); // 3 rows * 9 columns

    // 1. Ensure 5 numbers per row (4 nulls per row)
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
    }

    // 2. Assign numbers
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
        const index = row * 9 + col;
        if (card[index] !== "SPACE") {
          columnNumbers.push({
            index: index,
            number: availableNumbers[numCount],
          });
          numCount++;
        }
      }
    }

    // 3. Place numbers back in the card
    columnNumbers.forEach((item) => {
      card[item.index] = item.number;
    });

    // 4. Set spaces to null
    for (let i = 0; i < card.length; i++) {
      if (card[i] === "SPACE") {
        card[i] = null;
      }
    }

    // 5. Sort numbers within columns
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

  // --- Color Application Logic ---
  function applyColorVariables(color) {
    let root = document.documentElement;
    let headerColor;
    let freeSpaceColor;
    let cardGradient;

    switch (color) {
      case "blue":
        headerColor = "#4facfe";
        freeSpaceColor = "#00f2fe";
        cardGradient = "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)";
        break;
      case "purple":
        headerColor = "#a18cd1";
        freeSpaceColor = "#fbc2eb";
        cardGradient = "linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)";
        break;
      case "orange":
        headerColor = "#fa709a";
        freeSpaceColor = "#fee140";
        cardGradient = "linear-gradient(90deg, #fa709a 0%, #fee140 100%)";
        break;
      case "green":
        headerColor = "#30cfd0";
        freeSpaceColor = "#330867";
        cardGradient = "linear-gradient(90deg, #30cfd0 0%, #330867 100%)";
        break;
      case "sunset":
        headerColor = "#ff6b6b";
        freeSpaceColor = "#feca57";
        cardGradient = "linear-gradient(90deg, #ff6b6b 0%, #feca57 50%, #ee5a6f 100%)";
        break;
      case "ocean":
        headerColor = "#2e3192";
        freeSpaceColor = "#1bffff";
        cardGradient = "linear-gradient(90deg, #2e3192 0%, #1bffff 100%)";
        break;
      case "fire":
        headerColor = "#f12711";
        freeSpaceColor = "#f5af19";
        cardGradient = "linear-gradient(90deg, #f12711 0%, #f5af19 100%)";
        break;
      case "default":
      default:
        headerColor = "#800080";
        freeSpaceColor = "#BA55D3";
        cardGradient = "linear-gradient(90deg, #ff69b4 0%, #da70d6 25%, #ba55d3 50%, #9932cc 75%, #8b008b 100%)";
        break;
    }

    root.style.setProperty("--header-bg-color", headerColor);
    root.style.setProperty("--free-space-bg-color", freeSpaceColor);
    root.style.setProperty("--color-" + color + "-gradient", cardGradient);
  }

  // ==========================================================
  // 🔔 PWA Update Detection & Notification System
  // ==========================================================
  (function initUpdateDetection() {
    if (!("serviceWorker" in navigator)) {
      console.log("Service Workers not supported");
      return;
    }

    let updateBanner = null;
    let newWorker = null;

    function checkForUpdates() {
      navigator.serviceWorker.register("service-worker.js").then((registration) => {
        console.log("[App] ServiceWorker registered");

        // Check for updates immediately
        registration.update();

        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          newWorker = registration.installing;
          console.log("[App] New ServiceWorker found, installing...");

          newWorker.addEventListener("statechange", () => {
            console.log("[App] ServiceWorker state:", newWorker.state);

            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("[App] New ServiceWorker installed, showing update notification");
              showUpdateNotification();
            }
          });
        });

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("[App] New ServiceWorker took control - reloading page");
          // Only reload when controller actually changes
          window.location.reload();
        });
      });
    }

    function showUpdateNotification() {
      if (updateBanner) return;

      updateBanner = document.createElement("div");
      updateBanner.id = "pwa-update-banner";
      updateBanner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
          <p style="margin: 0; font-size: 1rem;">
            🎉 <strong>New version available!</strong> Click 'Update' to get the latest features.
          </p>
          <div style="display: flex; gap: 10px;">
            <button id="update-reload-btn" style="
              padding: 8px 16px;
              border: none;
              border-radius: 4px;
              background: white;
              color: #4facfe;
              font-weight: 700;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              font-size: 0.95rem;
            ">Update Now</button>
            <button id="update-dismiss-btn" style="
              padding: 8px 16px;
              border: 1px solid white;
              border-radius: 4px;
              background: transparent;
              color: white;
              font-weight: 500;
              cursor: pointer;
              font-size: 0.95rem;
            ">Later</button>
          </div>
        </div>
      `;

      updateBanner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 15px 20px;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        color: white;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
        animation: slideUp 0.3s ease-out;
      `;

      document.body.appendChild(updateBanner);

      if (!document.querySelector("#update-banner-styles")) {
        const style = document.createElement("style");
        style.id = "update-banner-styles";
        style.textContent = `
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes slideDown {
            from { transform: translateY(0); }
            to { transform: translateY(100%); }
          }
        `;
        document.head.appendChild(style);
      }

      document.getElementById("update-reload-btn").addEventListener("click", () => {
        console.log("[App] User clicked Update Now");
        if (newWorker) {
          newWorker.postMessage({ type: "SKIP_WAITING" });
        }
        window.location.reload();
      });

      document.getElementById("update-dismiss-btn").addEventListener("click", () => {
        console.log("[App] User dismissed update notification");
        updateBanner.style.animation = "slideDown 0.3s ease-out";
        setTimeout(() => {
          if (updateBanner && updateBanner.parentNode) {
            updateBanner.parentNode.removeChild(updateBanner);
            updateBanner = null;
          }
        }, 300);
      });
    }

    checkForUpdates();
  })();

  // --- Initial Call ---
  initializeControls();
  generateBingoCards();
});