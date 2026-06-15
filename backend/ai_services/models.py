from django.db import models
import uuid


class AIRecommendation(models.Model):
    """
    Optional Django-side mirror of the Supabase ai_recommendations table.
    If you're writing directly via Supabase client in views.py,
    this model is informational only — not used for DB writes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    travel_request_id = models.UUIDField()
    recommended_helpers = models.JSONField()
    ai_summary = models.TextField()
    model_used = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False  # table managed in Supabase, not by Django migrations
        db_table = "ai_recommendations"

    def __str__(self):
        return f"Recommendation for {self.travel_request_id}"