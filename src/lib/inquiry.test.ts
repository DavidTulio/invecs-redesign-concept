import { describe, expect, it } from "vitest";
import { fieldErrors, makeInquirySchema, manilaDate, normalizePhilippineMobile } from "./inquiry";

// 16 Oct 2026, 11 PM in Manila (15:00 UTC). "Tomorrow" in Manila is 17 Oct.
const NOW = new Date("2026-10-16T15:00:00Z");
const schema = makeInquirySchema(NOW);

const valid = {
  car: "2021-toyota-fortuner-2-8-v-4x4",
  name: "Juan dela Cruz",
  phone: "0917 123 4567",
  email: "",
  contact_method: "viber",
  preferred_date: "2026-10-20",
  message: "Is this still available?",
};

const errorsFor = (input: Record<string, unknown>) => {
  const result = schema.safeParse(input);
  return result.success ? {} : fieldErrors(result.error);
};

describe("normalizePhilippineMobile", () => {
  it.each([
    ["0917 123 4567", "+639171234567"],
    ["+63 917-123-4567", "+639171234567"],
    ["639171234567", "+639171234567"],
    ["(0917) 123.4567", "+639171234567"],
  ])("turns %s into %s", (input, expected) => {
    expect(normalizePhilippineMobile(input)).toBe(expected);
  });

  it.each(["12345", "0217 123 4567", "0917 123 456", "abc"])("rejects %s", (input) => {
    expect(normalizePhilippineMobile(input)).toBeNull();
  });
});

describe("manilaDate", () => {
  it("uses Philippine time, not the server's time zone", () => {
    expect(manilaDate(NOW)).toBe("2026-10-16");
    expect(manilaDate(new Date("2026-10-16T16:30:00Z"))).toBe("2026-10-17"); // 00:30 in Manila
  });
});

describe("inquiry schema", () => {
  it("accepts a normal inquiry and cleans it up", () => {
    const result = schema.parse(valid);
    expect(result.phone).toBe("+639171234567");
    expect(result.email).toBeUndefined();
    expect(result.name).toBe("Juan dela Cruz");
  });

  it("allows a general question with no car or date", () => {
    expect(schema.safeParse({ ...valid, car: "", preferred_date: "" }).success).toBe(true);
  });

  it("requires a phone number for calls and Viber", () => {
    expect(errorsFor({ ...valid, phone: "" }).phone).toMatch(/mobile number/);
    expect(errorsFor({ ...valid, contact_method: "call", phone: "" }).phone).toBeDefined();
  });

  it("requires an email when email is the contact method", () => {
    expect(errorsFor({ ...valid, contact_method: "email" }).email).toBeDefined();
    expect(schema.safeParse({ ...valid, contact_method: "email", email: "Juan@Example.com" }).success).toBe(true);
  });

  it("lowercases email addresses", () => {
    expect(schema.parse({ ...valid, email: "Juan@Example.COM" }).email).toBe("juan@example.com");
  });

  it("rejects test-drive dates in the past, today, or too far ahead", () => {
    expect(errorsFor({ ...valid, preferred_date: "2026-10-16" }).preferred_date).toBeDefined();
    expect(errorsFor({ ...valid, preferred_date: "2027-03-01" }).preferred_date).toBeDefined();
    expect(errorsFor({ ...valid, preferred_date: "2026-10-17" }).preferred_date).toBeUndefined();
  });

  it("rejects unknown contact methods and bad car slugs", () => {
    expect(errorsFor({ ...valid, contact_method: "fax" }).contact_method).toBeDefined();
    expect(errorsFor({ ...valid, car: "../../etc/passwd" }).car).toBeDefined();
  });

  it("rejects over-long input", () => {
    expect(errorsFor({ ...valid, name: "x".repeat(81) }).name).toBeDefined();
    expect(errorsFor({ ...valid, message: "x".repeat(1001) }).message).toBeDefined();
  });

  it("rejects messages stuffed with links (a common spam pattern)", () => {
    const spam = "Cheap deals http://a.example http://b.example www.c.example";
    expect(errorsFor({ ...valid, message: spam }).message).toMatch(/links/);
  });

  it("keeps SQL-like text as plain text instead of rejecting it", () => {
    // The database driver sends values separately from the query, so this is harmless data.
    const result = schema.parse({ ...valid, message: "'; DROP TABLE cars; --" });
    expect(result.message).toBe("'; DROP TABLE cars; --");
  });

  it("drops fields that aren't part of the form", () => {
    const result = schema.parse({ ...valid, status: "closed", created_at: "2099-01-01" });
    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("created_at");
  });
});
