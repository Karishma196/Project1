import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2 py-1", "bg-blue-500")).toBe("px-2 py-1 bg-blue-500");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "block")).toBe("base block");
  });

  it("resolves tailwind conflicts properly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
