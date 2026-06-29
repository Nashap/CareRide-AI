from helpers.models import Helper


def search_available_helpers(skill=None):
    """
    Search available helpers.

    If a skill is provided, only matching helpers
    are returned.
    """

    helpers = Helper.objects.filter(
        availability=True
    )

    if skill:
        helpers = helpers.filter(
            skills__icontains=skill
        )

    return [
        {
            "id": helper.id,
            "name": helper.name,
            "skills": helper.skills,
            "rating": helper.rating,
            "availability": helper.availability,
        }
        for helper in helpers
    ]


def highest_rated_helper():
    """
    Return the highest-rated helper.
    """

    helper = (
        Helper.objects.filter(
            availability=True
        )
        .order_by("-rating")
        .first()
    )

    if not helper:
        return None

    return {
        "id": helper.id,
        "name": helper.name,
        "skills": helper.skills,
        "rating": helper.rating,
    }


def count_available_helpers():
    """
    Return number of available helpers.
    """

    return Helper.objects.filter(
        availability=True
    ).count()