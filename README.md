# CourierSync Next Frontend

Standard Next.js App Router layout (one `package.json`, one `src/`).

```text
couriersync-next-frontend/
  package.json
  src/
    app/
    components/
    lib/
    shared/          # enums & shared types
  public/
```

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

App: http://localhost:3000  
API: `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`

Import shared enums with `import { Role } from '@/shared'`.

Start `couriersync-nest-backend` separately before login.
