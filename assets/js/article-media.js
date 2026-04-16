const MERMAID_BLOCK_SELECTOR = "[data-mermaid-block]";
const MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

let mermaidPromise;
let observerBound = false;

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "default";
}

async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import(MERMAID_CDN).then((mod) => mod.default);
  }
  return mermaidPromise;
}

function sourceFor(block) {
  const sourceNode = block.querySelector("[data-mermaid-source]");
  return sourceNode ? sourceNode.textContent.trim() : "";
}

async function renderMermaidBlock(block, mermaid, theme, force = false) {
  const source = sourceFor(block);
  const canvas = block.querySelector("[data-mermaid-canvas]");

  if (!source || !canvas) {
    return;
  }

  if (!force && block.dataset.renderTheme === theme) {
    return;
  }

  const blockId = block.dataset.mermaidId || `mermaid-${Math.random().toString(36).slice(2, 10)}`;
  block.dataset.mermaidId = blockId;

  try {
    const renderId = `${blockId}-${theme}`;
    const { svg, bindFunctions } = await mermaid.render(renderId, source);
    canvas.innerHTML = svg;
    bindFunctions?.(canvas);
    block.dataset.renderTheme = theme;
    block.classList.add("is-ready");
    block.classList.remove("is-error");
  } catch (error) {
    block.classList.add("is-error");
    console.error("Mermaid render failed:", error);
  }
}

async function renderMermaidBlocks(force = false) {
  const blocks = Array.from(document.querySelectorAll(MERMAID_BLOCK_SELECTOR));
  if (!blocks.length) {
    return;
  }

  const mermaid = await loadMermaid();
  const theme = currentTheme();

  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: "loose",
    suppressErrorRendering: true,
    fontFamily: "inherit",
  });

  for (const block of blocks) {
    await renderMermaidBlock(block, mermaid, theme, force);
  }
}

function bindThemeObserver() {
  if (observerBound) {
    return;
  }

  const root = document.documentElement;
  const observer = new MutationObserver((mutations) => {
    const themeChanged = mutations.some(
      (mutation) => mutation.type === "attributes" && mutation.attributeName === "data-theme",
    );
    if (themeChanged) {
      void renderMermaidBlocks(true);
    }
  });

  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  observerBound = true;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector(MERMAID_BLOCK_SELECTOR)) {
    return;
  }

  bindThemeObserver();
  void renderMermaidBlocks();
});
