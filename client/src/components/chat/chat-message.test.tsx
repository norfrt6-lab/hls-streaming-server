import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "./chat-message";
import type { ChatMessageReceived } from "@/types/socket";

// Mock the formatRelativeTime function for predictable output
vi.mock("@/lib/utils", () => ({
  formatRelativeTime: vi.fn().mockReturnValue("2m ago"),
  cn: (...inputs: string[]) => inputs.filter(Boolean).join(" "),
}));

const baseMessage: ChatMessageReceived = {
  id: "m1",
  userId: "u1",
  username: "alice",
  displayName: "Alice",
  avatarUrl: null,
  content: "Hello world!",
  timestamp: new Date().toISOString(),
};

describe("ChatMessage", () => {
  it("renders username, content and timestamp", () => {
    render(<ChatMessage message={baseMessage} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Hello world!")).toBeInTheDocument();
    expect(screen.getByText("2m ago")).toBeInTheDocument();
  });

  it("falls back to username when displayName is null", () => {
    render(
      <ChatMessage
        message={{ ...baseMessage, displayName: null, username: "bob" }}
      />,
    );
    expect(screen.getByText("bob")).toBeInTheDocument();
  });

  it("shows first letter as avatar fallback", () => {
    render(<ChatMessage message={baseMessage} />);
    // "A" for "Alice"
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
