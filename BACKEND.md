# ⚙️ Backend Architecture & Logic

CityCare uses a modular service-oriented architecture. While currently running on a robust mock system for rapid prototyping, it is designed to be easily migrated to a production database like Supabase.

### 🗄️ Data Persistence (Mock DB)
- **LocalStorage Engine**: The system uses a custom wrapper around `window.localStorage` to persist data across browser sessions.
- **Initial Seeding**: On first load, the system automatically seeds the database with demo administrators, field workers, and sample city issues to provide an immediate "live" experience.
- **Relational Simulation**: The mock DB maintains relationships between `Users`, `Issues`, `Comments`, and `Notifications` using unique ID mapping.

### 🛠️ Service Layer
The business logic is decoupled into specialized services:
- **Issue Service**: Handles the lifecycle of a report (Creation -> Assignment -> Completion -> Resolution). It includes logic for upvoting (which affects priority) and duplicate detection.
- **Notification Service**: A real-time messaging system that alerts citizens when their reports are updated or resolved.
- **Analytics Service**: Aggregates raw issue data into meaningful metrics for the Admin Dashboard, calculating resolution velocity and category distribution.
- **Escalation Service**: A background-style worker that monitors "Pending" issues and automatically upgrades their priority if they remain unaddressed for too long.

### 🤖 CityCare AI Engine
The AI doesn't just "chat"; it performs structured data extraction:
- **Intent Detection**: Recognizes if a user is greeting, asking for help, or reporting a problem.
- **Category Classification**: Uses a weighted pattern-matching algorithm to assign issues to departments (Water, Electricity, Road, etc.) based on keywords.
- **Priority Scoring**: Automatically flags issues as "High" if keywords indicating danger or emergency are detected.
- **Contextual Memory**: Tracks the conversation state to know when to ask for a location versus when to ask for a photo.

### 🗺️ Geocoding Integration
The backend integrates with the **Nominatim API (OpenStreetMap)** to provide:
- **Forward Geocoding**: Translating user-typed locations (e.g., "near the park") into precise GPS coordinates.
- **Reverse Geocoding**: Translating map pins into human-readable addresses for the official report records.