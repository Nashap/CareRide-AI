def call_ai_recommendation(ai_input):
    """
    Mock AI response.
    Later replace with Gemini/Claude API.
    """

    return {
        "recommended_helpers": [
            {
                "helper_id": "H101",
                "match_score": 92,
                "reason": "Mock: skills match, close distance, high rating, available."
            }
        ],
        "summary": "Mock recommendation generated for testing.",
        "model_used": "mock-v0"
    }