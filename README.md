# amrap-gym
AMRAP Gym Management System (Full-Stack)
AMRAP Gym Management System

A full-stack gym membership + capacity management system following clean architecture.

<project>
  <name>AMRAP Gym Management System</name>
  <description>Full-stack system for managing gyms, users, memberships, and real business rules.</description>
</project>

Overview
<overview>
  A complete React + Node.js + PostgreSQL project implementing:
  - Gym capacity rules
  - User → Gym memberships
  - Multiple gym memberships per user
  - Prevent joining full gyms
  - Sorted gym and user views
  - Clean Architecture on backend
  - Service-based architecture on frontend
</overview>

Tech Stack
<techstack>
  <frontend>React, TypeScript, TailwindCSS</frontend>
  <backend>Node.js, Express, TypeScript</backend>
  <database>PostgreSQL + Prisma ORM</database>
  <tools>Postman, Git, GitHub</tools>
</techstack>

Core Features
<features>

  <users>
    <create />
    <edit />
    <viewProfile />
    <multipleGymMemberships />
  </users>

  <gyms>
    <capacityLimit />
    <spotsLeftCalculation />
    <sortingByAvailability />
    <viewMembers />
  </gyms>

  <memberships>
    <addMembership />
    <removeMembership />
    <validateCapacity />
    <preventDuplicateMembership />
  </memberships>

</features>

Business Rules
<businessRules>

  <rule name="GymCapacity">
    Users cannot join a gym if spotsLeft = 0.
  </rule>

  <rule name="MultipleMemberships">
    Users may join more than one gym.
  </rule>

  <rule name="SortedGyms">
    Gyms displayed by most available spots first.
  </rule>

  <rule name="SortedMembers">
    Users displayed by newest join date first.
  </rule>

</businessRules>

API Summary
<api>

  <users>
    GET  /users
    POST /users
    PUT  /users/:id
    GET  /users/:id/gyms
  </users>

  <gyms>
    GET    /gyms
    POST   /gyms
    PUT    /gyms/:id
    DELETE /gyms/:id
    GET    /gyms/:id/users
  </gyms>

  <memberships>
    POST   /memberships
    DELETE /memberships
  </memberships>

</api>

Frontend Structure
<frontend>
  <pages>
    users/
    gyms/
    memberships/
  </pages>
  <components>
    ManageMembershipModal
    EditUserModal
    CreateGymModal
  </components>
  <services>
    userService
    gymService
    membershipService
  </services>
</frontend>

Backend Structure
<backend>
  <controllers />
  <services />
  <repositories />
  <routes />
  <prisma />
</backend>

Installation
<setup>

  <backend>
    cd backend
    npm install
    npx prisma migrate dev
    npm run dev
  </backend>

  <frontend>
    cd amrap-gym-ui
    npm install
    npm run dev
  </frontend>

</setup>

Skills Demonstrated
<skills>
  <cleanArchitecture />
  <fullstackIntegration />
  <validationAndBusinessLogic />
  <reactComponentArchitecture />
  <typescriptEverywhere />
  <apiDesign />
</skills>

Author
<author>
  <name>Jhanvi Patel</name>
  <role>Full-Stack Developer</role>
  <github>github.com/patel-jhanvi</github>
</author>
