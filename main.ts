import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { fileURLToPath } from "node:url";

/**
 * news-image-01: The Chisato Chronicle: 30-Story Illustrated Broadsheet Edition (13 Nov 2026)
 * Verified Friday 13 November 2026 multi-continent illustrated edition (30 stories).
 */

interface BroadsheetSpec {
  format: "JPEG";
  width: number;
  height: number;
  bytes: number;
  digest: string;
}

const ASSET_FILENAME = "chisato_chronicle.jpg";
const TARGET_WIDTH = 1024;
const TARGET_HEIGHT = 1024;
const BYTE_LIMIT = 1048576;
const EXPECTED_DIGEST = "5192d5c4e627ed72bf8a7660a0c6404c8ba43871246c4db3acc7950df0c03876";

function inspectSofHeader(raw: Buffer): { width: number; height: number } {
  if (raw.length < 4 || raw[0] !== 0xff || raw[1] !== 0xd8) {
    throw new Error("Invalid JPEG header: missing SOI marker");
  }
  if (raw[raw.length - 2] !== 0xff || raw[raw.length - 1] !== 0xd9) {
    throw new Error("Invalid JPEG footer: missing EOI marker");
  }
  let cursor = 2;
  while (cursor + 4 <= raw.length) {
    if (raw[cursor] !== 0xff) {
      throw new Error(`Malformed JPEG marker alignment at ${cursor}`);
    }
    while (cursor < raw.length && raw[cursor] === 0xff) {
      cursor++;
    }
    if (cursor >= raw.length) break;
    const tag = raw[cursor++];
    if (tag === 0xd8 || tag === 0xd9 || (tag >= 0xd0 && tag <= 0xd7) || tag === 0x01) {
      continue;
    }
    if (cursor + 2 > raw.length) break;
    const segLen = raw.readUInt16BE(cursor);
    if (segLen < 2 || cursor + segLen > raw.length) {
      throw new Error(`Out-of-bounds JPEG segment length ${segLen}`);
    }
    if (tag === 0xc0 || tag === 0xc2) {
      if (segLen < 7) throw new Error("Truncated SOF frame segment");
      const height = raw.readUInt16BE(cursor + 3);
      const width = raw.readUInt16BE(cursor + 5);
      return { width, height };
    }
    cursor += segLen;
  }
  throw new Error("No SOF0/SOF2 resolution marker discovered");
}

function verifyBroadsheetPlate(assetPath: string): { payload: Buffer; meta: BroadsheetSpec } {
  const payload = fs.readFileSync(assetPath);
  if (payload.length === 0 || payload.length > BYTE_LIMIT) {
    throw new Error(`Asset byte count ${payload.length} violates 1 MiB ceiling`);
  }
  const { width, height } = inspectSofHeader(payload);
  if (width !== TARGET_WIDTH || height !== TARGET_HEIGHT) {
    throw new Error(`Expected ${TARGET_WIDTH}x${TARGET_HEIGHT}, observed ${width}x${height}`);
  }
  const digest = crypto.createHash("sha256").update(payload).digest("hex");
  if (digest !== EXPECTED_DIGEST) {
    throw new Error(`Integrity check failed: expected ${EXPECTED_DIGEST}, got ${digest}`);
  }
  return {
    payload,
    meta: { format: "JPEG", width, height, bytes: payload.length, digest },
  };
}

function emitEntry(): void {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [path.join(scriptDir, ASSET_FILENAME), path.join("/bot", ASSET_FILENAME)];
  const resolved = candidates.find((p) => fs.existsSync(p));
  if (!resolved) {
    throw new Error(`Missing source front-page graphic: ${ASSET_FILENAME}`);
  }
  const { payload, meta } = verifyBroadsheetPlate(resolved);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  fs.mkdirSync(outDir, { recursive: true });
  const target = path.join(outDir, "entry.png");
  fs.writeFileSync(target, payload);
  if (process.env.MAKEFUN_VERBOSE === "1") {
    console.log(`[${meta.format}] ${meta.width}x${meta.height} (${meta.bytes} B, sha256=${meta.digest.slice(0, 12)}) -> ${target}`);
  }
}

emitEntry();
