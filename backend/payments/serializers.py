from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = [
            "user",
            "charging_session",
            "amount",
            "transaction_id",
            "paid_at",
            "payment_status",
            "created_at",
        ]