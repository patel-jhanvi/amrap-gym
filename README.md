<h1 align="center">🏋️‍♀️ AMRAP Gym Management System</h1>

<p align="center">
  A full-stack gym membership & capacity management platform built with clean architecture.<br/>
  React + Node.js + TypeScript + PostgreSQL + Prisma
</p>

<br/>

<p align="center">
  <!-- Tech Badges -->
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

<br/>

<section>
  <h2>📌 Overview</h2>
  <p>
    AMRAP Gym Management System is a complete full-stack application for managing:
  </p>

  <ul>
    <li>Gym capacity limits</li>
    <li>User → Gym memberships</li>
    <li>Multiple memberships per user</li>
    <li>Prevent joining full gyms</li>
    <li>Sorted gym and user views</li>
    <li>Clean backend architecture (controllers → services → repositories)</li>
    <li>Service-based frontend architecture (React + TypeScript)</li>
  </ul>
</section>

<br/>

<section>
  <h2>🔗 Related Repositories</h2>
  <p>
    <strong>Backend:</strong>
    <a href="https://github.com/patel-jhanvi/amrap-gym-api">amrap-gym-api</a><br/>
    <strong>Frontend:</strong> This repository
  </p>
</section>

<br/>

<section>
  <h2>⚙️ Backend Architecture</h2>
  <p>Built using clean layered architecture:</p>


controllers/
services/
repositories/
routes/
prisma/
server.ts
</section> <br/> <section> <h2>🖥️ Frontend Architecture</h2>
src/
├── components/
├── pages/
│   ├── users/
│   ├── gyms/
│   └── memberships/ (removed later in redesign)
├── router/
├── services/  (API abstraction layer)
└── index.tsx

</section> <br/> <section> <h2> Core Features</h2> <ul> <li>User CRUD</li> <li>Gym CRUD</li> <li>Add / Remove memberships</li> <li>Gym capacity logic (maxCapacity)</li> <li>Show spots left per gym</li> <li>Sort gyms by available spots</li> <li>Sort members by join date (newest first)</li> <li>Prevent joining full gyms</li> <li>Detailed gym member view</li> <li>Clean modals for editing and management</li> </ul> </section> <br/> <section> <h2> Business Logic</h2> <ul> <li>Users cannot join a gym where <code>spotsLeft = 0</code></li> <li>Users may belong to multiple gyms</li> <li>Gyms must show real-time spots left = <code>maxCapacity - currentMembers</code></li> <li>Members sorted by join date descending</li> <li>Gyms sorted by most available spots</li> </ul> </section> <br/> <section> <h2>🔌 API Summary</h2>
GET     /users
POST    /users
PUT     /users/:id
DELETE  /users/:id

GET     /gyms
POST    /gyms
PUT     /gyms/:id
DELETE  /gyms/:id

POST    /memberships
DELETE  /memberships

GET     /users/:id/gyms
GET     /gyms/:id/users

</section> <br/> <section> <h2>UI Preview</h2> <p> Clean dark UI using TailwindCSS + React.</p> <!-- Screenshots can be added like below --> <!-- <img src="/screenshots/dashboard.png" width="800"/> --> </section> <br/> <section> <h2>Installation</h2> <h3>Backend</h3>
cd amrap-gym-api
npm install
npx prisma migrate dev
npm run dev

<h3>Frontend</h3>
cd amrap-gym-ui
npm install
npm run dev

</section> <br/> <section> <h2> Skills Demonstrated</h2> <ul> <li>Clean Architecture</li> <li>Full-stack TypeScript development</li> <li>PostgreSQL & Prisma ORM modeling</li> <li>React service abstraction (API layer)</li> <li>State management using hooks</li> <li>Building real business rules (capacity logic)</li> <li>Component-based reusable UI</li> </ul> </section> <br/> <section> <h2>👩‍💻 Author</h2> <p> <strong>Jhanvi Patel</strong><br/> Full-Stack Developer<br/> <a href="https://github.com/patel-jhanvi">GitHub Profile</a> </p> </section> ```
