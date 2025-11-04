# Database Schema Diagram

Entity Relationship Diagram (ERD) showing all database collections and their relationships.

## Database Schema

```mermaid
erDiagram
    User ||--o{ Product : "creates"
    User ||--o{ Order : "places"
    User ||--o{ Cart : "has"
    User ||--o{ Delivery : "assigned"
    User ||--o{ Return : "requests"
    User ||--o{ Chat : "participates"
    User ||--o{ Notification : "receives"
    User ||--o{ Wishlist : "has"
    User ||--o{ Payout : "receives"
    User ||--o{ User : "manages"
    
    Product ||--o{ Cart : "added_to"
    Product ||--o{ Order : "ordered"
    Product ||--o{ Return : "returned"
    Product ||--o{ Wishlist : "added_to"
    Product ||--o{ Chat : "context"
    
    Order ||--|| Delivery : "has"
    Order ||--o{ Return : "returned"
    Order ||--|| Payout : "generates"
    
    Delivery ||--o{ Delivery : "reassigned"
    Return ||--o{ Return : "reassigned"
    
    Chat ||--o{ Chat : "messages"
    
    User {
        ObjectId _id PK
        String fullName
        String email UK
        String password
        String role
        ObjectId deliveryAgencyId FK
        String delivererType
        Object profilePhoto
        Object coverPhoto
        Object primaryAddress
        Object secondaryAddress
        Object bankPayout
        Date createdAt
        Date updatedAt
    }
    
    Product {
        ObjectId _id PK
        String title
        Object body
        String status
        ObjectId userID FK
        Array tag
        Array categories
        String slug
        String thumbnail
        Array images
        Number price
        Number stock
        Number estimatedDeliveryDays
        Number rating
        Array ratings
        Array comments
        Number likes
        Number views
        Date createdAt
    }
    
    Cart {
        ObjectId _id PK
        ObjectId userId FK
        Array items
        Date createdAt
        Date updatedAt
    }
    
    Order {
        ObjectId _id PK
        ObjectId userId FK
        Array items
        Number amount
        String currency
        String status
        String paymentIntentId
        String refundId
        String refundStatus
        Number refundAmount
        Object deliveryAddress
        String deliveryStatus
        Date estimatedDeliveryDate
        Date createdAt
        Date updatedAt
    }
    
    Delivery {
        ObjectId _id PK
        ObjectId orderId FK
        ObjectId userId FK
        String trackingNumber
        String carrier
        String status
        ObjectId deliveryAgencyId FK
        ObjectId warehouseOperatorId FK
        ObjectId deliveryPersonId FK
        String delivererType
        Array assignmentHistory
        Date estimatedDeliveryDate
        Date createdAt
        Date updatedAt
    }
    
    Return {
        ObjectId _id PK
        ObjectId orderId FK
        ObjectId orderItemId FK
        ObjectId userId FK
        String reason
        Array proofImages
        String status
        ObjectId supportUserId FK
        ObjectId deliveryAgencyId FK
        ObjectId returnDelivererId FK
        ObjectId verificationTeamId FK
        ObjectId inspectorId FK
        ObjectId financeUserId FK
        Array assignmentHistory
        String inspectionResult
        String refundId
        String refundStatus
        Date createdAt
        Date updatedAt
    }
    
    Chat {
        ObjectId _id PK
        Array participants
        Object productContext
        Object lastMessage
        Map unreadCount
        String status
        Array messages
        Date createdAt
        Date updatedAt
    }
    
    Notification {
        ObjectId _id PK
        ObjectId userId FK
        String type
        String title
        String message
        String link
        Boolean read
        Date createdAt
    }
    
    Wishlist {
        ObjectId _id PK
        ObjectId userId FK
        Array items
        Date createdAt
        Date updatedAt
    }
    
    Payout {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId orderId FK
        Number amount
        String currency
        String status
        String stripePayoutId
        Date createdAt
        Date updatedAt
    }
    
    Banner {
        ObjectId _id PK
        String type
        String title
        String subtitle
        String description
        String backgroundColor
        String textColor
        String buttonText
        String buttonLink
        Number order
        Boolean isActive
        Date createdAt
        Date updatedAt
    }
    
    Theme {
        ObjectId _id PK
        Object colors
        Object header
        Object footer
        Object banner
        Object button
        Object card
        Object nav
        Object logo
        Object bodyText
        Boolean isActive
        ObjectId updatedBy FK
        Number version
        Date createdAt
        Date updatedAt
    }
```

## Collection Relationships

### User Relationships
- **One-to-Many**: User can create multiple Products
- **One-to-Many**: User can place multiple Orders
- **One-to-One**: User has one Cart
- **One-to-Many**: User can have multiple Deliveries assigned
- **One-to-Many**: User can request multiple Returns
- **One-to-Many**: User can participate in multiple Chats
- **One-to-Many**: User receives multiple Notifications
- **One-to-One**: User has one Wishlist
- **One-to-Many**: User can receive multiple Payouts
- **Many-to-One**: Delivery Person belongs to Delivery Agency

### Product Relationships
- **One-to-Many**: Product can be in multiple Carts
- **One-to-Many**: Product can be in multiple Orders
- **One-to-Many**: Product can be returned multiple times
- **One-to-Many**: Product can be in multiple Wishlists
- **One-to-One**: Product can be context for Chat

### Order Relationships
- **One-to-One**: Order has one Delivery
- **One-to-Many**: Order can have multiple Returns
- **One-to-One**: Order generates one Payout

### Delivery Relationships
- **One-to-Many**: Delivery can have multiple reassignments (history)
- **Many-to-One**: Delivery belongs to one Order

### Return Relationships
- **One-to-Many**: Return can have multiple reassignments (history)
- **Many-to-One**: Return belongs to one Order

### Chat Relationships
- **One-to-Many**: Chat has multiple Messages
- **Many-to-Many**: Chat has multiple Participants (Users)

## Indexes

### User Collection
- `email`: Unique index
- `role`: Index for role-based queries
- `deliveryAgencyId`: Index for agency relationships

### Product Collection
- `userID`: Index for seller products
- `categories`: Index for category filtering
- `tag`: Index for tag filtering
- `slug`: Index for product lookup

### Order Collection
- `userId`: Index for user orders
- `status`: Index for status filtering
- `paymentIntentId`: Index for payment lookup

### Delivery Collection
- `orderId`: Index for order lookup
- `userId`: Index for assigned user
- `status`: Index for status filtering

### Chat Collection
- `participants.userId`: Index for user chats
- `status`: Index for status filtering

### Notification Collection
- `userId`: Index for user notifications
- `read`: Index for unread notifications
