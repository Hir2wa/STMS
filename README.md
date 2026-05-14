# 🚌 School Bus Tracking Management System (STMS)

## 🎯 Overview

The **School Bus Tracking Management System (STMS)** is a full-stack web application that enables schools to efficiently manage their transportation operations. The system provides comprehensive tools for tracking buses, managing students, drivers, routes, and schedules, while ensuring secure communication between administrators, drivers, parents, and students.

### Objectives

- ✅ **Improve Safety & Accountability**: Track student pickups, drop-offs, and bus locations
- ✅ **Real-time Monitoring**: Monitor bus status, driver assignments, and student attendance
- ✅ **Efficient Management**: Streamline bus, driver, route, and schedule management
- ✅ **Enhanced Communication**: Facilitate announcements and communication between all stakeholders
- ✅ **Location Management**: Hierarchical location system (Province → District → Sector → Cell → Village)

---

## ✨ Features

### Core Features

- 🔐 **Secure Authentication**
  - JWT-based authentication
  - OAuth2 integration (Google Sign-In)
  - Two-factor authentication (OTP via email)
  - Password reset functionality
  - Role-based access control (RBAC)

- 👥 **User Management**
  - Admin, Driver, Student, and Parent roles
  - User registration and profile management
  - Email-based OTP for password setup

- 🚌 **Bus Management**
  - Register and manage bus fleet
  - Track bus capacity and status
  - Assign drivers to buses
  - Assign routes to buses
  - Bus status tracking (ACTIVE, INACTIVE, UNDERMAINTAINANCE)

- 👨‍✈️ **Driver Management**
  - Driver registration and profiles
  - License number tracking
  - Experience tracking
  - Driver-bus assignment
  - Driver-specific dashboard

- 🎓 **Student Management**
  - Student registration with location hierarchy
  - Class management
  - Pickup and drop-off point tracking
  - Student-bus assignment
  - Student status tracking (ONBUS, DROPPEDOFF, ABSENT)
  - Location-based filtering

- 🗺️ **Route Management**
  - Route creation and management
  - Start and end point tracking
  - Distance calculation
  - Location assignment to routes

- 📅 **Schedule Management**
  - Create and manage bus schedules
  - Day-of-week scheduling
  - Time-based scheduling

- 📍 **Location Management**
  - Hierarchical location system
  - Province, District, Sector, Cell, and Village management
  - Location-based student filtering

- 📢 **Announcements**
  - Create and manage announcements
  - Role-based targeting (ALL, DRIVER, STUDENT)
  - Specific user targeting
  - Reply functionality
  - Priority levels (LOW, NORMAL, HIGH, URGENT)

- 🔍 **Global Search**
  - Search across all entities (students, buses, drivers, routes, announcements)
  - Click-to-navigate functionality
  - Auto-filtering on target pages
  - Real-time search results

- 📊 **Dashboard**
  - Admin dashboard with statistics
  - Driver-specific dashboard
  - Student/Parent dashboard
  - Real-time data visualization

---

## 🛠️ Technology Stack

### Backend

| Technology               | Version | Purpose                        |
| ------------------------ | ------- | ------------------------------ |
| **Java**                 | 21      | Core programming language      |
| **Spring Boot**          | 3.5.7   | Backend framework              |
| **Spring Security**      | Latest  | Authentication & authorization |
| **Spring Data JPA**      | Latest  | Database ORM                   |
| **PostgreSQL**           | Latest  | Relational database            |
| **JWT (jjwt)**           | 0.11.5  | Token-based authentication     |
| **Spring OAuth2 Client** | Latest  | OAuth2 integration             |
| **Spring Mail**          | Latest  | Email functionality            |
| **Lombok**               | 1.18.34 | Boilerplate code reduction     |
| **Maven**                | Latest  | Dependency management          |

### Frontend

| Technology           | Version | Purpose                     |
| -------------------- | ------- | --------------------------- |
| **React**            | 19.2.0  | UI framework                |
| **React Router DOM** | 7.10.1  | Client-side routing         |
| **Axios**            | 1.13.2  | HTTP client                 |
| **Tailwind CSS**     | 4.1.18  | Utility-first CSS framework |
| **Lucide React**     | 0.561.0 | Icon library                |
| **React Hot Toast**  | 2.6.0   | Toast notifications         |
| **Vite**             | 7.2.4   | Build tool and dev server   |

---

## 📁 Project Structure

