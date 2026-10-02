import { put as vercelPut } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export interface StoragePutResult {
  url?: string;
  storageKey: string;
}

export interface DownloadInfo {
  stream: ReadableStream<Uint8Array> | Buffer;
  contentType?: string;
}

export function isStorageConfigured(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN.trim() !== "") {
    return true;
  }
  if (process.env.ALLOW_LOCAL_STORAGE === "true") {
    return true;
  }
  return false;
}

export async function put(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<StoragePutResult> {
  if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN.trim() !== "") {
    const blob = await vercelPut(key, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return {
      url: blob.url,
      storageKey: blob.url,
    };
  }

  if (process.env.ALLOW_LOCAL_STORAGE === "true") {
    const localDir = path.join(process.cwd(), ".uploads");
    const safeKey = key.replace(/[^a-zA-Z0-9_\-\.\/]/g, "_");
    const filePath = path.join(localDir, safeKey);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return {
      storageKey: `local://${safeKey}`,
    };
  }

  throw new Error("File storage is not configured — send files to ocnksglobal@gmail.com instead");
}

export async function getDownloadInfo(storageKey: string): Promise<DownloadInfo | null> {
  if (storageKey.startsWith("local://")) {
    const relativeKey = storageKey.replace("local://", "");
    const filePath = path.join(process.cwd(), ".uploads", relativeKey);
    try {
      const buffer = await fs.readFile(filePath);
      return { stream: buffer };
    } catch {
      return null;
    }
  }

  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    try {
      const res = await fetch(storageKey);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const contentType = res.headers.get("content-type") || undefined;
      return {
        stream: Buffer.from(arrayBuffer),
        contentType,
      };
    } catch {
      return null;
    }
  }

  return null;
}
