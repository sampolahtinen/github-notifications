import { describe, expect, it } from "vitest";
import { parseDiffHunk } from "./diff-hunk";

describe("parseDiffHunk", () => {
  it("parses a diff hunk into structured lines with add/remove/context types", () => {
    const hunk = [
      "@@ -10,4 +10,5 @@",
      " const a = 1;",
      "-const b = 2;",
      "+const b = 3;",
      "+const c = 4;",
      " const d = 5;",
    ].join("\n");

    const lines = parseDiffHunk(hunk);

    expect(lines).toHaveLength(5);

    const first = lines[0];
    if (!first) throw new Error("Expected first line");
    expect(first.type).toBe("context");
    expect(first.content).toBe("const a = 1;");

    const second = lines[1];
    if (!second) throw new Error("Expected second line");
    expect(second.type).toBe("remove");
    expect(second.content).toBe("const b = 2;");

    const third = lines[2];
    if (!third) throw new Error("Expected third line");
    expect(third.type).toBe("add");
    expect(third.content).toBe("const b = 3;");

    const fourth = lines[3];
    if (!fourth) throw new Error("Expected fourth line");
    expect(fourth.type).toBe("add");
    expect(fourth.content).toBe("const c = 4;");

    const fifth = lines[4];
    if (!fifth) throw new Error("Expected fifth line");
    expect(fifth.type).toBe("context");
    expect(fifth.content).toBe("const d = 5;");
  });

  it("returns an empty array for an empty or missing diff hunk", () => {
    expect(parseDiffHunk("")).toEqual([]);
    expect(parseDiffHunk("   ")).toEqual([]);
  });

  it("assigns line numbers starting from the @@ header", () => {
    const hunk = ["@@ -1,3 +5,3 @@", " unchanged", "+added", " also unchanged"].join("\n");

    const lines = parseDiffHunk(hunk);

    const first = lines[0];
    if (!first) throw new Error("Expected first line");
    expect(first.lineNumber).toBe(5);

    const second = lines[1];
    if (!second) throw new Error("Expected second line");
    expect(second.lineNumber).toBe(6);
    expect(second.type).toBe("add");

    const third = lines[2];
    if (!third) throw new Error("Expected third line");
    expect(third.lineNumber).toBe(7);
  });

  it("handles a hunk with only removal lines without incrementing line numbers", () => {
    const hunk = [
      "@@ -5,3 +5,1 @@",
      "-const old1 = 'a';",
      "-const old2 = 'b';",
      "-const old3 = 'c';",
    ].join("\n");

    const lines = parseDiffHunk(hunk);

    expect(lines).toHaveLength(3);
    for (const line of lines) {
      expect(line.type).toBe("remove");
      expect(line.lineNumber).toBe(5);
    }
  });

  it("handles a hunk with only addition lines and increments line numbers correctly", () => {
    const hunk = [
      "@@ -10,0 +10,3 @@",
      "+const x = 1;",
      "+const y = 2;",
      "+const z = 3;",
    ].join("\n");

    const lines = parseDiffHunk(hunk);

    expect(lines).toHaveLength(3);

    const first = lines[0];
    if (!first) throw new Error("Expected first line");
    expect(first.type).toBe("add");
    expect(first.lineNumber).toBe(10);

    const second = lines[1];
    if (!second) throw new Error("Expected second line");
    expect(second.lineNumber).toBe(11);

    const third = lines[2];
    if (!third) throw new Error("Expected third line");
    expect(third.lineNumber).toBe(12);
  });
});