```
SchoolBusTrackingSystem_26420/
│
├── transportManagementSystem/          # Backend (Spring Boot)
│   └── transportManagementSystem/
│       └── transportManagementSystem/
│           ├── src/
│           │   ├── main/
│           │   │   ├── java/
│           │   │   │   └── auca/ac/rw/transportManagementSystem/
│           │   │   │       ├── config/          # Configuration classes
│           │   │   │       │   ├── SecurityConfig.java
│           │   │   │       │   ├── JwtAuthFilter.java
│           │   │   │       │   ├── JwtService.java
│           │   │   │       │   └── MailConfig.java
│           │   │   │       ├── controller/      # REST controllers
│           │   │   │       │   ├── AuthController.java
│           │   │   │       │   ├── BusController.java
│           │   │   │       │   ├── DriverController.java
│           │   │   │       │   ├── StudentController.java
│           │   │   │       │   ├── RouteController.java
│           │   │   │       │   ├── ScheduleController.java
│           │   │   │       │   ├── AnnouncementController.java
│           │   │   │       │   ├── LocationController.java
│           │   │   │       │   └── GlobalSearchController.java
│           │   │   │       ├── model/            # Entity models
│           │   │   │       │   ├── User.java
│           │   │   │       │   ├── Bus.java
│           │   │   │       │   ├── Driver.java
│           │   │   │       │   ├── Student.java
│           │   │   │       │   ├── Route.java
│           │   │   │       │   ├── Schedule.java
│           │   │   │       │   ├── Announcement.java
│           │   │   │       │   └── Location.java
│           │   │   │       ├── repository/       # JPA repositories
│           │   │   │       ├── service/           # Business logic
│           │   │   │       └── dto/               # Data transfer objects
│           │   │   └── resources/
│           │   │       └── application.properties
│           │   └── test/
│           └── pom.xml
│
└── STMSFrontEnd/                       # Frontend (React)
    └── STMSFrontEnd/
        └── stms-frontEnd/
            ├── src/
            │   ├── components/         # Reusable components
            │   │   ├── Header.jsx
            │   │   ├── Sidebar.jsx
            │   │   ├── Layout.jsx
            │   │   ├── GlobalSearch.jsx
            │   │   ├── Pagination.jsx
            │   │   └── Button.jsx
            │   ├── pages/             # Page components
            │   │   ├── admin/         # Admin pages
            │   │   │   ├── DashboardHome.jsx
            │   │   │   ├── Buses.jsx
            │   │   │   ├── Drivers.jsx
            │   │   │   ├── Students.jsx
            │   │   │   ├── RoutesPage.jsx
            │   │   │   ├── Schedules.jsx
            │   │   │   ├── Announcements.jsx
            │   │   │   └── Locations.jsx
            │   │   ├── driver/        # Driver pages
            │   │   │   ├── DriverDashboard.jsx
            │   │   │   ├── DriverStudents.jsx
            │   │   │   ├── DriverSchedule.jsx
            │   │   │   └── DriverAnnouncements.jsx
            │   │   ├── student/       # Student pages
            │   │   │   ├── StudentDashboard.jsx
            │   │   │   └── StudentAnnouncements.jsx
            │   │   └── auth/          # Authentication pages
            │   │       ├── Login.jsx
            │   │       ├── ForgotPassword.jsx
            │   │       ├── SetPassword.jsx
            │   │       └── OAuthCallback.jsx
            │   ├── services/          # API service layer
            │   │   ├── busService.js
            │   │   ├── driverService.js
            │   │   ├── studentService.js
            │   │   ├── routeService.js
            │   │   ├── scheduleService.js
            │   │   ├── announcementService.js
            │   │   ├── locationService.js
            │   │   ├── globalSearchService.js
            │   │   └── userService.js
            │   ├── context/           # React context
            │   │   └── AuthContext.jsx
            │   ├── config/            # Configuration
            │   │   └── axios.js
            │   ├── utils/             # Utility functions
            │   │   ├── api.js
            │   │   └── authHelper.js
            │   ├── App.jsx
            │   └── main.jsx
            ├── package.json
            └── vite.config.js
```

---

## 🚀 Installation

### Prerequisites

