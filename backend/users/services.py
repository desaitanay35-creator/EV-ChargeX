import logging
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import User
from stations.models import Station
from charging.models import ChargingSession
from bookings.models import Booking

logger = logging.getLogger(__name__)


def validate_last_admin_protection(target_user):
    """
    Ensures that the final active ADMIN account cannot be demoted, blocked, or deactivated.
    """
    if target_user.role == "ADMIN" and target_user.is_active:
        active_admin_count = User.objects.filter(role="ADMIN", is_active=True).count()
        if active_admin_count <= 1:
            raise ValidationError({
                "detail": "The final active ADMIN account cannot be deactivated or demoted."
            })


def get_operator_assigned_stations(target_user):
    """
    Returns list of assigned stations for an operator account.
    """
    if target_user.role == "OPERATOR":
        return list(
            Station.objects.filter(operator=target_user).values("id", "station_name", "city")
        )
    return []


@transaction.atomic
def block_user(actor, target_user):
    """
    Blocks a user account by setting is_active=False.
    """
    if target_user == actor:
        raise ValidationError({"detail": "You cannot block your own account."})

    validate_last_admin_protection(target_user)

    assigned_stations = get_operator_assigned_stations(target_user)
    if assigned_stations:
        station_names = ", ".join([s["station_name"] for s in assigned_stations])
        raise ValidationError({
            "detail": f"This operator manages assigned station(s) ({station_names}). Reassign those stations before blocking the account.",
            "assigned_stations": assigned_stations
        })

    target_user.is_active = False
    target_user.save()
    logger.info(f"OPERATOR_BLOCKED actor_id={actor.id} target_operator_id={target_user.id}")
    return target_user


@transaction.atomic
def unblock_user(actor, target_user):
    """
    Unblocks a user account by setting is_active=True.
    """
    target_user.is_active = True
    target_user.save()
    logger.info(f"OPERATOR_UNBLOCKED actor_id={actor.id} target_operator_id={target_user.id}")
    return target_user


@transaction.atomic
def change_user_role(actor, target_user, new_role):
    """
    Safely converts account role between USER and OPERATOR.
    """
    if new_role not in ["USER", "OPERATOR"]:
        raise ValidationError({"role": [f"Invalid target role '{new_role}'. Only USER or OPERATOR roles are allowed."]})

    if target_user.role == new_role:
        return target_user

    if target_user == actor:
        raise ValidationError({"detail": "You cannot change your own account role."})

    if target_user.role == "ADMIN":
        validate_last_admin_protection(target_user)

    if target_user.role == "OPERATOR" and new_role == "USER":
        assigned_stations = get_operator_assigned_stations(target_user)
        if assigned_stations:
            station_names = ", ".join([s["station_name"] for s in assigned_stations])
            raise ValidationError({
                "role": [f"This operator manages assigned station(s) ({station_names}). Reassign those stations before converting to USER."]
            })

    target_user.role = new_role
    target_user.save()
    logger.info(f"USER_CONVERTED_TO_OPERATOR actor_id={actor.id} target_operator_id={target_user.id} new_role={new_role}")
    return target_user


@transaction.atomic
def create_operator(actor, validated_data):
    """
    Creates a new Station Operator account with safe defaults.
    """
    password = validated_data.pop("password")
    validated_data.pop("confirm_password", None)

    username = validated_data.get("username")
    if not username:
        validated_data["username"] = validated_data.get("email")

    user = User.objects.create_user(
        role="OPERATOR",
        is_staff=False,
        is_superuser=False,
        is_active=True,
        password=password,
        **validated_data
    )
    logger.info(f"OPERATOR_CREATED actor_id={actor.id} target_operator_id={user.id}")
    return user



@transaction.atomic
def reassign_station_operator(actor, station_id, new_operator_id):
    """
    Reassigns a station to a target active OPERATOR account atomically with select_for_update and active session checks.
    """
    station = Station.objects.select_for_update().get(pk=station_id)
    try:
        new_operator = User.objects.get(pk=new_operator_id)
    except User.DoesNotExist:
        raise ValidationError({"operator_id": ["Target user account does not exist."]})

    # Explicit validation of target operator
    if new_operator.role != "OPERATOR":
        raise ValidationError({"operator_id": ["The selected account must be a Station Operator (role='OPERATOR')."]})
    if not new_operator.is_active:
        raise ValidationError({"operator_id": ["The selected Station Operator account is blocked/inactive and cannot be assigned stations."]})

    current_operator = station.operator

    # Idempotent check
    if current_operator and current_operator.id == new_operator.id:
        return {
            "reassigned": False,
            "message": f"Station '{station.station_name}' is already assigned to operator '{new_operator.username}'.",
            "station": station,
            "current_operator": current_operator,
            "new_operator": new_operator,
            "active_sessions_count": 0,
            "upcoming_bookings_count": 0,
        }

    # Guard: check active sessions across chargers at this station
    active_sessions = ChargingSession.objects.filter(
        charger__station=station,
        session_status="ACTIVE"
    ).count()

    if active_sessions > 0:
        raise ValidationError({
            "detail": "This station has active charging sessions and cannot be reassigned until they are completed or interrupted.",
            "active_sessions": active_sessions
        })

    today = timezone.now().date()
    upcoming_bookings = Booking.objects.filter(
        charger__station=station,
        booking_date__gte=today,
        booking_status__in=["CONFIRMED", "IN_PROGRESS"]
    ).count()

    previous_operator_id = current_operator.id if current_operator else None
    station.operator = new_operator
    station.save(update_fields=["operator"])

    logger.info(
        f"STATION_REASSIGNED actor_id={actor.id} station_id={station.id} "
        f"previous_operator_id={previous_operator_id} new_operator_id={new_operator.id}"
    )

    return {
        "reassigned": True,
        "message": f"Station '{station.station_name}' successfully reassigned to '{new_operator.username}'.",
        "station": station,
        "current_operator": current_operator,
        "new_operator": new_operator,
        "active_sessions_count": active_sessions,
        "upcoming_bookings_count": upcoming_bookings,
    }

