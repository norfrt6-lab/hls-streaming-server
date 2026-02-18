import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hls-stream.local" },
    update: {},
    create: {
      username: "admin",
      email: "admin@hls-stream.local",
      password: adminPassword,
      displayName: "Administrator",
      role: "admin",
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create demo streamer
  const streamerPassword = await bcrypt.hash("streamer123", 12);
  const streamer = await prisma.user.upsert({
    where: { email: "streamer@hls-stream.local" },
    update: {},
    create: {
      username: "streamer",
      email: "streamer@hls-stream.local",
      password: streamerPassword,
      displayName: "Demo Streamer",
      role: "streamer",
    },
  });
  console.log(`Streamer user created: ${streamer.email}`);

  // Create a stream for the streamer
  const rawKey = uuidv4();
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
  const stream = await prisma.stream.upsert({
    where: { streamKey: hashedKey },
    update: {},
    create: {
      userId: streamer.id,
      title: "Demo Stream",
      description: "A demo stream for testing",
      category: "Technology",
      streamKey: hashedKey,
    },
  });
  console.log(`Stream created: ${stream.title} (key: ${rawKey})`);

  // Create demo viewer
  const viewerPassword = await bcrypt.hash("viewer123", 12);
  const viewer = await prisma.user.upsert({
    where: { email: "viewer@hls-stream.local" },
    update: {},
    create: {
      username: "viewer",
      email: "viewer@hls-stream.local",
      password: viewerPassword,
      displayName: "Demo Viewer",
      role: "viewer",
    },
  });
  console.log(`Viewer user created: ${viewer.email}`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
