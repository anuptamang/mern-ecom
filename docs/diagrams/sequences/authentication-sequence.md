# Authentication Sequence Diagram

Sequence diagram showing the authentication flow between user, frontend, backend, and database.

## User Login Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Server
    participant DB as Database
    
    U->>F: Enter email & password
    F->>F: Validate form
    F->>API: POST /user/login<br/>{email, password}
    API->>API: Validate input
    API->>DB: Find user by email
    DB-->>API: User document
    API->>API: Compare password
    alt Password matches
        API->>API: Generate JWT token
        API-->>F: 200 OK<br/>{result: user, token: JWT}
        F->>F: Store token in localStorage
        F->>F: Update Redux store
        F-->>U: Redirect to dashboard
    else Password mismatch
        API-->>F: 401 Unauthorized<br/>{error: "Invalid credentials"}
        F-->>U: Show error message
    end
```

## User Registration Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Server
    participant DB as Database
    
    U->>F: Fill registration form
    F->>F: Validate form
    F->>API: POST /user/register<br/>{email, password, firstName, lastName, role}
    API->>API: Validate input
    API->>DB: Check if email exists
    DB-->>API: User exists?
    alt Email already exists
        API-->>F: 409 Conflict<br/>{error: "Email already exists"}
        F-->>U: Show error message
    else Email available
        API->>API: Hash password
        API->>DB: Create new user
        DB-->>API: User created
        API->>API: Generate JWT token
        API-->>F: 201 Created<br/>{result: user, token: JWT}
        F->>F: Store token in localStorage
        F->>F: Update Redux store
        F-->>U: Redirect to profile setup
    end
```

## Token Validation Sequence

```mermaid
sequenceDiagram
    participant F as Frontend
    participant API as API Server
    participant DB as Database
    
    F->>F: Get token from localStorage
    F->>API: Request with Authorization header<br/>Bearer <token>
    API->>API: Extract token
    API->>API: Verify token signature
    alt Token invalid
        API-->>F: 401 Unauthorized
        F->>F: Clear token
        F->>F: Redirect to login
    else Token expired
        API-->>F: 401 Unauthorized<br/>{error: "Token expired"}
        F->>F: Attempt token refresh
        F->>API: POST /user/refresh-token
        API->>API: Validate refresh token
        alt Refresh valid
            API->>API: Generate new JWT
            API-->>F: 200 OK<br/>{token: newJWT}
            F->>F: Update token
            F->>API: Retry original request
        else Refresh invalid
            API-->>F: 401 Unauthorized
            F->>F: Redirect to login
        end
    else Token valid
        API->>API: Extract user ID from token
        API->>DB: Find user by ID
        DB-->>API: User document
        API->>API: Check user permissions
        API-->>F: 200 OK<br/>{data}
    end
```

## Password Change Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Server
    participant DB as Database
    
    U->>F: Enter current & new password
    F->>F: Validate form
    F->>API: PUT /user/change-password<br/>{currentPassword, newPassword}<br/>Authorization: Bearer <token>
    API->>API: Verify token
    API->>API: Extract user ID
    API->>DB: Find user by ID
    DB-->>API: User document
    API->>API: Compare current password
    alt Current password matches
        API->>API: Hash new password
        API->>DB: Update user password
        DB-->>API: Password updated
        API-->>F: 200 OK<br/>{message: "Password updated"}
        F-->>U: Show success message
    else Current password incorrect
        API-->>F: 400 Bad Request<br/>{error: "Current password incorrect"}
        F-->>U: Show error message
    end
```
