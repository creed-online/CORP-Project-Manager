# CORP — Project Manager

> A secure, role-based REST API for collaborative project and task management.

**CORP Project Manager** is a backend API designed to help teams organize projects, manage tasks and subtasks, collaborate with team members, maintain project notes, and securely manage user accounts.

The system is built around **role-based access control**, secure authentication, structured project management, and a clearly defined REST API.

---

## ✨ Features

### 🔐 Authentication & Authorization

* User registration with email verification
* JWT-based authentication
* Access-token refresh mechanism
* Secure logout
* Password change
* Forgot-password and password-reset workflows
* Email verification and re-verification
* Role-based authorization middleware

### 📁 Project Management

* Create and manage projects
* View projects accessible to the current user
* View project details
* Manage project members
* Assign and update member roles
* Admin-controlled project updates and deletion

### ✅ Task Management

* Create and assign tasks to team members
* Update task information and status
* Delete tasks
* Track task progress
* Support for multiple file attachments
* Three-state task workflow:

```text
TODO → IN PROGRESS → DONE
```

### 🔗 Subtask Management

Tasks can be broken down into smaller subtasks to provide more granular progress tracking.

* Create subtasks
* Update subtask information
* Update completion status
* Delete subtasks based on permissions
* Allow team members to mark assigned subtasks as complete

### 📝 Project Notes

Projects can maintain structured notes for storing important project information.

* Create notes
* View notes
* Update notes
* Delete notes
* Role-based access to note management

### 👥 Team & Role Management

CORP uses a three-level permission model:

| Role              | Access                                                              |
| ----------------- | ------------------------------------------------------------------- |
| **Admin**         | Full system access                                                  |
| **Project Admin** | Project-level task and content management                           |
| **Member**        | Access project information and update permitted task/subtask status |

This ensures that users only perform operations permitted by their role.

### 📎 File Management

Tasks support multiple file attachments with metadata including:

* File URL
* MIME type
* File size
* Secure upload handling

### ❤️ System Health

A dedicated health-check endpoint is included for monitoring API availability.

---

# 🏗️ Architecture

At a high level, CORP follows a RESTful backend architecture:

```text
                    ┌─────────────────────┐
                    │      Client         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     REST API        │
                    │   Express.js        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Authentication      Projects         Tasks
              │                │                │
              ▼                ▼                ▼
        Authorization      Members          Subtasks
              │                                 │
              └───────────────┬─────────────────┘
                              ▼
                       ┌─────────────┐
                       │  MongoDB    │
                       └─────────────┘
```

The API separates authentication, project management, task management, subtasks, notes, and system health into dedicated route groups.

---

# 🧩 API Structure

All API endpoints are organized under:

```text
/api/v1/
```

### Authentication

```text
/api/v1/auth/
```

| Method | Endpoint                           | Purpose                   |
| ------ | ---------------------------------- | ------------------------- |
| POST   | `/register`                        | Register a user           |
| POST   | `/login`                           | Authenticate a user       |
| POST   | `/logout`                          | Logout                    |
| GET    | `/current-user`                    | Get current user          |
| POST   | `/change-password`                 | Change password           |
| POST   | `/refresh-token`                   | Refresh access token      |
| GET    | `/verify-email/:verificationToken` | Verify email              |
| POST   | `/forgot-password`                 | Request password reset    |
| POST   | `/reset-password/:resetToken`      | Reset password            |
| POST   | `/resend-email-verification`       | Resend verification email |

### Projects

```text
/api/v1/projects/
```

Supports project creation, listing, details, updates, deletion, and team-member management.

### Tasks

```text
/api/v1/tasks/
```

Supports task creation, assignment, updates, deletion, status tracking, and subtasks.

### Notes

```text
/api/v1/notes/
```

Provides project-level note management.

### Health Check

```text
/api/v1/healthcheck/
```

Used to verify API availability and system status.

---

# 🔒 Security

Security was treated as a core part of the system rather than an afterthought.

CORP implements:

* JWT authentication
* Refresh-token mechanism
* Role-based authorization
* Input validation
* Email verification
* Secure password-reset workflow
* Secure file-upload handling
* CORS configuration
* Role-based route protection

Authorization is enforced at the API layer so that permissions are applied consistently across projects, tasks, subtasks, members, and notes.

---

# 🛠️ Tech Stack

| Technology     | Purpose                     |
| -------------- | --------------------------- |
| **Node.js**    | Backend runtime             |
| **Express.js** | REST API framework          |
| **MongoDB**    | Database                    |
| **Mongoose**   | MongoDB data modeling       |
| **JWT**        | Authentication              |
| **bcrypt**     | Password security           |
| **Multer**     | File upload handling        |
| **Nodemailer** | Email workflows             |
| **REST API**   | Client-server communication |

