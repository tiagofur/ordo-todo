---
description: Setup and verify the backend implementation
---

# Setup Backend

I have implemented the backend core features including Workspaces, Projects, Tasks, Users, and Tags, following the Clean Architecture pattern and the Technical Design Document.

To finalize the setup, please follow these steps:

1.  **Configure Database**:
    Ensure you have a PostgreSQL database running.
    Create a `.env` file in `packages/db` with your database connection string:
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/ordo_todo?schema=public"
    ```

2.  **Push Schema**:
    Run the following command to sync the schema with your database:
    ```bash
    cd packages/db
    npx prisma db push
    ```

3.  **Verify Implementation**:
    You can run the tests (if any) or start the application to verify the backend is working.
    ```bash
    npm run dev
    ```

The following modules have been implemented:
- **Core**: Entities, Repositories, UseCases for Workspace, Project, Tag.
- **Infrastructure**: Prisma Repositories for User, Task, Workspace, Project, Tag.
- **API**: tRPC Routers for User, Task, Workspace, Project, Tag.
