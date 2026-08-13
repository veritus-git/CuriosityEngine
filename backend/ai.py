"""
AI integration layer.
Supports OpenAI, Anthropic, and Google Gemini APIs via httpx.
"""

import os
import json
import logging
import httpx

logger = logging.getLogger("curiosity.ai")

PROVIDER = os.getenv("AI_PROVIDER", "openai")
MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
API_KEY = os.getenv("AI_API_KEY", "")

TIMEOUT = 60.0


class AIError(Exception):
    """Raised when AI call fails."""
    pass


async def generate_topic(system_prompt: str, user_prompt: str) -> dict:
    """
    Call the configured AI provider and return parsed JSON response.
    Raises AIError on any failure.
    """
    if not API_KEY:
        raise AIError("AI API key is not configured. Please set AI_API_KEY in your .env file.")

    provider = PROVIDER.lower().strip()

    try:
        if provider == "openai":
            return await _call_openai(system_prompt, user_prompt)
        elif provider == "anthropic":
            return await _call_anthropic(system_prompt, user_prompt)
        elif provider == "gemini" or provider == "google":
            return await _call_gemini(system_prompt, user_prompt)
        else:
            raise AIError(f"Unsupported AI provider: {provider}. Use 'openai', 'anthropic', or 'gemini'.")
    except AIError:
        raise
    except httpx.TimeoutException:
        raise AIError("AI request timed out. The provider might be slow or unreachable.")
    except httpx.ConnectError:
        raise AIError("Could not connect to the AI provider. Check your internet connection.")
    except Exception as e:
        logger.exception("Unexpected AI error")
        raise AIError(f"AI request failed: {str(e)}")


async def _call_openai(system_prompt: str, user_prompt: str) -> dict:
    """Call OpenAI-compatible API."""
    # Support custom base URLs for OpenAI-compatible providers
    base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.8,
                "max_tokens": 500,
            },
        )

        if response.status_code == 401:
            raise AIError("Invalid API key. Please check your AI_API_KEY.")
        if response.status_code == 429:
            raise AIError("Rate limited by AI provider. Please wait a moment and try again.")
        if response.status_code != 200:
            logger.error(f"OpenAI API error {response.status_code}: {response.text}")
            raise AIError(f"AI provider returned error {response.status_code}.")

        data = response.json()
        content = data["choices"][0]["message"]["content"].strip()
        return _parse_json_response(content)


async def _call_anthropic(system_prompt: str, user_prompt: str) -> dict:
    """Call Anthropic Claude API."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": API_KEY,
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01",
            },
            json={
                "model": MODEL,
                "max_tokens": 500,
                "system": system_prompt,
                "messages": [
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.8,
            },
        )

        if response.status_code == 401:
            raise AIError("Invalid API key. Please check your AI_API_KEY.")
        if response.status_code == 429:
            raise AIError("Rate limited by AI provider. Please wait a moment and try again.")
        if response.status_code != 200:
            logger.error(f"Anthropic API error {response.status_code}: {response.text}")
            raise AIError(f"AI provider returned error {response.status_code}.")

        data = response.json()
        content = data["content"][0]["text"].strip()
        return _parse_json_response(content)


async def _call_gemini(system_prompt: str, user_prompt: str) -> dict:
    """Call Google Gemini API."""
    base_url = os.getenv("AI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
    model = MODEL or "gemini-2.0-flash"

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(
            f"{base_url}/models/{model}:generateContent",
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
                    "temperature": 0.8,
                    "maxOutputTokens": 500,
                    "responseMimeType": "application/json",
                },
            },
        )

        if response.status_code == 400:
            error_msg = response.text
            logger.error(f"Gemini API error 400: {error_msg}")
            if "API_KEY_INVALID" in error_msg:
                raise AIError("Invalid API key. Please check your AI_API_KEY.")
            raise AIError(f"Gemini request error. Check model name '{model}'.")
        if response.status_code == 429:
            raise AIError("Rate limited by Google. Please wait a moment and try again.")
        if response.status_code != 200:
            logger.error(f"Gemini API error {response.status_code}: {response.text}")
            raise AIError(f"AI provider returned error {response.status_code}.")

        data = response.json()
        try:
            content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError):
            logger.error(f"Unexpected Gemini response structure: {json.dumps(data)[:500]}")
            raise AIError("AI returned an unexpected response format. Please try again.")

        return _parse_json_response(content)


def _parse_json_response(content: str) -> dict:
    """Parse and validate the AI JSON response."""
    # Try to extract JSON from the response
    # Sometimes models wrap JSON in markdown code blocks
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()

    try:
        result = json.loads(content)
    except json.JSONDecodeError:
        logger.error(f"AI returned invalid JSON: {content[:500]}")
        raise AIError("AI returned an invalid response. Please try again.")

    # Validate required fields
    if not isinstance(result, dict):
        raise AIError("AI returned unexpected format. Please try again.")

    if "topic" not in result or not result["topic"]:
        raise AIError("AI did not suggest a topic. Please try again.")

    # Ensure expected fields exist with defaults
    result.setdefault("short_reason", "")
    result.setdefault("connection", None)
    result.setdefault("difficulty", "intermediate")

    # Validate difficulty
    if result["difficulty"] not in ("beginner", "intermediate", "advanced"):
        result["difficulty"] = "intermediate"

    return result


def get_ai_status() -> dict:
    """Return current AI configuration status (without exposing the key)."""
    return {
        "configured": bool(API_KEY),
        "provider": PROVIDER,
        "model": MODEL,
    }
