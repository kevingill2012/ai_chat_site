from __future__ import annotations

from dataclasses import dataclass

from google import genai
from google.genai import types


@dataclass(frozen=True)
class GeminiUsage:
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None


@dataclass(frozen=True)
class GeminiReply:
    text: str
    model_name: str
    usage: GeminiUsage


def _int_or_none(v) -> int | None:
    try:
        if v is None:
            return None
        return int(v)
    except Exception:
        return None


def _extract_usage(resp) -> GeminiUsage:
    usage = getattr(resp, "usage_metadata", None) or getattr(resp, "usage", None)
    if usage is None:
        return GeminiUsage()

    if isinstance(usage, dict):
        prompt = usage.get("prompt_token_count") or usage.get("prompt_tokens")
        completion = usage.get("candidates_token_count") or usage.get("completion_tokens")
        total = usage.get("total_token_count") or usage.get("total_tokens")
        return GeminiUsage(_int_or_none(prompt), _int_or_none(completion), _int_or_none(total))

    prompt = getattr(usage, "prompt_token_count", None) or getattr(usage, "prompt_tokens", None)
    completion = getattr(usage, "candidates_token_count", None) or getattr(usage, "completion_tokens", None)
    total = getattr(usage, "total_token_count", None) or getattr(usage, "total_tokens", None)
    return GeminiUsage(_int_or_none(prompt), _int_or_none(completion), _int_or_none(total))


def generate_reply(
    *,
    api_key: str,
    model_name: str,
    user_message: str,
    history: list[dict],
    memory_snippets: list[str] | None = None,
) -> GeminiReply:
    client = genai.Client(api_key=api_key)

    contents: list[types.Content] = []
    for item in history or []:
        if not isinstance(item, dict):
            continue
        role = "user" if item.get("role") == "user" else "model"

        parts = item.get("parts")
        text: str | None = None
        if isinstance(parts, list) and parts:
            if isinstance(parts[0], str):
                text = parts[0]
            elif isinstance(parts[0], dict) and isinstance(parts[0].get("text"), str):
                text = parts[0]["text"]
        if not text:
            continue

        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=text)]))

    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))

    config = None
    if memory_snippets:
        mem_lines = [f"- {s.strip()}" for s in memory_snippets if str(s or "").strip()]
        if mem_lines:
            system_instruction = (
                "你可以参考以下用户的历史记忆（可能不完全准确，且未必与当前问题相关；不相关请忽略）：\n"
                + "\n".join(mem_lines[:20])
            )
            config = types.GenerateContentConfig(system_instruction=system_instruction)

    used_model = model_name
    try:
        resp = client.models.generate_content(model=model_name, contents=contents, config=config)
    except Exception as e:
        # Retry with a known-available model for many accounts, to avoid breakage if
        # an older default model name is no longer available.
        fallback_models = ["gemini-2.5-flash", "gemini-2.0-flash"]
        if model_name in fallback_models:
            raise
        last_exc: Exception = e
        for fb in fallback_models:
            try:
                resp = client.models.generate_content(model=fb, contents=contents, config=config)
                used_model = fb
                break
            except Exception as e2:
                last_exc = e2
        else:
            raise last_exc

    text = getattr(resp, "text", None)
    if not text:
        return GeminiReply(text="（Gemini 返回为空）", model_name=used_model, usage=_extract_usage(resp))
    return GeminiReply(text=text, model_name=used_model, usage=_extract_usage(resp))
