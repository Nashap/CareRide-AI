from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from unittest.mock import patch


class AIRecommendationFlowTest(TestCase):
    """
    End-to-end test: input -> AI (mocked) -> saved to Supabase.
    """

    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="testuser", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

        # Real domain sample data
        self.travel_request_payload = {
            "id": 1, 
            "disability_type": "wheelchair",
            "pickup_location": "MG Road, Kochi",
            "drop_location": "Lakeshore Hospital",
            "distance_km": 4.2,
            "urgency_level": "high",
            "assistance_required": "wheelchair_transfer",
        }

    @patch("ai_services.views.get_supabase_client")
    @patch("ai_services.utils.get_candidate_helpers")
    def test_ai_recommendation_flow(self, mock_candidates, mock_supabase_client):
        # Mock candidate helpers returned from Supabase
        mock_candidates.return_value = [
            {
                "helper_id": "H101",
                "skills": ["wheelchair_transfer", "medical_escort"],
                "rating": 4.8,
                "distance_km": 1.1,
                "availability": True,
            },
        ]

        # Mock the Supabase insert call and its response
        mock_client_instance = mock_supabase_client.return_value
        mock_insert_result = mock_client_instance.table.return_value.insert.return_value.execute.return_value
        mock_insert_result.data = [{
            "id": "22222222-2222-2222-2222-222222222222",
            "travel_request_id": self.travel_request_payload["id"],
            "recommended_helpers": [
                {"helper_id": "H101", "match_score": 92, "reason": "Mock match."}
            ],
            "ai_summary": "Mock recommendation generated for testing the end-to-end pipeline.",
            "model_used": "mock-v0",
        }]

        url = reverse("recommend-helper")
        response = self.client.post(url, self.travel_request_payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertIn("recommended_helpers", response.data)
        self.assertIn("ai_summary", response.data)
        self.assertEqual(response.data["model_used"], "mock-v0")
        self.assertTrue(len(response.data["recommended_helpers"]) > 0)

        # Verify Supabase insert was called with correct table and data
        mock_client_instance.table.assert_called_with("ai_recommendations")
        insert_call_args = mock_client_instance.table.return_value.insert.call_args[0][0]
        self.assertEqual(insert_call_args["travel_request_id"], self.travel_request_payload["id"])
        self.assertEqual(insert_call_args["model_used"], "mock-v0")

    @patch("ai_services.utils.get_candidate_helpers")
    def test_no_candidates_returns_404(self, mock_candidates):
        mock_candidates.return_value = []
        url = reverse("recommend-helper")
        response = self.client.post(url, self.travel_request_payload, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.data)

    def test_invalid_payload_returns_400(self):
        url = reverse("recommend-helper")
        bad_payload = {"id": "not-a-uuid"}  # missing required fields
        response = self.client.post(url, bad_payload, format="json")

        self.assertEqual(response.status_code, 400)