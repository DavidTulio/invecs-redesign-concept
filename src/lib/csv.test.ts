import { describe, expect, it } from "vitest";
import { safeCell, toCsv } from "./csv";

describe("safeCell", () => {
  it.each(["=HYPERLINK(\"http://evil\")", "+1+1", "-2+3", "@SUM(A1)", "\t=1", "\r=1"])(
    "turns %s into plain text",
    (value) => {
      expect(safeCell(value)).toBe(`'${value}`);
    },
  );

  it("leaves normal text, numbers and empty values alone", () => {
    expect(safeCell("Juan dela Cruz")).toBe("Juan dela Cruz");
    expect(safeCell("+639171234567")).toBe("'+639171234567"); // still readable, never a formula
    expect(safeCell(85000)).toBe("85000");
    expect(safeCell(null)).toBe("");
  });
});

describe("toCsv", () => {
  it("quotes commas, quotes and line breaks, and starts with a BOM for Excel", () => {
    const csv = toCsv([
      ["Name", "Message"],
      ["Santos, Ma. Cristina", 'Said "hello"\nthen left'],
    ]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toBe('﻿Name,Message\r\n"Santos, Ma. Cristina","Said ""hello""\nthen left"\r\n');
  });

  it("neutralises formulas inside quoted cells too", () => {
    expect(toCsv([["=1+1,2"]])).toBe("﻿\"'=1+1,2\"\r\n");
  });

  it("keeps ₱ and ñ as they are", () => {
    expect(toCsv([["₱1,280,000", "Parañaque"]])).toContain('"₱1,280,000",Parañaque');
  });
});
