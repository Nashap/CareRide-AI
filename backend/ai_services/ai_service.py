import json
import google.generativeai as genai
from django.conf import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are the CareRide AI Helper-Matching Assistant.

Rank helpers based on:
1. Skill match
2. Distance
3. Urgency
4. Rating
5. Availability

Return ONLY valid JSON.

{
  "recommended_helpers": [
    {
      "helper_id": "",
      "match_score": 0,
      "reason": ""
    }
  ],
  "summary": ""
}
"""


def fallback_response(message):
    return {
        "recommended_helpers": [],
        "summary": message,
        "model_used": "fallback"
    }


def call_ai_recommendation(ai_input):
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\nInput:\n{json.dumps(ai_input)}"
        )

        result_text = response.text.strip()

        # Remove markdown wrappers if Gemini returns them
        result_text = result_text.replace("```json", "")
        result_text = result_text.replace("```", "")
        result_text = result_text.strip()

        result = json.loads(result_text)

        result["model_used"] = "gemini-2.5-flash"

        return result

    except json.JSONDecodeError:
        return fallback_response(
            "Invalid AI response received."
        )

    except Exception as e:

        error_text = str(e)

        # Rate limit handling
        if "429" in error_text:
            return fallback_response(
                "Rate limit exceeded."
            )

        # Token limit handling
        if "token" in error_text.lower():
            return fallback_response(
                "Token limit exceeded."
            )

        # Generic API error
        return fallback_response(
            f"AI service error: {error_text}"
        )