#!/usr/bin/env node
import { execFile } from "node:child_process";
import { randomUUID, timingSafeEqual } from "node:crypto";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { validateReviewPayload } from "./review-policy.mjs";

const execFileAsync = promisify(execFile);
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRunner = path.join(moduleDirectory, "review-runner.mjs");

function json(response, statusCode, body, headers = {}) {
  const content = JSON.stringify(body);
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(content),
    ...headers,
  });
  response.end(content);
}

function normalizeAddress(address) {
  return String(address || "").replace(/^::ffff:/, "");
}

function tokenMatches(expected, provided) {
  const expectedBuffer = Buffer.from(expected || "");
  const providedBuffer = Buffer.from(provided || "");
  return expectedBuffer.length > 0
    && expectedBuffer.length === providedBuffer.length
    && timingSafeEqual(expectedBuffer, providedBuffer);
}

async function readJson(request, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error("请求体超过限制");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("请求体必须是有效 JSON");
    error.statusCode = 400;
    throw error;
  }
}

export function createReviewServer(options = {}) {
  const token = options.token ?? process.env.REVIEW_EXECUTOR_TOKEN ?? "";
  const allowedAddresses = new Set(
    options.allowedAddresses
      ?? String(process.env.REVIEW_ALLOWED_ADDRESSES || "172.18.0.2").split(",").map((value) => value.trim()).filter(Boolean),
  );
  const maxBodyBytes = options.maxBodyBytes ?? 32 * 1024;
  const timeoutMs = options.timeoutMs ?? Number(process.env.REVIEW_RUNNER_TIMEOUT_MS || 16 * 60 * 1000);
  const runnerPath = options.runnerPath ?? process.env.REVIEW_RUNNER_PATH ?? defaultRunner;
  const runRunner = options.runRunner ?? (async (command, argument) => {
    const { stdout } = await execFileAsync(process.execPath, [runnerPath, command, argument], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
      timeout: timeoutMs,
      env: process.env,
    });
    return JSON.parse(stdout);
  });
  let submitInFlight = false;

  return http.createServer(async (request, response) => {
    const requestId = request.headers["x-request-id"] || randomUUID();
    const remoteAddress = normalizeAddress(request.socket.remoteAddress);

    if (request.method === "GET" && request.url === "/healthz") {
      return json(response, 200, { ok: true, service: "energy-review-executor" });
    }
    if (!allowedAddresses.has(remoteAddress)) {
      return json(response, 403, { ok: false, error: "forbidden", requestId });
    }
    if (!tokenMatches(token, request.headers["x-review-executor-token"])) {
      return json(response, 401, { ok: false, error: "unauthorized", requestId });
    }

    try {
      if (request.method === "POST" && request.url === "/v1/reviews/submit") {
        if (submitInFlight) {
          return json(response, 429, { ok: false, error: "busy", requestId }, { "retry-after": "30" });
        }
        const payload = validateReviewPayload(await readJson(request, maxBodyBytes));
        submitInFlight = true;
        try {
          const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
          const result = await runRunner("submit", encoded);
          return json(response, 202, { ok: true, jobId: result.jobId, requestId });
        } finally {
          submitInFlight = false;
        }
      }

      const statusMatch = request.url?.match(/^\/v1\/reviews\/status\/([A-Za-z0-9_-]{12,})$/);
      if (request.method === "GET" && statusMatch) {
        const result = await runRunner("status", statusMatch[1]);
        return json(response, 200, { ok: true, jobId: result.jobId, status: result.status, requestId });
      }

      return json(response, 404, { ok: false, error: "not_found", requestId });
    } catch (error) {
      const statusCode = Number(error?.statusCode) || (/必须|非法|长度|白名单|有效 JSON|超过限制/.test(error?.message || "") ? 400 : 502);
      return json(response, statusCode, {
        ok: false,
        error: statusCode < 500 ? "validation_error" : "executor_error",
        message: statusCode < 500 ? error.message : "Codex Cloud 执行器暂时不可用",
        requestId,
      });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const host = process.env.REVIEW_EXECUTOR_HOST || "172.18.0.1";
  const port = Number(process.env.REVIEW_EXECUTOR_PORT || 8791);
  const server = createReviewServer();
  server.listen(port, host, () => {
    process.stdout.write(`energy-review-executor listening on http://${host}:${port}\n`);
  });
}
