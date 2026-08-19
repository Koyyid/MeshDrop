/** Helper DOM bersama ditempatkan di sini ketika UI mulai memiliki beberapa modul. */
export function byId(id) {
  return document.getElementById(id);
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
