/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const customTextInput = document.getElementById("custom-text-input");
  const numPagesInput = document.getElementById("num-pages");
  const pageBackgroundSelect = document.getElementById("page-background");
  const generateBtn = document.getElementById("generate-btn");
  const printBtn = document.getElementById("print-btn");
  const allowRepeatsInput = document.getElementById("allow-repeats");
  const container = document.getElementById("bingo-cards-container");

  let refreshing = false;
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js", { updateViaCache: "none" })
      .then((registration) => {
        registration.update();
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((error) => console.error("Service worker registration failed:", error));

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  let currentColor = "default";
  let freeSpaceStyle = "text";
  let freeSpaceText = "FREE";
  let pageBackground = "none";

  const colorThemes = {
    default: ["#ff69b4", "#8b008b"],
    blue: ["#4facfe", "#00a6c7"],
    purple: ["#a18cd1", "#8f6fc1"],
    orange: ["#fa709a", "#e7a516"],
    green: ["#30cfd0", "#148f78"],
    sunset: ["#ff6b6b", "#ee5a6f"],
    ocean: ["#2e3192", "#168f9d"],
    fire: ["#f12711", "#d47b0b"],
  };

  const freeSpaceColors = {
    text: "#d8b4fe",
    custom: "#d8b4fe",
    star: "#f6c945",
    heart: "#ff9eb5",
    tree: "#9bd3a8",
    snowflake: "#b9e8ff",
    pumpkin: "#ffc27d",
    ghost: "#d9dde3",
    turkey: "#d9b08c",
    gift: "#f4a6b8",
    firework: "#b8a4ff",
    balloon: "#a8d8ff",
    cake: "#ffc4d6",
    clover: "#a8d5a2",
    egg: "#fff0b3",
    bunny: "#f2d4e7",
    flag: "#f4b5b5",
    menorah: "#c7d2e8",
    dreidel: "#b8c9f5",
    owl: "#c6b49a",
  };

  document.querySelectorAll(".color-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".color-btn").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      currentColor = button.dataset.color;
      generateBingoCards();
    });
  });

  document.querySelectorAll(".free-space-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".free-space-btn").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      freeSpaceStyle = button.dataset.style;
      document.getElementById("customTextContainer").style.display =
        freeSpaceStyle === "custom" ? "block" : "none";
      generateBingoCards();
    });
  });

  customTextInput.addEventListener("input", () => {
    freeSpaceText = customTextInput.value.trim() || "FREE";
    generateBingoCards();
  });

  numPagesInput.addEventListener("input", generateBingoCards);
  pageBackgroundSelect.addEventListener("change", () => {
    pageBackground = pageBackgroundSelect.value;
    generateBingoCards();
  });
  allowRepeatsInput.addEventListener("change", generateBingoCards);
  generateBtn.addEventListener("click", generateBingoCards);
  printBtn.addEventListener("click", () => {
    if (!container.querySelector(".bingo-card")) {
      alert("Please generate bingo cards first!");
      return;
    }
    window.print();
  });

  function shuffle(values) {
    for (let index = values.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
    }
    return values;
  }

  function createColumnPools() {
    if (allowRepeatsInput.checked) return null;
    return Array.from({ length: 5 }, (_, column) =>
      shuffle(Array.from({ length: 15 }, (_, offset) => column * 15 + offset + 1))
    );
  }

  function getPageBackground() {
    if (pageBackground === "none") return "#ffffff";
    const [start, end] = colorThemes[currentColor] || colorThemes.default;
    return `linear-gradient(135deg, ${start}1c, ${end}30)`;
  }

  function generate75BallNumbers(columnPools) {
    const numbers = [];
    for (let column = 0; column < 5; column++) {
      const start = column * 15 + 1;
      const values = columnPools
        ? columnPools[column].splice(0, 5)
        : shuffle(Array.from({ length: 15 }, (_, offset) => start + offset)).slice(0, 5);
      values.sort((a, b) => a - b);
      numbers.push(...values);
    }
    return numbers;
  }

  function getFreeSpaceContent() {
    if (freeSpaceStyle === "text" || freeSpaceStyle === "custom") {
      return `<span class="text-style">${escapeHtml(freeSpaceText)}</span>`;
    }
    const emojiMap = {
      star: "⭐", heart: "❤️", tree: "🎄", snowflake: "❄️", pumpkin: "🎃",
      ghost: "👻", turkey: "🦃", gift: "🎁", firework: "🎆", balloon: "🎈",
      cake: "🎂", clover: "🍀", egg: "🥚", bunny: "🐰", flag: "🎌",
      menorah: "🕎", dreidel: "🔯", owl: "🦉",
    };
    return `<span class="shape-style">${emojiMap[freeSpaceStyle] || "⭐"}</span>`;
  }

  function getPageArtwork() {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const context = canvas.getContext("2d");
    const [start, end] = colorThemes[currentColor] || colorThemes.default;
    const accent = freeSpaceColors[freeSpaceStyle] || freeSpaceColors.text;
    const gradient = context.createLinearGradient(0, 0, 1200, 1600);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1200, 1600);
    context.globalAlpha = 0.3;
    context.fillStyle = accent;
    context.beginPath();
    context.arc(930, 250, 170, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 0.5;
    context.fillStyle = end;
    context.beginPath();
    context.moveTo(0, 1080);
    context.quadraticCurveTo(260, 850, 520, 1080);
    context.quadraticCurveTo(850, 850, 1200, 1020);
    context.lineTo(1200, 1600);
    context.lineTo(0, 1600);
    context.fill();
    context.globalAlpha = 0.22;
    context.fillStyle = start;
    context.fillRect(0, 1250, 1200, 350);
    context.globalAlpha = 1;
    drawSceneDetails(context, accent, start, end);
    return canvas.toDataURL("image/png");
  }

  function drawSceneDetails(context, accent, start, end) {
    context.globalAlpha = 0.48;
    context.strokeStyle = end;
    context.lineWidth = 28;
    for (let index = 0; index < 7; index++) {
      const x = 90 + index * 175;
      context.beginPath();
      context.moveTo(x, 1250);
      context.lineTo(x + 90, 720 + (index % 3) * 80);
      context.stroke();
    }
    context.globalAlpha = 0.7;
    context.fillStyle = accent;
    if (freeSpaceStyle === "ghost" || freeSpaceStyle === "pumpkin") {
      context.fillRect(760, 760, 290, 270);
      context.beginPath();
      context.moveTo(720, 760);
      context.lineTo(905, 590);
      context.lineTo(1090, 760);
      context.fill();
      context.fillStyle = end;
      context.fillRect(825, 820, 50, 70);
      context.fillRect(930, 820, 50, 70);
    } else if (freeSpaceStyle === "owl" || freeSpaceStyle === "tree") {
      context.beginPath();
      context.moveTo(600, 650);
      context.lineTo(390, 1080);
      context.lineTo(810, 1080);
      context.closePath();
      context.fill();
      context.beginPath();
      context.moveTo(600, 760);
      context.lineTo(420, 1200);
      context.lineTo(780, 1200);
      context.closePath();
      context.fill();
    } else if (freeSpaceStyle === "bunny" || freeSpaceStyle === "egg") {
      context.beginPath();
      context.ellipse(600, 1100, 110, 135, 0, 0, Math.PI * 2);
      context.fill();
      context.fillRect(545, 850, 35, 180);
      context.fillRect(620, 850, 35, 180);
    } else if (freeSpaceStyle === "gift" || freeSpaceStyle === "cake") {
      context.fillRect(430, 1000, 340, 280);
      context.fillStyle = end;
      context.fillRect(585, 1000, 30, 280);
      context.fillRect(430, 1080, 340, 30);
    } else {
      context.beginPath();
      context.arc(600, 980, 170, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = end;
      context.lineWidth = 24;
      for (let index = 0; index < 8; index++) {
        const angle = (Math.PI * 2 * index) / 8;
        context.beginPath();
        context.moveTo(600, 980);
        context.lineTo(600 + Math.cos(angle) * 300, 980 + Math.sin(angle) * 300);
        context.stroke();
      }
    }
    context.globalAlpha = 1;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[character]);
  }

  function generate75BallCard(id, columnPools) {
    const numbers = generate75BallNumbers(columnPools);
    let cellsHtml = `<div class="header-bar"><div class="header-cell">B</div><div class="header-cell">I</div><div class="header-cell">N</div><div class="header-cell">G</div><div class="header-cell">O</div></div>`;
    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 5; column++) {
        const isFreeSpace = row === 2 && column === 2;
        const number = numbers[column * 5 + row];
        const content = isFreeSpace ? getFreeSpaceContent() : `<span>${number}</span>`;
        cellsHtml += `<div class="cell ${isFreeSpace ? "cell-free-space" : "cell-number"}"><div class="cell-content-wrapper"><div class="cell-content">${content}</div></div></div>`;
      }
    }
    return `<div class="bingo-card bingo-card-75" data-id="${id + 1}">${cellsHtml}</div>`;
  }

  function getCardSignature(card) {
    return Array.from(card.querySelectorAll(".cell-number span"), (cell) => cell.textContent).join(",");
  }

  function applyColorVariables() {
    const [start, end] = colorThemes[currentColor] || colorThemes.default;
    document.documentElement.style.setProperty("--header-bg-color", `linear-gradient(90deg, ${start}, ${end})`);
    document.documentElement.style.setProperty("--card-border-color", end);
  }

  function generateBingoCards() {
    const totalPages = Math.min(10, Math.max(1, parseInt(numPagesInput.value, 10) || 1));
    numPagesInput.value = totalPages;
    const cardsPerPage = 9;
    let html = "";
    const signatures = new Set();

    for (let page = 0; page < totalPages; page++) {
      const columnPoolsByGroup = Array.from({ length: 3 }, createColumnPools);
      const themedClass = pageBackground === "themed" ? " page-themed" : "";
      let pageHtml = `<div class="page${themedClass}" data-free-space="${freeSpaceStyle}" style="--page-background: ${getPageBackground()};"><div class="page-artwork-wrap" aria-hidden="true"><img class="page-artwork" src="${getPageArtwork()}" alt="" /></div><div class="container container-75">`;
      for (let cardOnPage = 0; cardOnPage < cardsPerPage; cardOnPage++) {
        const group = cardOnPage % 3;
        const pools = columnPoolsByGroup[group];
        let cardHtml;
        let signature;
        let attempts = 0;
        do {
          const poolSnapshot = pools?.map((pool) => [...pool]);
          cardHtml = generate75BallCard(page * cardsPerPage + cardOnPage, pools);
          const template = document.createElement("template");
          template.innerHTML = cardHtml;
          signature = getCardSignature(template.content);
          if (signatures.has(signature) && poolSnapshot) {
            poolSnapshot.forEach((pool, column) => {
              pools[column] = pool;
            });
          }
          attempts++;
        } while (signatures.has(signature) && attempts < 100);
        signatures.add(signature);
        pageHtml += cardHtml;
      }
      html += `${pageHtml}</div></div>`;
    }
    container.innerHTML = html;
    applyColorVariables();
  }

  generateBingoCards();
});
