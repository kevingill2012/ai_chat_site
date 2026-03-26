from __future__ import annotations

import argparse
import os
import secrets
import sqlite3
from pathlib import Path


def _connect(db_path: str) -> sqlite3.Connection:
    Path(os.path.dirname(db_path) or ".").mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(db_path)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def _ensure_table(db: sqlite3.Connection):
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS invite_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          reserved_at TEXT,
          reservation_token TEXT,
          used_at TEXT,
          used_by_user_id INTEGER,
          disabled INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    db.execute("CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)")
    db.execute("CREATE INDEX IF NOT EXISTS idx_invite_codes_res_token ON invite_codes(reservation_token)")
    db.commit()


def generate_invite_code() -> str:
    # Human-friendly but strong randomness.
    return "INV-" + secrets.token_hex(8).upper()


def create_codes(db_path: str, count: int) -> list[str]:
    db = _connect(db_path)
    _ensure_table(db)
    codes: list[str] = []
    for _ in range(count):
        for _try in range(10):
            code = generate_invite_code()
            try:
                db.execute("INSERT INTO invite_codes(code) VALUES(?)", (code,))
                db.commit()
                codes.append(code)
                break
            except sqlite3.IntegrityError:
                continue
        else:
            raise RuntimeError("Failed to generate unique invite code after retries")
    db.close()
    return codes


def main():
    p = argparse.ArgumentParser(description="AI Chat Site invite-code generator")
    p.add_argument("--db", default=os.getenv("DATABASE_PATH") or "/data/ai_chat_site.sqlite3")
    p.add_argument("--count", type=int, default=1)
    args = p.parse_args()

    codes = create_codes(args.db, args.count)
    for c in codes:
        print(c)


if __name__ == "__main__":
    main()
