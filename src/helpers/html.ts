// utils/html.ts
export function htmlToPlainText(input?: string | null): string {
  if (!input) return "";

  // 1) Decodificar entidades HTML (&lt;br&gt; -> <br>, etc.)
  const textarea = document.createElement("textarea");
  textarea.innerHTML = input;
  const decoded = textarea.value;

  // 2) Trocar <br> por quebras de linha
  const withNewlines = decoded.replace(/<br\s*\/?>/gi, "\n");

  // 3) Limpar lixo extra e trims
  return withNewlines
    .replace(/(\n\s*){2,}/g, "\n\n") // colapsar múltiplas linhas vazias
    .trim();
}
