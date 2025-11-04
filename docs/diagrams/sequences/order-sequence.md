# Order Processing Sequence Diagram

Sequence diagrams showing order creation, payment processing, and delivery tracking.

## Order Creation Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Server
    participant DB as Database
    participant S as Stripe
    
    U->>F: Click Checkout
    F->>API: GET /carts/me<br/>Authorization: Bearer <token>
    API->>DB: Get user cart
    DB-->>API: Cart data
    API-->>F: 200 OK<br/>{cart, totals}
    F->>F: Display cart items
    U->>F: Enter delivery address
    U->>F: Review order
    F->>API: POST /checkout/create-payment-intent<br/>{amount, currency}
    API->>API: Calculate total from cart
    API->>S: Create Payment Intent
    S-->>API: Payment Intent<br/>{clientSecret}
    API-->>F: 200 OK<br/>{clientSecret}
    F->>F: Display payment form
    U->>F: Enter card details
    F->>S: Confirm Payment<br/>{clientSecret, cardDetails}
    S-->>F: Payment Result
    alt Payment successful
        F->>API: POST /orders<br/>{paymentIntentId, amount, currency}
        API->>API: Validate payment
        API->>S: Retrieve Payment Intent
        S-->>API: Payment Intent details
        API->>DB: Create order
        DB-->>API: Order created
        API->>DB: Clear cart
        DB-->>API: Cart cleared
        API->>DB: Create delivery record
        DB-->>API: Delivery created
        API-->>F: 201 Created<br/>{order}
        F->>F: Update Redux store
        F-->>U: Show order confirmation
    else Payment failed
        F-->>U: Show payment error
    end
```

## Payment Processing Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Server
    participant S as Stripe
    participant DB as Database
    
    U->>F: Proceed to Payment
    F->>API: POST /checkout/create-payment-intent<br/>{amount: 10000, currency: "usd"}
    API->>API: Validate amount
    API->>S: stripe.paymentIntents.create<br/>{amount, currency}
    S-->>API: Payment Intent<br/>{id: "pi_xxx", clientSecret}
    API-->>F: 200 OK<br/>{clientSecret}
    F->>F: Initialize Stripe Elements
    F->>F: Display payment form
    U->>F: Enter card: 4242 4242 4242 4242
    U->>F: Submit payment
    F->>S: stripe.confirmCardPayment<br/>{clientSecret, paymentMethod}
    S->>S: Process payment
    alt Payment successful
        S-->>F: Payment succeeded<br/>{paymentIntent: {...}}
        F->>API: POST /orders<br/>{paymentIntentId: "pi_xxx"}
        API->>S: stripe.paymentIntents.retrieve<br/>{paymentIntentId}
        S-->>API: Payment Intent details
        API->>API: Verify payment status
        API->>DB: Create order<br/>{status: "paid", paymentIntentId}
        DB-->>API: Order created
        API->>DB: Clear cart
        DB-->>API: Cart cleared
        API-->>F: 201 Created<br/>{order}
        F-->>U: Show success & redirect
    else Payment failed
        S-->>F: Payment failed<br/>{error: {...}}
        F-->>U: Show error message
    end
```

## Delivery Status Update Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Server
    participant DB as Database
    participant N as Notification Service
    
    U->>F: View order details
    F->>API: GET /orders/:id<br/>Authorization: Bearer <token>
    API->>DB: Find order
    DB-->>API: Order document
    API->>DB: Find delivery record
    DB-->>API: Delivery document
    API-->>F: 200 OK<br/>{order, delivery}
    F-->>U: Display order & delivery status
    
    Note over U,N: Delivery Status Update
    U->>F: Update delivery status (as deliverer)
    F->>API: PUT /delivery/:orderId/status<br/>{status: "delivered"}<br/>Authorization: Bearer <token>
    API->>API: Verify permissions
    API->>API: Validate status transition
    API->>DB: Update delivery status
    DB-->>API: Delivery updated
    API->>DB: Update order delivery status
    DB-->>API: Order updated
    API->>N: Create notification<br/>{userId, type: "delivery_update"}
    N->>DB: Save notification
    DB-->>N: Notification saved
    API-->>F: 200 OK<br/>{delivery}
    F->>F: Refresh order details
    F->>F: Show notification
    F-->>U: Display updated status
```

## Return Request Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Server
    participant DB as Database
    participant N as Notification Service
    
    U->>F: View order details
    F->>F: Click Return Item
    U->>F: Fill return form<br/>{reason, proofImages}
    F->>API: POST /returns/request<br/>{orderId, orderItemId, reason, proofImages}<br/>Authorization: Bearer <token>
    API->>API: Validate request
    API->>DB: Find order
    DB-->>API: Order document
    API->>API: Validate order item
    API->>DB: Create return record<br/>{status: "pending"}
    DB-->>API: Return created
    API->>DB: Find support user
    DB-->>API: Support user
    API->>DB: Assign support user<br/>{supportUserId}
    DB-->>API: Assignment saved
    API->>N: Create notification<br/>{userId: supportUserId, type: "return_assigned"}
    N->>DB: Save notification
    DB-->>N: Notification saved
    API->>N: Create notification<br/>{userId: user, type: "return_created"}
    N->>DB: Save notification
    API-->>F: 201 Created<br/>{return}
    F->>F: Update UI
    F-->>U: Show return confirmation
```

## Refund Processing Sequence

```mermaid
sequenceDiagram
    participant I as Inspector
    participant F as Frontend
    participant API as API Server
    participant DB as Database
    participant S as Stripe
    participant N as Notification Service
    
    I->>F: Inspect return item
    F->>F: Accept/Reject return
    F->>API: POST /returns/:returnId/inspect<br/>{result: "accept"}<br/>Authorization: Bearer <token>
    API->>API: Verify inspector permissions
    API->>DB: Update return<br/>{inspectionResult: "accept"}
    DB-->>API: Return updated
    API->>DB: Find finance user
    DB-->>API: Finance user
    API->>DB: Assign finance user<br/>{financeUserId}
    DB-->>API: Assignment saved
    API->>N: Create notification<br/>{userId: financeUserId, type: "return_approved"}
    N->>DB: Save notification
    
    Note over I,N: Finance Processing
    F->>API: POST /returns/:returnId/process-refund<br/>Authorization: Bearer <token>
    API->>API: Verify finance permissions
    API->>DB: Find return & order
    DB-->>API: Return & order documents
    API->>S: stripe.refunds.create<br/>{paymentIntentId, amount}
    S->>S: Process refund
    alt Refund successful
        S-->>API: Refund created<br/>{id: "re_xxx", status: "succeeded"}
        API->>DB: Update return<br/>{refundId, refundStatus: "succeeded"}
        DB-->>API: Return updated
        API->>DB: Update order<br/>{refundId, refundStatus: "succeeded"}
        DB-->>API: Order updated
        API->>N: Create notification<br/>{userId: user, type: "refund_processed"}
        N->>DB: Save notification
        API-->>F: 200 OK<br/>{return}
        F-->>I: Show refund success
    else Refund failed
        S-->>API: Refund failed<br/>{error: {...}}
        API->>DB: Update return<br/>{refundStatus: "failed", refundFailureReason}
        DB-->>API: Return updated
        API->>N: Create notification<br/>{userId: financeUserId, type: "refund_failed"}
        API-->>F: 500 Error<br/>{error: "Refund failed"}
        F-->>I: Show error message
    end
```
