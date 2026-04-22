# CampusNest — System Diagrams

## 1. System Flowchart (Generalized Architecture)

```mermaid
flowchart LR
    A[User Access] --> B{Authenticated?}
    B -->|No| C[Login/JWT Auth]
    B -->|Yes| D[Dashboard]
    C --> D
    D --> E[PG Discovery<br/>Search/Map/Virtual Tour]
    D --> F[Food System<br/>Mess/Restaurants]
    D --> G[Safety<br/>Emergency/Reports]
    E --> H[Booking Request]
    H --> I{Network?}
    I -->|Online| J[API → Database]
    I -->|Offline| K[Service Worker<br/>Background Sync]
    J --> L[Notification]
    K --> M{Online?}
    M -->|Yes| J
```

## 2. Sequence Diagram (Generalized System Interaction)

```mermaid
sequenceDiagram
    participant User
    participant PWA as React PWA
    participant Cache as Cache Layer
    participant API as Flask API
    participant DB as Database
    
    User->>PWA: Access/Action
    PWA->>Cache: Check cache
    
    alt Cache Hit
        Cache-->>PWA: Return data
    else Cache Miss
        Cache->>API: Request + JWT
        API->>DB: Query
        DB-->>API: Results
        API-->>Cache: Response
        Cache->>Cache: Store (5-10min)
    end
    
    PWA-->>User: Display
    
    User->>PWA: Submit data
    
    alt Online
        PWA->>API: POST + JWT
        API->>DB: Update
        DB-->>API: Success
        API-->>PWA: Confirmation
        PWA-->>User: Notification
    else Offline
        PWA->>Cache: Queue sync
        PWA-->>User: "Will sync"
        Note over Cache,API: Network restored
        Cache->>API: Sync queue
        API->>DB: Update
        PWA-->>User: "Synced!"
    end
```

## 3. Component Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[App.jsx<br/>Main Router] --> B[Header<br/>Navigation]
        A --> C[Pages]
        A --> D[Components]
        
        C --> C1[Home]
        C --> C2[PG Listings]
        C --> C3[PG Detail]
        C --> C4[Mess & Food]
        C --> C5[Safety]
        C --> C6[Profile]
        
        D --> D1[Virtual Tour]
        D --> D2[Interactive Map]
        D --> D3[Advanced Search]
        D --> D4[PWA Components]
    end
    
    subgraph "State Management"
        E[Context API<br/>Global State] --> E1[Theme]
        E --> E2[User]
        E --> E3[Filters]
        F[React Query<br/>Server State] --> F1[PG Data]
        F --> F2[User Profile]
        F --> F3[Bookings]
    end
    
    subgraph "Backend Layer"
        G[Flask App] --> H[Routes]
        H --> H1[Auth Routes]
        H --> H2[PG Routes]
        H --> H3[User Routes]
        G --> I[Middleware]
        I --> I1[JWT Auth]
        I --> I2[CORS]
    end
    
    subgraph "Data Layer"
        J[SQLAlchemy ORM] --> K[Database]
        K --> K1[Users Table]
        K --> K2[PG Listings]
        K --> K3[Colleges]
        K --> K4[Bookings]
    end
    
    A --> E
    A --> F
    F --> G
    G --> J
```

---

## Diagram Usage Instructions

These diagrams are written in **Mermaid** syntax and can be rendered in:
- **GitHub** (native support in markdown)
- **VS Code** with Mermaid Preview extension
- Online tools: https://mermaid.live/
- Documentation platforms: GitBook, Docusaurus, MkDocs

To view these diagrams:
1. Push this file to GitHub and view it there
2. Install "Markdown Preview Mermaid Support" VS Code extension
3. Copy-paste into mermaid.live for interactive editing
