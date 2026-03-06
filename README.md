# CollabCodeX - Secure Real-Time Collaborative Cloud IDE

Browser-based collaborative code editor with:
- Draft → Push → Accept workflow
- Isolated Docker sandbox execution
- Real-time chat & collaboration
- Zero user installation

## Tech Stack
- Frontend: Vite + React 19 + Redux Toolkit + Monaco Editor
- Backend: Node.js + Express + Mongoose + Socket.io + Dockerode
- Database: MongoDB
- Queue: Redis + BullMQ

## Setup (Development)

1. Clone repo
2. cd backend && npm install
3. cd ../frontend && npm install
4. Create .env in backend with:
   MONGO_URI=mongodb://admin:adminpassword@mongo:27017/collabcodex?authSource=admin
   REDIS_URL=redis://redis:6379
   JWT_SECRET=super-secret-key-please-change
   PORT=5000
5. docker-compose up -d
6. In two terminals:
   - cd backend && npm run dev
   - cd frontend && npm run dev

Frontend → http://localhost:5173  
Backend API → http://localhost:5000  
Socket → ws://localhost:5000

## Features Implemented (so far / planned)
- [ ] Auth
- [ ] Project CRUD
- [ ] Draft + Push + Accept
- [ ] Real-time editing
- [ ] Chat
- [ ] Docker execution
- [ ] RBAC

Enjoy building!

<div class="relative h-screen">
  <!-- Background Pattern -->
  <div class="absolute inset-0">
    <div class="relative h-full w-full [&>div]:absolute [&>div]:bottom-0 [&>div]:right-0 [&>div]:z-[-2] [&>div]:h-full [&>div]:w-full [&>div]:bg-gradient-to-b [&>div]:from-blue-200 [&>div]:to-white">
    <div></div>
    
  </div>
  </div>
  
  <!-- Hero Content -->
  <div class="relative z-10 flex h-full flex-col items-center justify-center px-4">
    <div class="max-w-3xl text-center">
      <h1 class="mb-8 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-slate-900">
        Your Next Great
        <span class="text-sky-900">Project</span>
      </h1>
      <p class="mx-auto mb-8 max-w-2xl text-lg text-slate-700">
        Build modern and beautiful websites with this collection of stunning background patterns. 
        Perfect for landing pages, apps, and dashboards.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <button class="rounded-lg px-6 py-3 font-medium bg-sky-900 text-white hover:bg-sky-800">
          Get Started
        </button>
        <button class="rounded-lg border px-6 py-3 font-medium border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
          Learn More
        </button>
      </div>
    </div>
  </div>
</div>