const gradients = {
  pink: "linear-gradient(90deg, #ff69b4 0%, #da70d6 25%, #ba55d3 50%, #9932cc 75%, #8b008b 100%)",
  blue: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
  purple: "linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)",
  orange: "linear-gradient(90deg, #fa709a 0%, #fee140 100%)",
  green: "linear-gradient(90deg, #30cfd0 0%, #330867 100%)",
  sunset: "linear-gradient(90deg, #ff6b6b 0%, #feca57 50%, #ee5a6f 100%)",
  ocean: "linear-gradient(90deg, #2e3192 0%, #1bffff 100%)",
  fire: "linear-gradient(90deg, #f12711 0%, #f5af19 100%)",
};

let currentGradient = gradients.pink;
let currentGradientName = "pink";
let freeSpaceStyle = "text";
let customText = "Free Space";

const shapes = {
  star: "⭐",
  heart: "❤️",
  tree: "🎄",
  snowflake: "❄️",
  pumpkin: "🎃",
  gift: "🎁",
  owl: "🦉",
  ghost: "👻",
  firework: "🎆",
  balloon: "🎈",
  cake: "🎂",
  clover: "🍀",
  egg: "🥚",
  flag: "🎌",
  turkey: "🦃",
  menorah: "🕎",
  dreidel: "🔯",
  bunny: "🐰",
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createCell(content = "", classes = "") {
  const wrapper = document.createElement("div");
  wrapper.classList.add("cell-content");
  wrapper.innerHTML = content;

  const cellWrapper = document.createElement("div");
  cellWrapper.classList.add("cell-content-wrapper");
  cellWrapper.appendChild(wrapper);

  const cell = document.createElement("div");
  cell.classList.add("cell", ...classes.split(" ").filter((c) => c));
  cell.appendChild(cellWrapper);
  return cell;
}

function createBingoCard() {
  const card = document.createElement("div");
  card.classList.add("bingo-card");

  const headerLetters = ["B", "I", "N", "G", "O"]; // Header row

  headerLetters.forEach((letter) => {
    const headerCell = createCell(letter, "cell-header");
    headerCell.style.background = currentGradient;
    card.appendChild(headerCell);
  }); // Number cells (5 rows x 5 columns)

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        // Free space
        const freeSpaceCell = createCell("", "cell-free-space");
        freeSpaceCell.setAttribute("data-col", col);
        freeSpaceCell.setAttribute("data-row", row);
        updateFreeSpace(freeSpaceCell);
        card.appendChild(freeSpaceCell);
      } else {
        // Number cell
        const numberCell = createCell("", "cell-number");
        numberCell.setAttribute("data-col", col);
        numberCell.setAttribute("data-row", row);
        card.appendChild(numberCell);
      }
    }
  }

  return card;
}

function updateFreeSpace(cell) {
  const contentText =
    freeSpaceStyle === "text" || freeSpaceStyle === "custom"
      ? freeSpaceStyle === "custom"
        ? customText
        : "Free Space"
      : shapes[freeSpaceStyle];

  const contentDiv = cell.querySelector(".cell-content");
  contentDiv.textContent = contentText;

  contentDiv.className = "cell-content";

  if (freeSpaceStyle === "text" || freeSpaceStyle === "custom") {
    contentDiv.classList.add("text-style");
  } else {
    contentDiv.classList.add("shape-style");
  }

  cell.style.background = currentGradient;
}

function getCardHash(card) {
  const numbers = [];
  card.querySelectorAll(".cell-number").forEach((cell) => {
    const text = cell.querySelector(".cell-content").textContent.trim();
    if (text && !isNaN(text)) {
      numbers.push(parseInt(text));
    }
  });
  numbers.sort((a, b) => a - b);
  return numbers.join("-");
}

