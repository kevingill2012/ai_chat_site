from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request


def _run(cmd: str) -> str:
    p = subprocess.run(["bash", "-lc", cmd], capture_output=True, text=True)
    return (p.stdout or "").strip()


def _find_cf_api_token() -> str:
    env_token = (os.getenv("CF_API_TOKEN") or "").strip()
    if env_token:
        return env_token

    for p in ("/root/.secrets/cf_api_token", "/etc/cloudflared/cf_api_token"):
        try:
            with open(p, "r", encoding="utf-8") as f:
                token = f.read().strip()
            if token:
                return token
        except FileNotFoundError:
            pass

    raise RuntimeError(
        "Cloudflare API token not found. Note: a tunnel token usually starts with 'cfut_' and cannot call the API. "
        "Create an API token in Cloudflare Dashboard (My Profile -> API Tokens) with 'Cloudflare Tunnel:Edit', "
        "then set CF_API_TOKEN or write it to /root/.secrets/cf_api_token."
    )


def _get_account_and_tunnel_id() -> tuple[str, str]:
    cfg_path = os.getenv("CLOUDFLARED_CONFIG") or "/etc/cloudflared/config.yml"
    try:
        cfg = open(cfg_path, "r", encoding="utf-8").read().splitlines()
    except FileNotFoundError as e:
        raise RuntimeError(f"cloudflared config not found at {cfg_path}") from e

    def _find_line(key: str) -> str | None:
        pat = re.compile(rf"^{re.escape(key)}\\s*:\\s*(\\S+)\\s*$")
        for line in cfg:
            m = pat.match(line.strip())
            if m:
                return m.group(1)
        return None

    tunnel_id = _find_line("tunnel")
    cred_file = _find_line("credentials-file") or _find_line("credentials_file")
    if not tunnel_id or not cred_file:
        raise RuntimeError(f"failed to read tunnel/credentials-file from {cfg_path}")

    try:
        d = json.load(open(cred_file, "r", encoding="utf-8"))
    except FileNotFoundError as e:
        raise RuntimeError(f"credentials file not found at {cred_file}") from e

    account_id = d.get("AccountTag")
    if not account_id:
        raise RuntimeError("credentials JSON missing AccountTag (account id)")
    return str(account_id), str(tunnel_id)


def _cf_api_json(method: str, url: str, token: str, payload: dict | None = None) -> dict:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, method=method, headers=headers, data=data)
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = resp.read().decode("utf-8")
    return json.loads(body)


def _extract_config(result: dict) -> dict:
    """
    Cloudflare may return:
      - result: { "config": { "ingress": [...], ... } }
      - or other minor variants.
    """
    if not isinstance(result, dict):
        raise RuntimeError("unexpected result type")

    cfg = result.get("config")
    if isinstance(cfg, dict):
        return cfg
    raise RuntimeError("unexpected config shape (missing result.config)")


def _patch_ingress(cfg: dict, hostname: str, service: str, host_header: str) -> tuple[dict, bool]:
    ingress = cfg.get("ingress")
    if not isinstance(ingress, list):
        ingress = []

    new_rule = {
        "hostname": hostname,
        "service": service,
        "originRequest": {"httpHostHeader": host_header},
    }

    # Update existing rule.
    for rule in ingress:
        if isinstance(rule, dict) and rule.get("hostname") == hostname:
            desired = (rule.get("service") == service) and ((rule.get("originRequest") or {}).get("httpHostHeader") == host_header)
            if desired:
                return cfg, False
            rule["service"] = service
            rule["originRequest"] = {"httpHostHeader": host_header}
            cfg["ingress"] = ingress
            return cfg, True

    # Insert before catch-all http_status:404 if present.
    idx = None
    for i, rule in enumerate(ingress):
        if isinstance(rule, dict) and rule.get("service") == "http_status:404":
            idx = i
            break

    if idx is None:
        ingress.append(new_rule)
    else:
        ingress.insert(idx, new_rule)
    cfg["ingress"] = ingress
    return cfg, True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--hostname", required=True)
    ap.add_argument("--service", required=True)
    ap.add_argument("--host-header", required=True)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    token = _find_cf_api_token()
    account_id, tunnel_id = _get_account_and_tunnel_id()
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/cfd_tunnel/{tunnel_id}/configurations"

    data = _cf_api_json("GET", url, token)
    if not data.get("success"):
        print("GET failed")
        print(json.dumps({"errors": data.get("errors"), "messages": data.get("messages")}, ensure_ascii=False))
        return 2

    result = data.get("result") or {}
    cfg = _extract_config(result)
    cfg2, changed = _patch_ingress(cfg, args.hostname, args.service, args.host_header)

    if not changed:
        print("no_change")
        return 0

    if not args.apply:
        print("dry_run_ok (use --apply to write)")
        return 0

    data2 = _cf_api_json("PUT", url, token, {"config": cfg2})
    if not data2.get("success"):
        print("PUT failed")
        print(json.dumps({"errors": data2.get("errors"), "messages": data2.get("messages")}, ensure_ascii=False))
        return 3

    print("updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