---

# 📂 Core Modules

```text
CORP
│
├── Authentication
│   ├── Registration
│   ├── Login
│   ├── Email Verification
│   ├── Password Reset
│   └── Token Management
│
├── Projects
│   ├── Project CRUD
│   └── Member Management
│
├── Tasks
│   ├── Task CRUD
│   ├── Assignment
│   ├── Status Tracking
│   └── File Attachments
│
├── Subtasks
│   ├── Creation
│   ├── Updates
│   └── Completion Tracking
│
├── Notes
│   └── Project Notes
│
└── Health Check
```

---

# 🔑 Permission Model

The API uses three primary roles.

### Admin

Has full system-level access.

Can:

* Create projects
* Update/delete projects
* Manage project members
* Manage tasks
* Manage subtasks
* Manage project notes

### Project Admin

Has administrative access within assigned projects.

Can:

* View projects
* Create/update/delete tasks
* Create/delete subtasks
* View project notes
* Update permitted task/subtask information

### Member

Has standard project access.

Can:

* View accessible projects
* View tasks
* View project information
* Update permitted subtask completion status

This permission model is defined explicitly in the project's PRD and is enforced through role-based middleware.

---

# 🚀 Getting Started

## Prerequisites

Before running the project, make sure you have:

* Node.js installed
* MongoDB available
* Git installed

## Clone the Repository

```bash
git clone https://github.com/creed-online/CORP-Project-Manager.git

cd CORP-Project-Manager
```

## Install Dependencies

```bash
npm install
```

## Environment Configuration

Create an environment configuration file containing the credentials and configuration values required by the application.

Typical configuration areas include:

```env
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
```

> Use the variable names expected by the application's configuration files. Never commit real credentials, tokens, database passwords, or email credentials to GitHub.

## Run the Application

Use the npm scripts defined in `package.json` to start the development or production server.

---

# 📡 Example API Flow

A typical user workflow can look like:

```text
1. Register
      ↓
2. Verify Email
      ↓
3. Login
      ↓
4. Receive JWT
      ↓
5. Create / Access Project
      ↓
6. Add Team Members
      ↓
7. Create Tasks
      ↓
8. Assign Tasks
      ↓
9. Create Subtasks
      ↓
10. Track Progress
```

This workflow allows CORP to support the complete lifecycle of a collaborative project.

---

# 🧠 Engineering Focus

One of the main goals of CORP was to move beyond basic CRUD implementation and focus on how a real backend system should be structured.

The project involved designing:

* A defined API surface
* Authentication and authorization flows
* A three-tier permission model
* Project → Task → Subtask relationships
* Secure file handling
* Email-based account workflows
* Input validation and security controls
* Clear success criteria based on a written PRD

The system's success criteria include secure authentication, complete project lifecycle management, hierarchical task organization, role-based access control, file attachments, and email workflows.

---

# 📚 What I Learned

Building CORP strengthened my understanding of backend engineering in several areas:

### Backend Architecture

Learned how to structure a larger REST API around multiple independent modules instead of treating the application as a collection of unrelated endpoints.

### Authentication

Implemented the concepts behind JWT authentication, refresh tokens, email verification, password resets, and protected routes.

### Authorization

Learned that authentication answers **"Who are you?"**, while authorization answers **"What are you allowed to do?"**

CORP uses middleware and role-based permissions to enforce the second part.

### API Design

Worked with a structured endpoint hierarchy and designed APIs around resources such as projects, tasks, subtasks, members, and notes.

### Security

Developed a stronger understanding of input validation, CORS, protected routes, secure password handling, and file-upload security.

### Product Thinking

The project was developed from a written PRD, which helped me think about:

**Requirements → Data Models → Permissions → API Design → Security → Success Criteria**

rather than simply starting with code.

---

# 📌 Project Status

**Version:** `1.0.0`

**Type:** Backend REST API

The current implementation focuses on the backend foundation and core project-management capabilities defined in the PRD.

---

# 🔮 Future Improvements

Potential areas for future development include:

* Frontend dashboard
* Advanced project analytics
* Search and filtering
* Pagination for large datasets
* Activity/audit logs
* Real-time notifications
* Automated API documentation
* Automated testing and CI/CD
* Expanded file-storage architecture

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

For larger changes, open an issue first to discuss the proposed improvement.

---

# 📄 License

Add the project's applicable license here.

If no license has been selected yet, the repository remains subject to the default copyright protections applicable to its contents.

---

# 👨‍💻 Author

**Varun Kumar Saxena**

Computer Science Engineering Student
Backend & Full-Stack Developer

GitHub:
https://github.com/creed-online

Project Repository:
https://github.com/creed-online/CORP-Project-Manager

---

⭐ If you found CORP useful or interesting, consider giving the repository a star.
