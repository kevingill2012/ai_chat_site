from __future__ import annotations

import json
import math
from dataclasses import dataclass

from google import genai

from .db import get_db


@dataclass(frozen=True)
class MemoryHit:
    content: str
    score: float


def _cosine(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return -1.0
    dot = 0.0
    na = 0.0
    nb = 0.0
    for x, y in zip(a, b):
        dot += x * y
        na += x * x
        nb += y * y
    den = math.sqrt(na) * math.sqrt(nb)
    if den <= 0:
        return -1.0
    return dot / den


def embed_text(*, api_key: str, model: str, text: str) -> list[float]:
    client = genai.Client(api_key=api_key)
    resp = client.models.embed_content(model=model, contents=[text])
    # Response shape may vary; handle both dict-like and object.
    emb = None
    if isinstance(resp, dict):
        emb = (resp.get("embeddings") or [{}])[0].get("values")
    else:
        embeddings = getattr(resp, "embeddings", None)
        if embeddings and len(embeddings) > 0:
            emb_obj = embeddings[0]
            emb = getattr(emb_obj, "values", None) or getattr(emb_obj, "embedding", None)
    if not emb:
        return []
    return [float(x) for x in emb]


def remember_message(
    *,
    user_id: int,
    role: str,
    content: str,
    api_key: str,
    embed_model: str,
    max_items: int,
    source_conversation_id: int | None = None,
    source_message_id: int | None = None,
):
    content = (content or "").strip()
    if len(content) < 12:
        return
    if len(content) > 4000:
        content = content[:4000]

    try:
        emb = embed_text(api_key=api_key, model=embed_model, text=content)
    except Exception:
        emb = []

    db = get_db()
    db.execute(
        """
        INSERT INTO memory_items(user_id, role, content, embedding_json, source_conversation_id, source_message_id)
        VALUES(?,?,?,?,?,?)
        """,
        (
            int(user_id),
            "user" if role == "user" else "model",
            content,
            json.dumps(emb) if emb else None,
            int(source_conversation_id) if source_conversation_id else None,
            int(source_message_id) if source_message_id else None,
        ),
    )

    # Prune oldest.
    try:
        max_items = int(max_items)
    except Exception:
        max_items = 2000
    if max_items > 0:
        db.execute(
            """
            DELETE FROM memory_items
            WHERE user_id=?
              AND id NOT IN (
                SELECT id FROM memory_items WHERE user_id=? ORDER BY id DESC LIMIT ?
              )
            """,
            (int(user_id), int(user_id), int(max_items)),
        )

    db.commit()


def recall(
    *,
    user_id: int,
    api_key: str,
    embed_model: str,
    query: str,
    top_k: int,
) -> list[MemoryHit]:
    query = (query or "").strip()
    if not query:
        return []

    try:
        qv = embed_text(api_key=api_key, model=embed_model, text=query)
    except Exception:
        return []
    if not qv:
        return []

    db = get_db()
    rows = db.execute(
        """
        SELECT content, embedding_json
        FROM memory_items
        WHERE user_id=? AND embedding_json IS NOT NULL
        ORDER BY id DESC
        LIMIT 1500
        """,
        (int(user_id),),
    ).fetchall()

    hits: list[MemoryHit] = []
    for r in rows:
        try:
            ev = json.loads(r["embedding_json"] or "[]")
            if not isinstance(ev, list) or not ev:
                continue
            ev = [float(x) for x in ev]
        except Exception:
            continue
        score = _cosine(qv, ev)
        if score <= 0.15:
            continue
        hits.append(MemoryHit(content=str(r["content"]), score=score))

    hits.sort(key=lambda x: x.score, reverse=True)
    try:
        top_k = int(top_k)
    except Exception:
        top_k = 5
    return hits[: max(0, min(top_k, 20))]

