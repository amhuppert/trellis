import { describe, expect, it } from "vitest";
import { validate } from "../validate";

describe("postgres-mvcc fixture", () => {
  it("validates with zero errors", async () => {
    const result = await validate("postgres-mvcc");
    expect(result.errors).toEqual([]);
  });
});