function generateCards() {
  const pageCount = parseInt(document.getElementById("pageCount").value);
  const allowRepeats = document.getElementById("allowRepeats").checked;
  const pagesContainer = document.getElementById("pages-container");

  pagesContainer.innerHTML = "";

  const allGeneratedHashes = new Set();

  for (let p = 0; p < pageCount; p++) {
    const page = document.createElement("div");
    page.className = "page";

    const container = document.createElement("div");
    container.className = "container";

    const cards = [];
    for (let i = 0; i < 9; i++) {
      const card = createBingoCard();
      container.appendChild(card);
      cards.push(card);
    }

    page.appendChild(container);
    pagesContainer.appendChild(page); // Generate numbers for each BINGO column

    for (let bingoCol = 0; bingoCol < 5; bingoCol++) {
      const min = bingoCol * 15 + 1;
      const max = (bingoCol + 1) * 15;

      if (!allowRepeats) {
        // Group cards VERTICALLY: 0,3,6 then 1,4,7 then 2,5,8
        for (let verticalGroup = 0; verticalGroup < 3; verticalGroup++) {
          const allNumbers = Array.from(
            { length: max - min + 1 },
            (_, i) => min + i
          );
          shuffleArray(allNumbers);

          const cardIndices = [
            verticalGroup,
            verticalGroup + 3,
            verticalGroup + 6,
          ];
          let numIndex = 0;

          cardIndices.forEach((cardIdx) => {
            const card = cards[cardIdx];
            const cellsInColumn = Array.from(
              card.querySelectorAll(".cell-number, .cell-free-space")
            ).filter(
              (cell) => parseInt(cell.getAttribute("data-col")) === bingoCol
            );

            cellsInColumn.forEach((cell) => {
              if (!cell.classList.contains("cell-free-space")) {
                cell.querySelector(".cell-content").textContent =
                  allNumbers[numIndex];
                numIndex++;
              }
            });
          });
        }
      } else {
        // Each card gets its own random numbers
        cards.forEach((card) => {
          const allNumbers = Array.from(
            { length: max - min + 1 },
            (_, i) => min + i
          );
          shuffleArray(allNumbers);

          const cellsInColumn = Array.from(
            card.querySelectorAll(".cell-number, .cell-free-space")
          ).filter(
            (cell) => parseInt(cell.getAttribute("data-col")) === bingoCol
          );

          let numIndex = 0;
          cellsInColumn.forEach((cell) => {
            if (!cell.classList.contains("cell-free-space")) {
              cell.querySelector(".cell-content").textContent =
                allNumbers[numIndex];
              numIndex++;
            }
          });
        });
      }
    } // Check for duplicate cards across all pages

    cards.forEach((card) => {
      const cardHash = getCardHash(card);
      let attempts = 0;

      while (allGeneratedHashes.has(cardHash) && attempts < 100) {
        attempts++; // Regenerate this card

        for (let bingoCol = 0; bingoCol < 5; bingoCol++) {
          const min = bingoCol * 15 + 1;
          const max = (bingoCol + 1) * 15;
          const allNumbers = Array.from(
            { length: max - min + 1 },
            (_, i) => min + i
          );
          shuffleArray(allNumbers);

          const cellsInColumn = Array.from(
            card.querySelectorAll(".cell-number, .cell-free-space")
          ).filter(
            (cell) => parseInt(cell.getAttribute("data-col")) === bingoCol
          );

          let numIndex = 0;
          cellsInColumn.forEach((cell) => {
            if (!cell.classList.contains("cell-free-space")) {
              cell.querySelector(".cell-content").textContent =
                allNumbers[numIndex];
              numIndex++;
            }
          });
        }

        const newHash = getCardHash(card);
        if (!allGeneratedHashes.has(newHash)) {
          allGeneratedHashes.add(newHash);
          break;
        }
      }

      if (!allGeneratedHashes.has(cardHash)) {
        allGeneratedHashes.add(cardHash);
      }
    });
  }

  applyGradient();
}

function applyGradient() {
  document.querySelectorAll(".cell-header").forEach((header) => {
    header.style.background = currentGradient;
  });
  document.querySelectorAll(".cell-free-space").forEach((space) => {
    space.style.background = currentGradient;
  });
}

function printCards() {
  const pagesContainer = document.getElementById("pages-container");
  if (pagesContainer.children.length === 0) {
    alert("Please generate cards first before printing!");
    return;
  }
  window.print();
}

document.addEventListener("DOMContentLoaded", () => {
  // Color picker
  const colorBtns = document.querySelectorAll(".color-btn");
  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      colorBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentGradientName = btn.dataset.gradient;
      currentGradient = gradients[currentGradientName];
      applyGradient();
    });
  }); // Free space style picker

  const freeSpaceBtns = document.querySelectorAll(".free-space-btn");
  const customTextContainer = document.getElementById("customTextContainer");
  const customTextInput = document.getElementById("customTextInput");

  freeSpaceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      freeSpaceBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      freeSpaceStyle = btn.dataset.style;

      customTextContainer.style.display =
        freeSpaceStyle === "custom" ? "block" : "none";

      document.querySelectorAll(".cell-free-space").forEach((cell) => {
        updateFreeSpace(cell);
      });
    });
  }); // Custom text input

  customTextInput.addEventListener("input", (e) => {
    customText = e.target.value || "Free Space";
    if (freeSpaceStyle === "custom") {
      document.querySelectorAll(".cell-free-space").forEach((cell) => {
        updateFreeSpace(cell);
      });
    }
  }); // Generate initial page

  generateCards(); // Register Service Worker for PWA

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("service-worker.js")
        .then((registration) => console.log("Service Worker registered"))
        .catch((err) =>
          console.log("Service Worker registration failed:", err)
        );
    });
  }
});