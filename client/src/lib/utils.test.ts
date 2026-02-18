import { describe, it, expect, vi, afterEach } from "vitest";
import { cn, formatDuration, formatBytes, formatNumber, formatRelativeTime } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles tailwind conflicts", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });
});

describe("formatDuration", () => {
  it("formats 0 seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats seconds only", () => {
    expect(formatDuration(45)).toBe("0:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(125)).toBe("2:05");
  });

  it("formats hours, minutes and seconds", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });
});

describe("formatNumber", () => {
  it("formats small numbers as-is", () => {
    expect(formatNumber(42)).toBe("42");
  });

  it("formats thousands with K", () => {
    expect(formatNumber(1500)).toBe("1.5K");
  });

  it("formats millions with M", () => {
    expect(formatNumber(2500000)).toBe("2.5M");
  });
});

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for recent times", () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("returns minutes ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:05:00Z"));
    expect(formatRelativeTime("2026-01-01T12:00:00Z")).toBe("5m ago");
  });

  it("returns hours ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T15:00:00Z"));
    expect(formatRelativeTime("2026-01-01T12:00:00Z")).toBe("3h ago");
  });

  it("returns days ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-03T12:00:00Z"));
    expect(formatRelativeTime("2026-01-01T12:00:00Z")).toBe("2d ago");
  });
});
