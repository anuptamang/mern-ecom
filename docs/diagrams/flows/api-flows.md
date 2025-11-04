# API Flow Diagrams

API flow diagrams showing request/response patterns and API interactions.

## API Request Flow

```mermaid
flowchart TD
    A[Client Request] --> B[API Gateway]
    B --> C{Authentication Required?}
    C -->|Yes| D[Validate JWT Token]
    C -->|No| E[Continue]
    D --> F{Token Valid?}
    F -->|No| G[401 Unauthorized]
    F -->|Yes| H{Authorization Check}
    H -->|No Permission| I[403 Forbidden]
    H -->|Has Permission| E
    E --> J[Input Validation]
    J --> K{Validation Pass?}
    K -->|No| L[400 Bad Request]
    K -->|Yes| M[Route Handler]
    M --> N[Controller]
    N --> O[Service Layer]
    O --> P[Database Query]
    P --> Q{Query Success?}
    Q -->|No| R[500 Server Error]
    Q -->|Yes| S[Process Data]
    S --> T[Format Response]
    T --> U[200 OK Response]
    G --> V[Client Error Handler]
    I --> V
    L --> V
    R --> V
    U --> W[Client Success Handler]
```

## RESTful API Patterns

```mermaid
graph LR
    A[Client] --> B[GET /resource]
    A --> C[POST /resource]
    A --> D[PUT /resource/:id]
    A --> E[PATCH /resource/:id]
    A --> F[DELETE /resource/:id]
    
    B --> G[200 OK<br/>List/Item]
    C --> H[201 Created<br/>New Resource]
    D --> I[200 OK<br/>Updated Resource]
    E --> J[200 OK<br/>Partial Update]
    F --> K[200 OK<br/>Deleted]
    
    G --> L[Response Handler]
    H --> L
    I --> L
    J --> L
    K --> L
```

## Error Handling Flow

```mermaid
flowchart TD
    A[API Request] --> B[Try Process]
    B --> C{Error Occurs?}
    C -->|No| D[Success Response]
    C -->|Yes| E{Error Type?}
    E -->|Validation| F[400 Bad Request]
    E -->|Authentication| G[401 Unauthorized]
    E -->|Authorization| H[403 Forbidden]
    E -->|Not Found| I[404 Not Found]
    E -->|Conflict| J[409 Conflict]
    E -->|Server Error| K[500 Internal Server Error]
    F --> L[Error Logger]
    G --> L
    H --> L
    I --> L
    J --> L
    K --> L
    L --> M[Format Error Response]
    M --> N[Send to Client]
    D --> O[Format Success Response]
    O --> N
```

## Pagination Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    participant DB as Database
    
    C->>API: GET /products?page=1&limit=10
    API->>API: Parse query params
    API->>DB: Count total documents
    DB-->>API: Total count: 100
    API->>DB: Find documents<br/>{skip: 0, limit: 10}
    DB-->>API: 10 documents
    API->>API: Calculate pagination<br/>{currentPage: 1, totalPages: 10, totalItems: 100}
    API-->>C: 200 OK<br/>{data: [...], currentPage: 1, numberOfPages: 10, totalItems: 100}
    C->>C: Display page 1
    C->>API: GET /products?page=2&limit=10
    API->>DB: Find documents<br/>{skip: 10, limit: 10}
    DB-->>API: 10 documents
    API-->>C: 200 OK<br/>{data: [...], currentPage: 2, numberOfPages: 10, totalItems: 100}
```

## File Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Server
    participant M as Multer Middleware
    participant FS as File Storage
    participant DB as Database
    
    U->>F: Select file
    F->>F: Validate file<br/>{type, size}
    F->>API: POST /products<br/>multipart/form-data<br/>{file, title, ...}
    API->>M: Process multipart
    M->>M: Validate file
    M->>FS: Save file
    FS-->>M: File URL
    M-->>API: File processed<br/>{fileUrl}
    API->>API: Process form data
    API->>DB: Create product<br/>{thumbnail: fileUrl, ...}
    DB-->>API: Product created
    API-->>F: 201 Created<br/>{product}
    F-->>U: Show success
```

## Real-time Notification Flow

```mermaid
sequenceDiagram
    participant E as Event
    participant API as API Server
    participant DB as Database
    participant N as Notification Service
    participant WS as WebSocket
    participant C as Client
    
    E->>API: Event triggered<br/>{order created}
    API->>DB: Find relevant users<br/>{sellers, admins}
    DB-->>API: User list
    API->>N: Create notifications<br/>{for each user}
    N->>DB: Save notifications
    DB-->>N: Notifications saved
    N->>WS: Emit notification event
    WS->>C: Push notification<br/>{type, title, message}
    C->>C: Update notification badge
    C->>C: Show notification
    C->>API: GET /notifications/me
    API->>DB: Find user notifications
    DB-->>API: Notifications
    API-->>C: 200 OK<br/>{notifications}
    C->>C: Display notifications
```
