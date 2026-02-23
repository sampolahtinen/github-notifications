/**
 * A single line parsed from a diff hunk
 */
export interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNumber?: number;
}

/**
 * Parse a diff hunk string into structured lines with add/remove/context markers.
 * Handles the @@ header line and subsequent +, -, and context lines.
 */
export function parseDiffHunk(hunk: string): DiffLine[] {
  if (!hunk || hunk.trim() === "") {
    return [];
  }

  const rawLines = hunk.split("\n");
  const lines: DiffLine[] = [];
  let currentLine: number | undefined;

  for (const raw of rawLines) {
    const headerMatch = /^@@\s+-\d+(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/.exec(raw);
    if (headerMatch?.[1]) {
      currentLine = Number(headerMatch[1]);
      continue;
    }

    if (raw.startsWith("+")) {
      lines.push({
        type: "add",
        content: raw.slice(1),
        lineNumber: currentLine,
      });
      if (currentLine !== undefined) {
        currentLine++;
      }
    } else if (raw.startsWith("-")) {
      lines.push({
        type: "remove",
        content: raw.slice(1),
        lineNumber: currentLine,
      });
    } else {
      lines.push({
        type: "context",
        content: raw.startsWith(" ") ? raw.slice(1) : raw,
        lineNumber: currentLine,
      });
      if (currentLine !== undefined) {
        currentLine++;
      }
    }
  }

  return lines;
}
