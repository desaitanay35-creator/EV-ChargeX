import django_filters
from .models import Station


class StationFilter(django_filters.FilterSet):

    min_rating = django_filters.NumberFilter(
        field_name="rating",
        lookup_expr="gte"
    )

    max_rating = django_filters.NumberFilter(
        field_name="rating",
        lookup_expr="lte"
    )

    class Meta:
        model = Station

        fields = [
            "city",
            "state",
            "status",
            "min_rating",
            "max_rating",
        ]