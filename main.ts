import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { fileURLToPath } from "node:url";

/**
 * TakinaInoue27 — News-Image-01 Frontpage Atlas Entrypoint:
 * "Friday 13 November 2026: 31 Verified Stories Across 6 Continents & Global Map"
 *
 * Validates and emits the 1024x1024 frontpage broadsheet (`frontpage.jpg`)
 * to `/output/entry.png` for the make.fun `news-image-01` competition.
 */

interface FrontpageSpec {
  encoding: "JPEG";
  cols: number;
  rows: number;
  byteCount: number;
  sha256Hex: string;
}

const FRONTPAGE_ASSET = "frontpage.jpg";
const REQUIRED_COLS = 1024;
const REQUIRED_ROWS = 1024;
const BYTE_BUDGET = 1048576;
const EXPECTED_FRONTPAGE_SHA256 = "d1bc706cfc2ace48ca3a786c0d7b46b78d0982d12b768f1e4a612d9f9556bd24";

function extractJpegFrameSize(buf: Buffer): { cols: number; rows: number } {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error("Missing JPEG SOI signature (0xFFD8)");
  }
  if (buf[buf.length - 2] !== 0xff || buf[buf.length - 1] !== 0xd9) {
    throw new Error("Missing JPEG EOI marker (0xFFD9)");
  }

  let idx = 2;
  while (idx + 4 <= buf.length) {
    if (buf[idx] !== 0xff) {
      throw new Error(`Invalid JPEG segment prefix at byte ${idx}`);
    }
    while (idx < buf.length && buf[idx] === 0xff) {
      idx++;
    }
    if (idx >= buf.length) break;
    const tag = buf[idx];
    idx++;

    if (tag === 0xd8 || tag === 0xd9 || (tag >= 0xd0 && tag <= 0xd7) || tag === 0x01) {
      continue;
    }
    if (idx + 2 > buf.length) break;
    const blockLen = buf.readUInt16BE(idx);
    if (blockLen < 2 || idx + blockLen > buf.length) {
      throw new Error(`Out-of-bounds JPEG block length ${blockLen} at tag 0x${tag.toString(16)}`);
    }

    if (tag === 0xc0 || tag === 0xc2) {
      if (blockLen < 7) {
        throw new Error("Incomplete JPEG SOF segment");
      }
      const rows = buf.readUInt16BE(idx + 3);
      const cols = buf.readUInt16BE(idx + 5);
      return { cols, rows };
    }
    idx += blockLen;
  }
  throw new Error("No SOF0/SOF2 frame header located in JPEG buffer");
}

function loadAndCheckFrontpage(assetFile: string): { payload: Buffer; spec: FrontpageSpec } {
  const payload = fs.readFileSync(assetFile);
  if (payload.length === 0 || payload.length > BYTE_BUDGET) {
    throw new Error(`Frontpage size ${payload.length} exceeds 1 MiB budget (${BYTE_BUDGET})`);
  }

  const { cols, rows } = extractJpegFrameSize(payload);
  if (cols !== REQUIRED_COLS || rows !== REQUIRED_ROWS) {
    throw new Error(`Frontpage geometry ${cols}x${rows} does not match ${REQUIRED_COLS}x${REQUIRED_ROWS}`);
  }

  const sha256Hex = crypto.createHash("sha256").update(payload).digest("hex");
  if (sha256Hex !== EXPECTED_FRONTPAGE_SHA256) {
    throw new Error(`Frontpage digest mismatch: expected ${EXPECTED_FRONTPAGE_SHA256}, actual ${sha256Hex}`);
  }

  return {
    payload,
    spec: {
      encoding: "JPEG",
      cols,
      rows,
      byteCount: payload.length,
      sha256Hex,
    },
  };
}

function emitEntryImage(): void {
  const baseDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(baseDir, FRONTPAGE_ASSET),
    path.join("/bot", FRONTPAGE_ASSET),
  ];

  let chosenFile = "";
  for (const item of candidates) {
    if (fs.existsSync(item)) {
      chosenFile = item;
      break;
    }
  }
  if (!chosenFile) {
    throw new Error(`Cannot locate ${FRONTPAGE_ASSET} in repository root`);
  }

  const { payload, spec } = loadAndCheckFrontpage(chosenFile);
  const outRoot = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  fs.mkdirSync(outRoot, { recursive: true });
  const targetPng = path.join(outRoot, "entry.png");
  fs.writeFileSync(targetPng, payload);

  if (process.env.MAKEFUN_VERBOSE === "1") {
    console.log(
      `[takinainoue27/news-image-01] Wrote ${spec.encoding} ${spec.cols}x${spec.rows} (${spec.byteCount} bytes, sha256=${spec.sha256Hex.slice(0, 12)}) to ${targetPng}`
    );
  }
}

emitEntryImage();
