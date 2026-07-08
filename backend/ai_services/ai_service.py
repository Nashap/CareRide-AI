import json
import google.generativeai as genai
from django.conf import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are the CareRide AI Helper Recommendation Assistant.

Your task is to recommend the best helper for a travel request.

Rank helpers using the following priority:

1. Skill match
2. Assistance level required
3. Availability
4. Helper rating
5. Service type compatibility

Instructions:
- Only recommend helpers who are available.
- Give each recommended helper a match score from 0 to 100.
- Explain briefly why the helper was selected.
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include extra explanations.

Response format:

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
    """
    Sends travel request and helper data to Gemini
    and returns ranked helper recommendations.
    """

    try:

        model = genai.GenerativeModel(
            "gemini-2.5-flash"
        )

        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\n"
            f"Travel Request and Helpers:\n"
            f"{json.dumps(ai_input, indent=2)}",
            request_options={"timeout": 5.0}
        )

        result_text = response.text.strip()

        # Remove markdown if Gemini returns it
        result_text = result_text.replace(
            "```json",
            ""
        )

        result_text = result_text.replace(
            "```",
            ""
        )

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

        # Gemini rate limit
        if "429" in error_text:

            return fallback_response(
                "Rate limit exceeded."
            )

        # Token limit
        if "token" in error_text.lower():

            return fallback_response(
                "Token limit exceeded."
            )

        return fallback_response(
            f"AI service error: {error_text}"
        )
