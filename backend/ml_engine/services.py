from stations.models import Station


def recommend_station(trip):
    """
    Returns the best charging station.
    (Initial Version)
    """

    station = (
        Station.objects
        .filter(status="ACTIVE")
        .order_by("-rating")
        .first()
    )

    return station