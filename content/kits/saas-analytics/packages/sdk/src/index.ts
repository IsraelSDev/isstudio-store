type PulsePayload = {
  type: "track" | "identify" | "page";
  event?: string;
  userId?: string;
  anonymousId: string;
  properties?: Record<string, unknown>;
  timestamp: string;
};

type PulseCommand =
  | ["track", string, Record<string, unknown>?]
  | ["identify", string, Record<string, unknown>?]
  | ["page", string?, Record<string, unknown>?];

declare global {
  interface Window {
    pulse: (...args: PulseCommand) => void;
    __pulse_q?: PulseCommand[];
  }
}

const STORAGE_KEY = "pulse_aid";
const ENDPOINT =
  (typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_PULSE_ENDPOINT) ||
  "/api/collect";

function anonymousId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id =
      crypto.randomUUID?.() ??
      `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return `anon_ephemeral_${Date.now()}`;
  }
}

function send(payload: PulsePayload): void {
  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const ok = navigator.sendBeacon(ENDPOINT, body);
    if (ok) return;
  }
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* fila offline pode ser adicionada aqui */
  });
}

function handle(command: PulseCommand): void {
  const [type, a, b] = command;
  const base = {
    anonymousId: anonymousId(),
    timestamp: new Date().toISOString(),
  };

  if (type === "track") {
    send({ ...base, type: "track", event: String(a), properties: b });
    return;
  }
  if (type === "identify") {
    send({
      ...base,
      type: "identify",
      userId: String(a),
      properties: b,
    });
    return;
  }
  send({
    ...base,
    type: "page",
    event: a ? String(a) : undefined,
    properties: b,
  });
}

export function initPulse(): void {
  const queued = window.__pulse_q ?? [];
  window.pulse = (...args: PulseCommand) => handle(args);
  queued.forEach((cmd) => handle(cmd));
  window.__pulse_q = [];
}

export default initPulse;
