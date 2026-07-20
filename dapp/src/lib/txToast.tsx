"use client";

import toast from "react-hot-toast";

const toastStyle = {
  background: "rgba(9, 9, 11, 0.95)",
  color: "#fafafa",
  border: "1px solid rgba(172, 255, 0, 0.25)",
  fontSize: "13px",
} as const;

const errorStyle = {
  ...toastStyle,
  border: "1px solid rgba(255, 80, 100, 0.45)",
} as const;

export function shortHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
}

export function explorerTxUrl(explorerBase: string | undefined, hash: string) {
  if (!explorerBase) return undefined;
  return `${explorerBase.replace(/\/$/, "")}/tx/${hash}`;
}

/** Single-id flow: wallet → pending (hash) → success (hash) → optional reload */
export function txToastWallet(toastId: string, message = "Confirm in your wallet…") {
  toast.loading(message, { id: toastId, style: toastStyle });
}

export function txToastPending(
  toastId: string,
  hash: `0x${string}` | string,
  explorer?: string
) {
  const href = explorerTxUrl(explorer, hash);
  toast.loading(
    <span className="text-sm leading-snug">
      Waiting for confirmation…
      <br />
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-400 underline"
        >
          {shortHash(hash)}
        </a>
      ) : (
        <span className="font-mono text-neutral-400">{shortHash(hash)}</span>
      )}
    </span>,
    { id: toastId, style: toastStyle }
  );
}

export function txToastSuccess(
  toastId: string,
  opts: {
    title: string;
    hash: `0x${string}` | string;
    explorer?: string;
    reloadMs?: number;
  }
) {
  const href = explorerTxUrl(opts.explorer, opts.hash);
  toast.success(
    <span className="text-sm leading-snug">
      <span className="font-medium text-primary-400">{opts.title}</span>
      <br />
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-400 underline"
        >
          {shortHash(opts.hash)}
        </a>
      ) : (
        <span className="font-mono text-neutral-300">{shortHash(opts.hash)}</span>
      )}
      {opts.reloadMs != null ? (
        <>
          <br />
          <span className="text-xs text-neutral-400">Refreshing…</span>
        </>
      ) : null}
    </span>,
    { id: toastId, duration: opts.reloadMs ?? 5000, style: toastStyle }
  );

  if (opts.reloadMs != null && opts.reloadMs >= 0) {
    window.setTimeout(() => {
      window.location.reload();
    }, opts.reloadMs);
  }
}

export function txToastError(toastId: string, message: string) {
  toast.error(message, { id: toastId, duration: 5000, style: errorStyle });
}

export function txToastDismiss(toastId: string) {
  toast.dismiss(toastId);
}
