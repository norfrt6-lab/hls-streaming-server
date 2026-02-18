import * as vodRepo from "./vod.repository";
import { AppError } from "../../common/utils/errors";

export async function listRecordings(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  return vodRepo.findMany(params);
}

export async function getRecording(id: string) {
  const recording = await vodRepo.findById(id);
  if (!recording) throw AppError.notFound("Recording not found");
  return recording;
}

export async function deleteRecording(id: string) {
  const recording = await vodRepo.findById(id);
  if (!recording) throw AppError.notFound("Recording not found");
  await vodRepo.remove(id);
}

export async function getManifest(id: string) {
  const recording = await vodRepo.findById(id);
  if (!recording) throw AppError.notFound("Recording not found");
  return { url: `/media/${recording.hlsPath}` };
}
