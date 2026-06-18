from django.db import models
import uuid


class AIRecommendation(models.Model):
    """
    Stores AI-generated helper recommendations for travel requests.

    Each recommendation contains the ranked helper list,
    AI-generated summary, and the model used to generate
    the recommendation. This model mirrors the
    Supabase ai_recommendations table for reference
    and reporting purposes.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    travel_request_id = models.UUIDField()

    recommended_helpers = models.JSONField()

    ai_summary = models.TextField()

    model_used = models.CharField(
        max_length=50
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        managed = False
        db_table = "ai_recommendations"

    def __str__(self):
        return (
            f"Recommendation for "
            f"{self.travel_request_id}"
        )