- **Java 21** or higher
- **Node.js** 18+ and npm
- **PostgreSQL** 12+ database
- **Maven** 3.6+ (optional, included in project)
- **Git**

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SchoolBusTrackingSystem_26420
   ```

2. **Navigate to backend directory**

   ```bash
   cd transportManagementSystem/transportManagementSystem/transportManagementSystem
   ```

3. **Configure database**
   - Create a PostgreSQL database named `transport_management`
   - Update `src/main/resources/application.properties` with your database credentials:

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/transport_management
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

4. **Configure email (for OTP functionality)**

   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   ```

5. **Configure OAuth2 (optional)**

   ```properties
   spring.security.oauth2.client.registration.google.client-id=your_client_id
   spring.security.oauth2.client.registration.google.client-secret=your_client_secret
   ```

6. **Build and run**

   ```bash
   ./mvnw spring-boot:run
   # Or on Windows:
   mvnw.cmd spring-boot:run
   ```

   The backend will start on `http://localhost:8081`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd ../../../../STMSFrontEnd/STMSFrontEnd/stms-frontEnd
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)
   - Create a `.env` file in the frontend root:

   ```env
   VITE_API_BASE_URL=http://localhost:8081/api
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

---

## ⚙️ Configuration

### Backend Configuration (`application.properties`)

```properties
# Server Configuration
server.port=8081

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/transport_management
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=your-secret-key-change-this-in-production
jwt.expiration=86400000

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# OAuth2 Configuration (Google)
spring.security.oauth2.client.registration.google.client-id=your_client_id
spring.security.oauth2.client.registration.google.client-secret=your_client_secret
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8081/oauth2/callback/google
```

### Frontend Configuration

Create a `.env` file in `STMSFrontEnd/STMSFrontEnd/stms-frontEnd/`:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

---

## 🔐 Authentication & Security

### Authentication Methods

1. **Email/Password Login**
   - Standard username (email) and password authentication
   - JWT token generation upon successful login

2. **OAuth2 (Google Sign-In)**
   - Social authentication via Google
   - Automatic user creation for first-time OAuth users

3. **Two-Factor Authentication (2FA)**
   - OTP sent via email
   - Required for password setup and sensitive operations

### Security Features

- ✅ **JWT Token-based Authentication**: Secure token generation and validation
- ✅ **Password Encryption**: BCrypt password hashing
- ✅ **Role-Based Access Control (RBAC)**: Different permissions for different roles
- ✅ **CORS Configuration**: Secure cross-origin resource sharing
- ✅ **Request Validation**: Input validation and sanitization
- ✅ **Session Management**: Token expiration and refresh handling
- ✅ **Protected Routes**: Frontend route protection based on authentication status

### Token Management

- Tokens are stored in `localStorage` on the frontend
- Automatic token validation on each API request
- Automatic redirect to login on token expiration (401 errors)
- Token cleanup on logout

---

## 📚 API Documentation

### Base URL

```
http://localhost:8081/api
```

### Main Endpoints

| Endpoint             | Method | Description           | Auth Required |
| -------------------- | ------ | --------------------- | ------------- |
| `/auth/login`        | POST   | User login            | No            |
| `/auth/logout`       | POST   | User logout           | Yes           |
| `/buses/all`         | GET    | Get all buses         | Yes           |
| `/buses/save`        | POST   | Create bus            | Yes (Admin)   |
| `/drivers/all`       | GET    | Get all drivers       | Yes           |
| `/drivers/save`      | POST   | Create driver         | Yes (Admin)   |
| `/students/all`      | GET    | Get all students      | Yes           |
| `/students/save`     | POST   | Create student        | Yes (Admin)   |
| `/routes/all`        | GET    | Get all routes        | Yes           |
| `/routes/save`       | POST   | Create route          | Yes (Admin)   |
| `/schedules/all`     | GET    | Get all schedules     | Yes           |
| `/announcements/all` | GET    | Get all announcements | Yes           |
| `/search/global`     | GET    | Global search         | Yes           |
| `/locations/roots`   | GET    | Get provinces         | Yes           |

---

## 📖 Usage Guide

### For Administrators

1. **Login**
   - Navigate to `/login`
   - Enter admin credentials or use Google Sign-In
   - Complete OTP verification if required

2. **Dashboard**
   - View system statistics
   - Monitor active buses, students, drivers, and routes

3. **Manage Buses**
   - Navigate to `/admin/buses`
   - Add new buses with plate numbers and capacity
   - Assign drivers and routes to buses
   - Update bus status

4. **Manage Drivers**
   - Navigate to `/admin/drivers`
   - Register new drivers
   - Assign drivers to buses
   - View driver information

5. **Manage Students**
   - Navigate to `/admin/students`
   - Register students with location hierarchy
   - Assign students to buses
   - Track student status

6. **Manage Routes**
   - Navigate to `/admin/routes`
   - Create routes with start/end points
   - Assign locations to routes

7. **Global Search**
   - Click the search icon in the header
   - Search across all entities
   - Click results to navigate to relevant pages

### For Drivers

1. **Login** with driver credentials
2. **View Dashboard** with assigned bus and students
3. **View Schedule** for assigned routes
4. **View Announcements** from administrators
5. **Manage Students** assigned to their bus

### For Students/Parents

1. **Login** with student/parent credentials
2. **View Dashboard** with bus information
3. **View Announcements** from administrators
4. **Track Bus Status** and schedule

---

### Authentication & Error Handling (Latest)

- ✅ **Fixed 401 Unauthorized Errors**
  - Added token validation before API requests
  - Improved error handling in all service files
  - Automatic redirect to login on authentication failure
  - Better user feedback for authentication issues

- ✅ **Enhanced Global Search**
  - Click-to-navigate functionality
  - Automatic filtering on target pages
  - Improved search result display
  - Better user experience with hover effects

- ✅ **Improved Service Layer**
  - Consistent error handling across all services
  - Token validation in `getAuthHeaders()` function
  - Better error messages for users
  - Automatic session cleanup on token expiration

### Code Quality Improvements

- ✅ Consistent error handling patterns
- ✅ Better separation of concerns
- ✅ Improved code reusability
- ✅ Enhanced user experience

---

## 🏗️ System Modules

| Module                  | Description                        | Key Features                                           |
| ----------------------- | ---------------------------------- | ------------------------------------------------------ |
| **User Module**         | User management and authentication | Admin, Driver, Student, Parent roles; OAuth2; 2FA      |
| **Bus Management**      | Bus fleet management               | Registration, status tracking, driver/route assignment |
| **Driver Management**   | Driver profiles and assignments    | Registration, license tracking, bus assignment         |
| **Student Management**  | Student records and tracking       | Registration, location-based filtering, bus assignment |
| **Route Management**    | Transportation route planning      | Route creation, location assignment, distance tracking |
| **Schedule Management** | Bus schedule management            | Day/time-based scheduling                              |
| **Location Management** | Hierarchical location system       | Province → District → Sector → Cell → Village          |
| **Announcement Module** | Communication system               | Role-based announcements, replies, priorities          |
| **Global Search**       | Cross-entity search                | Search all entities, click-to-navigate                 |

---

## 👥 Roles & Permissions

| Role        | Permissions               | Access Level                                          |
| ----------- | ------------------------- | ----------------------------------------------------- |
| **ADMIN**   | Full system access        | All modules, user management, system configuration    |
| **DRIVER**  | Driver-specific features  | View assigned bus, students, schedule, announcements  |
| **STUDENT** | Student-specific features | View personal info, bus assignment, announcements     |
| **PARENT**  | Parent-specific features  | View child's information, bus tracking, announcements |

---

## 🗄️ Database Schema

### Main Entities

- **User**: Authentication and user profiles
- **Bus**: Bus information and status
- **Driver**: Driver profiles and assignments
- **Student**: Student records and bus assignments
- **Route**: Transportation routes
- **Schedule**: Bus schedules
- **Location**: Hierarchical location system
- **Announcement**: System announcements and replies

### Entity Relationships

- User (One) → Driver (One)
- Bus (One) → Driver (One)
- Bus (One) → Route (Many)
- Student (Many) → Bus (One)
- Student (One) → Location (One)
- Route (Many) → Location (Many)

### ERD Diagram

![ERD Diagram](https://github.com/user-attachments/assets/665426fa-a9da-4bee-ae55-99ff7670bcb7)

---

### Common Issues

1. **401 Unauthorized Errors**
   - **Solution**: Ensure you're logged in and your token is valid
   - Clear browser localStorage and login again
   - Check backend server is running

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `application.properties`
   - Ensure database exists

3. **Email Not Sending (OTP)**
   - Verify email configuration in `application.properties`
   - For Gmail, use App Password instead of regular password
   - Check firewall/network settings

4. **CORS Errors**
   - Verify backend CORS configuration
   - Check frontend API base URL matches backend
   - Ensure both servers are running

---
