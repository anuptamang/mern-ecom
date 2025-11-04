# User Flow Diagrams

User flow diagrams showing key user journeys in the application.

## User Registration Flow

```mermaid
flowchart TD
    A[User Visits Site] --> B{Logged In?}
    B -->|No| C[Click Register]
    B -->|Yes| D[Dashboard]
    C --> E[Fill Registration Form]
    E --> F{Form Valid?}
    F -->|No| E
    F -->|Yes| G[Submit Registration]
    G --> H{Registration Success?}
    H -->|No| I[Show Error]
    I --> E
    H -->|Yes| J[Receive JWT Token]
    J --> K[Store Token]
    K --> L[Redirect to Profile]
    L --> M{Profile Complete?}
    M -->|No| N[Complete Profile]
    N --> M
    M -->|Yes| D
```

## Order Placement Flow

```mermaid
flowchart TD
    A[Browse Products] --> B[Add to Cart]
    B --> C[View Cart]
    C --> D{Items in Cart?}
    D -->|No| A
    D -->|Yes| E[Proceed to Checkout]
    E --> F{Logged In?}
    F -->|No| G[Login/Register]
    G --> F
    F -->|Yes| H[Enter Delivery Address]
    H --> I[Review Order]
    I --> J[Enter Payment Info]
    J --> K[Create Payment Intent]
    K --> L{Payment Intent Created?}
    L -->|No| M[Show Error]
    M --> J
    L -->|Yes| N[Confirm Payment]
    N --> O{Payment Success?}
    O -->|No| P[Payment Failed]
    P --> J
    O -->|Yes| Q[Create Order]
    Q --> R[Clear Cart]
    R --> S[Send Confirmation]
    S --> T[Order Tracking]
```

## Payment Processing Flow

```mermaid
flowchart TD
    A[Initiate Checkout] --> B[Calculate Total]
    B --> C[Create Payment Intent]
    C --> D[Stripe Payment Intent]
    D --> E{Intent Created?}
    E -->|No| F[Show Error]
    F --> A
    E -->|Yes| G[Display Payment Form]
    G --> H[User Enters Card Details]
    H --> I[Submit Payment]
    I --> J[Stripe Processes Payment]
    J --> K{Payment Success?}
    K -->|No| L[Payment Failed]
    L --> M{Retry?}
    M -->|Yes| H
    M -->|No| N[Cancel Checkout]
    K -->|Yes| O[Payment Confirmed]
    O --> P[Create Order]
    P --> Q[Update Cart]
    Q --> R[Send Confirmation Email]
    R --> S[Redirect to Order Details]
```

## Return/Refund Flow

```mermaid
flowchart TD
    A[User Views Order] --> B[Select Item to Return]
    B --> C[Fill Return Form]
    C --> D[Upload Proof Images]
    D --> E[Submit Return Request]
    E --> F{Request Valid?}
    F -->|No| C
    F -->|Yes| G[Create Return Record]
    G --> H[Assign Support User]
    H --> I[Support Reviews]
    I --> J{Approve?}
    J -->|No| K[Reject Return]
    K --> L[Notify User]
    J -->|Yes| M[Assign Delivery Agency]
    M --> N[Assign Return Deliverer]
    N --> O[Pickup Scheduled]
    O --> P[Deliverer Picks Up]
    P --> Q[Assign Verification Team]
    Q --> R[Assign Inspector]
    R --> S[Inspect Item]
    S --> T{Accept?}
    T -->|No| U[Reject Return]
    U --> V[Re-deliver Item]
    V --> W[Notify User]
    T -->|Yes| X[Assign Finance]
    X --> Y[Process Refund]
    Y --> Z[Stripe Refund]
    Z --> AA{Refund Success?}
    AA -->|No| AB[Refund Failed]
    AB --> AC[Notify Finance]
    AA -->|Yes| AD[Update Return Status]
    AD --> AE[Notify User]
```

## Product Management Flow (Seller)

```mermaid
flowchart TD
    A[Seller Dashboard] --> B[Click Add Product]
    B --> C[Fill Product Form]
    C --> D[Upload Thumbnail]
    D --> E[Upload Gallery Images]
    E --> F[Set Categories & Tags]
    F --> G[Set Price & Stock]
    G --> H[Add Description]
    H --> I[Submit Product]
    I --> J{Validation Pass?}
    J -->|No| K[Show Errors]
    K --> C
    J -->|Yes| L[Create Product]
    L --> M[Product Created]
    M --> N[Product Listed]
    N --> O[Buyers Can View]
```

## Delivery Tracking Flow

```mermaid
flowchart TD
    A[Order Created] --> B[Status: Packing]
    B --> C[Seller Marks Ready to Ship]
    C --> D[Status: Ready to Ship]
    D --> E[Assign Warehouse Operator]
    E --> F[Assign Warehouse Deliverer]
    F --> G[Pickup from Seller]
    G --> H[Status: Picked Up]
    H --> I[Deliver to Facility]
    I --> J[Status: In Facility]
    J --> K[Assign Customer Delivery Deliverer]
    K --> L[Status: Out for Delivery]
    L --> M[Deliver to Customer]
    M --> N{Customer Accepts?}
    N -->|No| O[Reject Delivery]
    O --> P[Update Status]
    N -->|Yes| Q[Status: Delivered]
    Q --> R[Order Complete]
```
