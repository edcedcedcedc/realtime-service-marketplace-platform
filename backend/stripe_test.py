import os
import django
import stripe
import paypalrestsdk
import logging

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.conf import settings

# Stripe test key
stripe.api_key = settings.STRIPE_SECRET_KEY

# Configure PayPal sandbox
paypalrestsdk.configure(
    {
        "mode": "sandbox",  # sandbox or live
        "client_id": settings.PAYPAL_SANDBOX_CLIENT_ID,  # add in your Django settings
        "client_secret": settings.PAYPAL_SANDBOX_SECRET,
    }
)

logging.basicConfig(level=logging.INFO)


def main():
    print("=== Stripe + PayPal Test Flow ===")

    # ---------- STRIPE FLOW ----------
    # Step 1: Create PaymentIntent
    payment_intent = stripe.PaymentIntent.create(
        amount=1000,  # 10.00 USD
        currency="usd",
        payment_method_types=["card"],
        capture_method="manual",
        description="Test PaymentIntent from Django terminal",
    )

    print("\n[Stripe] PaymentIntent created:")
    print("ID:", payment_intent.id)
    print("Client secret:", payment_intent.client_secret)
    print("Status:", payment_intent.status)

    # Step 2: Confirm PaymentIntent
    confirmed_intent = stripe.PaymentIntent.confirm(
        payment_intent.id, payment_method="pm_card_visa"
    )
    print("\n[Stripe] PaymentIntent confirmed:")
    print("ID:", confirmed_intent.id)
    print("Status:", confirmed_intent.status)

    # Step 3: Capture funds
    captured_intent = stripe.PaymentIntent.capture(confirmed_intent.id)
    print("\n[Stripe] PaymentIntent captured:")
    print("ID:", captured_intent.id)
    print("Status:", captured_intent.status)

    # ---------- PAYPAL FLOW ----------
    print("\n=== Initiating PayPal Payout ===")

    payout = paypalrestsdk.Payout(
        {
            "sender_batch_header": {
                "sender_batch_id": f"batch_{captured_intent.id}",
                "email_subject": "You have a payment from Taskoon!",
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": "10.00",  # same as captured from Stripe
                        "currency": "USD",
                    },
                    "receiver": "sb-x4yr947687678@business.example.com",  # sandbox tasker email
                    "note": "Thanks for completing the task!",
                    "sender_item_id": f"item_{captured_intent.id}",
                }
            ],
        }
    )

    if payout.create(sync_mode=False):
        print("✅ PayPal Payout created successfully")
        print("Payout batch ID:", payout.batch_header.payout_batch_id)
    else:
        print("❌ Error creating PayPal payout")
        print(payout.error)

    print("\n✅ Stripe + PayPal test flow completed successfully!")


if __name__ == "__main__":
    main()
