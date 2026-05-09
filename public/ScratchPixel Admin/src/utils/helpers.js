export function capitalize(value = "") {
  const text = String(value || "").trim();

  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function titleCase(value = "") {
  return String(value || "")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(capitalize)
    .join(" ");
}

export function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export function getInitials(name = "User") {
  const cleanName = String(name || "User").trim();

  return cleanName
    .split(" ")
    .filter(Boolean)
    .map((item) => item.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function truncateText(text = "", maxLength = 40) {
  const value = String(text || "");

  if (!value) return "";
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength)}...`;
}

export function generateReferralCode(name = "USER") {
  const cleanName = String(name || "USER")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${cleanName || "USER"}${random}`;
}

export function normalizeStatus(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function copyToClipboard(text = "") {
  return navigator.clipboard.writeText(String(text || ""));
}

export function downloadCSV(filename = "export.csv", rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return;

  const headers = Object.keys(rows[0] || {});

  if (headers.length === 0) return;

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row?.[header] ?? "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}