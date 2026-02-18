import { vi } from "vitest";

function createModelMock() {
  return {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };
}

export const prisma = {
  user: createModelMock(),
  stream: createModelMock(),
  streamSession: createModelMock(),
  chatMessage: createModelMock(),
  userBan: createModelMock(),
  viewerEvent: createModelMock(),
  recording: createModelMock(),
  auditLog: createModelMock(),
  $transaction: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};
