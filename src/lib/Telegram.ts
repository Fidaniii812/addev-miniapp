export function isTelegram() {
  return typeof window !== "undefined" && "Telegram" in window;
}
