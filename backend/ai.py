"""
CuriosityEngine — AI Layer.
Supports OpenAI, Anthropic, and Google Gemini APIs with structured JSON output and embeddings.
Includes automatic fallback model routing (e.g. 3.7 Flash -> 3.5 Flash Lite) on rate limits or errors.
"""

import os
import json
import math
import hashlib
import logging
import httpx
from typing import List, Dict, Any, Optional

logger = logging.getLogger("curiosity.ai")

PROVIDER = os.getenv("AI_PROVIDER", "gemini")
MODEL = os.getenv("AI_MODEL", "gemini-3.7-flash")
FALLBACK_MODEL = os.getenv("AI_FALLBACK_MODEL", "gemini-3.5-flash-lite")
API_KEY = os.getenv("AI_API_KEY", "")

TIMEOUT = 60.0


class AIError(Exception):
    """Raised when AI call fails."""
    pass


# ─── Cosine Similarity & Vector Math ───

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculate cosine similarity between two float vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def fallback_semantic_vector(text: str, dim: int = 64) -> List[float]:
    """
    Deterministic pseudo-semantic embedding fallback when external embedding API is unavailable.
    Uses rolling hash buckets over normalized n-grams.
    """
    words = text.lower().replace(",", " ").replace(".", " ").split()
    vec = [0.0] * dim
    for i, w in enumerate(words):
        h = int(hashlib.sha256(w.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0 / (1.0 + i * 0.1)
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec


# ─── Embedding Generation ───

async def generate_embedding(text: str) -> List[float]:
    """Generate an embedding vector using the configured provider, or fallback if unavailable."""
    if not API_KEY or not text.strip():
        return fallback_semantic_vector(text)

    provider = PROVIDER.lower().strip()
    try:
        if provider == "openai":
            base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{base_url}/embeddings",
                    headers={
                        "Authorization": f"Bearer {API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": os.getenv("AI_EMBEDDING_MODEL", "text-embedding-3-small"),
                        "input": text[:1000]
                    }
                )
                if resp.status_code == 200:
                    return resp.json()["data"][0]["embedding"]
        elif provider in ("gemini", "google"):
            base_url = os.getenv("AI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
            model = os.getenv("AI_EMBEDDING_MODEL", "text-embedding-004")
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{base_url}/models/{model}:embedContent",
                    params={"key": API_KEY},
                    headers={"Content-Type": "application/json"},
                    json={
                        "content": {"parts": [{"text": text[:1000]}]}
                    }
                )
                if resp.status_code == 200:
                    return resp.json()["embedding"]["values"]
    except Exception as e:
        logger.warning(f"Embedding API call notice ({e}), using fallback semantic vector.")

    return fallback_semantic_vector(text)


# ─── Chat Completion & JSON Structured Outputs with Fallback ───

async def generate_ai_json(system_prompt: str, user_prompt: str) -> dict:
    """
    Call configured AI provider and return parsed JSON object.
    Automatically tries the fallback model if the primary model hits rate limits or errors.
    """
    if not API_KEY:
        raise AIError("AI API key is not configured. Please set AI_API_KEY in your .env file.")

    provider = PROVIDER.lower().strip()
    primary_model = MODEL
    fallback_model = FALLBACK_MODEL

    try:
        return await _dispatch_provider_call(provider, primary_model, system_prompt, user_prompt)
    except Exception as primary_err:
        if fallback_model and fallback_model != primary_model:
            logger.warning(f"Primary model '{primary_model}' encountered error ({primary_err}). Automatically falling back to '{fallback_model}'...")
            try:
                return await _dispatch_provider_call(provider, fallback_model, system_prompt, user_prompt)
            except Exception as fb_err:
                logger.error(f"Fallback model '{fallback_model}' also failed: {fb_err}")
                raise AIError(f"AI call failed on both '{primary_model}' and '{fallback_model}': {fb_err}")
        raise primary_err


async def _dispatch_provider_call(provider: str, model_name: str, system_prompt: str, user_prompt: str) -> dict:
    try:
        if provider == "openai":
            return await _call_openai(system_prompt, user_prompt, model_name)
        elif provider == "anthropic":
            return await _call_anthropic(system_prompt, user_prompt, model_name)
        elif provider in ("gemini", "google"):
            return await _call_gemini(system_prompt, user_prompt, model_name)
        else:
            raise AIError(f"Unsupported AI provider: {provider}. Use 'gemini', 'openai', or 'anthropic'.")
    except httpx.TimeoutException:
        raise AIError(f"Model '{model_name}' timed out.")
    except httpx.ConnectError:
        raise AIError("Could not connect to the AI provider. Check internet connection.")


async def _call_openai(system_prompt: str, user_prompt: str, model_name: str) -> dict:
    base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.7,
                "response_format": {"type": "json_object"} if "gpt-4" in model_name or "gpt-3.5" in model_name else None,
                "max_tokens": 2048,
            },
        )
        if response.status_code == 401:
            raise AIError("Invalid API key. Please check your AI_API_KEY.")
        if response.status_code == 429:
            raise AIError(f"Rate limited on {model_name} (429).")
        if response.status_code != 200:
            logger.error(f"OpenAI error {response.status_code}: {response.text}")
            raise AIError(f"AI provider returned error {response.status_code}.")

        data = response.json()
        content = data["choices"][0]["message"]["content"].strip()
        return _parse_json_response(content)


async def _call_anthropic(system_prompt: str, user_prompt: str, model_name: str) -> dict:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": API_KEY,
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01",
            },
            json={
                "model": model_name,
                "max_tokens": 2048,
                "system": system_prompt,
                "messages": [
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.7,
            },
        )
        if response.status_code == 401:
            raise AIError("Invalid API key. Please check your AI_API_KEY.")
        if response.status_code == 429:
            raise AIError(f"Rate limited on {model_name} (429).")
        if response.status_code != 200:
            logger.error(f"Anthropic error {response.status_code}: {response.text}")
            raise AIError(f"AI provider returned error {response.status_code}.")

        data = response.json()
        content = data["content"][0]["text"].strip()
        return _parse_json_response(content)


async def _call_gemini(system_prompt: str, user_prompt: str, model_name: str) -> dict:
    base_url = os.getenv("AI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(
            f"{base_url}/models/{model_name}:generateContent",
            params={"key": API_KEY},
            headers={"Content-Type": "application/json"},
            json={
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}],
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048,
                    "responseMimeType": "application/json",
                },
            },
        )
        if response.status_code == 400:
            logger.error(f"Gemini API 400 for {model_name}: {response.text}")
            if "API_KEY_INVALID" in response.text:
                raise AIError("Invalid API key. Please check your AI_API_KEY.")
            raise AIError(f"Gemini request error on model '{model_name}'.")
        if response.status_code == 429:
            raise AIError(f"Rate limited on {model_name} (429).")
        if response.status_code != 200:
            logger.error(f"Gemini API {response.status_code} on {model_name}: {response.text}")
            raise AIError(f"AI provider returned error {response.status_code}.")

        data = response.json()
        try:
            content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError):
            logger.error(f"Gemini format error on {model_name}: {json.dumps(data)[:500]}")
            raise AIError("AI returned unexpected format.")

        return _parse_json_response(content)


def _parse_json_response(content: str) -> dict:
    """Parse and clean JSON response."""
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        logger.error(f"AI returned invalid JSON: {content[:500]}")
        raise AIError("AI returned an invalid JSON response. Please try again.")


def get_ai_status() -> dict:
    return {
        "configured": bool(API_KEY),
        "provider": PROVIDER,
        "model": MODEL,
        "fallback_model": FALLBACK_MODEL,
    }
