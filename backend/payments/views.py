from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Payment
from .serializers import PaymentSerializer
from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
import uuid

# Create your views here.

class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pay_now(request):

    payment_id = request.data.get("payment_id")
    payment_method = request.data.get("payment_method")

    if not payment_id:
        return Response(
            {"error": "payment_id is required."},
            status=400
        )

    if not payment_method:
        return Response(
            {"error": "payment_method is required."},
            status=400
        )

    payment = get_object_or_404(
        Payment,
        id=payment_id,
        user=request.user
    )

    if payment.payment_status == "SUCCESS":
        return Response(
            {"error": "Payment already completed."},
            status=400
        )

    payment.payment_method = payment_method
    payment.payment_status = "SUCCESS"
    payment.transaction_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
    payment.paid_at = timezone.now()
    payment.save()

    return Response({
        "message": "Payment Successful",
        "payment_id": payment.id,
        "transaction_id": payment.transaction_id,
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "payment_status": payment.payment_status,
        "paid_at": payment.paid_at
    })