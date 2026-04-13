# Level-2 DFD: Payment (Updated for TradeFairBook)

This DFD is aligned with the implemented flow in:
- `POST /api/bookings/:id/payment/order`
- `POST /api/bookings/:id/payment/verify`

```mermaid
flowchart TD
  U[User] -->|Pay Now + bookingId| P51((5.1 Create Payment Order))
  P51 -->|Read booking, owner, status, grandTotal| B[(D1 Booking Collection)]
  B -->|Booking data (must be APPROVED, not PAID)| P51
  P51 -->|Create order: amount, currency, receipt, notes| RZO[External: Razorpay Orders API]
  RZO -->|orderId, amount, currency| P51
  P51 -->|Update paymentOrderId| B
  P51 -->|Return keyId + orderId + amount + customer| U

  U -->|Open checkout with order_id| RZC[External: Razorpay Checkout]
  RZC -->|Success payload: order_id, payment_id, signature| U
  RZC -->|Failure event| U

  U -->|/payment/verify + Razorpay payload| P52((5.2 Verify Payment))
  P52 -->|Read booking + paymentOrderId + status| B
  B -->|Booking payment fields| P52
  P52 -->|Compute expected HMAC SHA256| P53((5.3 Signature Validation))
  P53 -->|Invalid signature / order mismatch| U
  P53 -->|Valid signature| P54((5.4 Complete Payment))
  P54 -->|Update status=PAID, paymentId, paymentSignature, paidAt| B
  P54 -->|Sync stall occupancy| P55((5.5 Sync Stall Status))
  P55 -->|Count active bookings for stall| B
  P55 -->|Update stall status BOOKED/AVAILABLE| S[(D2 Stall Collection)]
  P54 -->|Payment success + updated booking| U
```

## What changed from the older DFD

1. Payment is split into two backend sub-processes:
   - Create Razorpay order
   - Verify Razorpay payment and signature
2. There is no separate `Payment` data store in this project.
   - Payment fields are stored inside the `Booking` document.
3. Eligibility check is explicit:
   - Only `APPROVED` bookings can enter payment.
4. Final payment success updates:
   - `Booking.status` to `PAID`
   - `paymentOrderId`, `paymentId`, `paymentSignature`, `paidAt`
5. Stall status sync is part of payment completion flow.
