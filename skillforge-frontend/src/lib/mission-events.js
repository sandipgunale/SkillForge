export const OPEN_PALETTE_EVENT = "skillforge:open-palette";
export const OPEN_AI_CENTER_EVENT = "skillforge:open-ai-center";

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
}

export function openAiCenter() {
  window.dispatchEvent(new CustomEvent(OPEN_AI_CENTER_EVENT));
}

export function listenFor(eventName, handler) {
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}
