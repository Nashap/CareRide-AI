import json
import google.generativeai as genai
from django.conf import settings

from .tools import (
    search_available_helpers,
    highest_rated_helper,
    count_available_helpers,
)

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


# -----------------------------------------------------
# TOOL ROUTER
# -----------------------------------------------------

TOOL_ROUTER_PROMPT = """
You are an AI Router for CareRide.

Your ONLY job is to decide which tool should be used.

Available tools

1. search_available_helpers
2. highest_rated_helper
3. count_available_helpers
4. none

Return ONLY valid JSON.

Examples

User:
Who can help me?

{
    "tool":"search_available_helpers"
}

User:
Recommend a helper

{
    "tool":"highest_rated_helper"
}

User:
Who is the best helper?

{
    "tool":"highest_rated_helper"
}

User:
Show available helpers

{
    "tool":"search_available_helpers"
}

User:
Find someone for wheelchair assistance

{
    "tool":"search_available_helpers",
    "skill":"wheelchair"
}

User:
Need hospital visit helper

{
    "tool":"search_available_helpers",
    "skill":"hospital"
}

User:
Need shopping assistance

{
    "tool":"search_available_helpers",
    "skill":"shopping"
}

User:
Need elderly care

{
    "tool":"search_available_helpers",
    "skill":"elderly"
}

User:
How many helpers are available?

{
    "tool":"count_available_helpers"
}

User:
Tell me about CareRide

{
    "tool":"none"
}
"""


# -----------------------------------------------------
# RESPONSE PROMPT
# -----------------------------------------------------

ANSWER_PROMPT = """
You are CareRide AI.

Rules:

- Speak naturally.
- Keep answers friendly.
- Do NOT use Markdown.
- Do NOT use **bold**.
- Do NOT use bullet points.
- Do NOT use headings.
- Maximum 120 words.
- Never mention database or tools.
- If helpers are returned, recommend the best ones based on rating and matching skills.
"""


# -----------------------------------------------------
# CLEAN RESPONSE
# -----------------------------------------------------

def clean_reply(text):

    text = (
        text.replace("**", "")
            .replace("*", "")
            .replace("```", "")
            .replace("\r", "")
            .strip()
    )

    return " ".join(text.split())


# -----------------------------------------------------
# MAIN CHAT FUNCTION
# -----------------------------------------------------

def ai_chat(message):

    try:

        router_response = model.generate_content(
            TOOL_ROUTER_PROMPT +
            "\n\nUser:\n" +
            message
        )

        router_text = (
            router_response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        decision = json.loads(router_text)

    except Exception:

        decision = {
            "tool": "none"
        }

    print("Router Decision:", decision)

    tool = decision.get("tool")

    tool_result = None
        # ------------------------------------------
    # Execute Selected Tool
    # ------------------------------------------

    if tool == "highest_rated_helper":

        tool_result = highest_rated_helper()

    elif tool == "count_available_helpers":

        tool_result = {
            "available_helpers": count_available_helpers()
        }

    elif tool == "search_available_helpers":

        skill = decision.get("skill")

        tool_result = search_available_helpers(skill)

    # ------------------------------------------
    # Normal Gemini Chat
    # ------------------------------------------

    if tool == "none":

        answer = model.generate_content(
            ANSWER_PROMPT +
            "\n\nUser:\n" +
            message
        )

        return {
            "tool_used": None,
            "reply": clean_reply(answer.text)
        }

    # ------------------------------------------
    # Ask Gemini to Explain Tool Result
    # ------------------------------------------

    explanation_prompt = f"""
{ANSWER_PROMPT}

User Question:

{message}

Tool Used:

{tool}

Tool Result:

{json.dumps(tool_result, indent=2)}

Generate a friendly response.

If multiple helpers exist:

- Recommend the best helper first.
- Explain briefly why.
- Mention other suitable helpers if useful.

Never say "database" or "tool".
"""

    try:

        answer = model.generate_content(
            explanation_prompt
        )

        return {

            "tool_used": tool,

            "tool_result": tool_result,

            "reply": clean_reply(
                answer.text
            )

        }

    except Exception as e:

        return {

            "tool_used": tool,

            "tool_result": tool_result,

            "reply": f"Unable to generate AI response. {str(e)}"

        }