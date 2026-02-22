# CampusCore API

Enterprise Training Backend for API Automation

## Overview

CampusCore API is a Node.js + Express based training backend designed for API automation learning. It simulates a real-world course enrollment system and enables learners to practice:

- Payload-based authentication
- Bearer token extraction and reuse
- Request chaining
- CRUD operations
- State validation
- Business rule enforcement
- Query parameters and pagination

## Quick Start

### Using Scripts

**Windows:**
```bash
installAndStartServer.bat
```

**Linux/Mac:**
```bash
chmod +x installAndStartServer.sh
./installAndStartServer.sh
```

### Manual Installation

```bash
npm install
npm start
```

---

## Building Standalone Executables

Build self-contained executables that don't require Node.js to be installed.

### Using Build Scripts

**Windows:**
```bash
build.bat
```

**Linux/Mac:**
```bash
chmod +x build.sh
./build.sh
```

### Build Output

The build creates a `build/CampusCore API/` folder with separate platform folders:

```
CampusCore API/
├── campuscore-win/
│   ├── campuscore-win.exe
│   ├── .env
│   └── app_data/
├── campuscore-linux/
│   ├── campuscore-linux
│   ├── .env
│   └── app_data/
└── campuscore-macos/
    ├── campuscore-macos
    ├── .env
    └── app_data/
```

### Running the Executable

1. Navigate to the appropriate platform folder (e.g., `campuscore-win/`)
2. Configure the `.env` file as needed
3. Run the executable:
   - **Windows:** `campuscore-win.exe`
   - **Linux:** `./campuscore-linux`
   - **macOS:** `./campuscore-macos`

Each platform folder is self-contained and can be distributed independently.

---

## Configuration

Create a `.env` file in the project root (or copy from `.env.example`):

```env
PORT=3000

# Authentication credentials
VALID_API_KEY=TRAINING-12345
VALID_USERNAME=trainer
VALID_PASSWORD=password123
```

## Base URL

```
http://localhost:3000/api/v1
```

## Data Storage

Data is persisted in the `app_data/` folder:
- `app_data/students/s_<id>/` - Student data and API keys
- `app_data/courses/c_<id>/` - Course data
- `app_data/enrollments.json` - Enrollment records
- `app_data/tokens.json` - Active authentication tokens

---

# API Reference

## Health Check

### GET /api/v1/health

Check if the server is running. No authentication required.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

# Authentication

All functional APIs require a valid Bearer token. Obtain a token using one of the login methods below.

**Header format for protected endpoints:**
```
Authorization: Bearer <accessToken>
```

**Unauthorized response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

## 1. API Key Login

### POST /api/v1/auth/login/apikey

Authenticate using an API key.

**Request Body:**
```json
{
  "apiKey": "TRAINING-12345"
}
```

**Success Response (200):**
```json
{
  "accessToken": "BEARER-APIKEY-ABC12345",
  "method": "API_KEY",
  "expiresIn": 3600
}
```

**Error Response (401):**
```json
{
  "error": "Invalid API key"
}
```

---

## 2. Username/Password Login

### POST /api/v1/auth/login

Authenticate using username and password.

**Request Body:**
```json
{
  "username": "trainer",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "accessToken": "BEARER-USER-XYZ45678",
  "method": "CREDENTIALS",
  "expiresIn": 3600
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

# Student APIs

All student endpoints require Bearer token authentication.

---

## Create Student

### POST /api/v1/students

Create a new student. An API key is automatically generated and stored.

**Request Body:**
```json
{
  "name": "Rahul",
  "email": "rahul@test.com"
}
```

**Success Response (201):**
```json
{
  "studentId": "S1001",
  "status": "ACTIVE"
}
```

**Validation Rules:**
- `name` and `email` are required
- Email must be unique across all students

**Error Response (400):**
```json
{
  "error": "Email already exists"
}
```

---

## Get Student

### GET /api/v1/students/{studentId}

Retrieve a student's details including their enrollments.

**Success Response (200):**
```json
{
  "studentId": "S1001",
  "name": "Rahul",
  "email": "rahul@test.com",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "enrollments": [
    {
      "enrollmentId": "E3001",
      "courseId": "C2001",
      "status": "CONFIRMED"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Student not found"
}
```

---

## List Students

### GET /api/v1/students

List all students with optional filtering and pagination.

**Query Parameters:**
| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| status    | string | Filter by status (e.g., ACTIVE)|
| page      | number | Page number (default: 1)       |
| limit     | number | Items per page (default: 10)   |

**Example:** `GET /api/v1/students?status=ACTIVE&page=1&limit=5`

**Success Response (200):**
```json
{
  "page": 1,
  "limit": 5,
  "total": 12,
  "data": [
    {
      "studentId": "S1001",
      "name": "Rahul",
      "email": "rahul@test.com",
      "status": "ACTIVE"
    }
  ]
}
```

---

## Update Student

### PUT /api/v1/students/{studentId}

Update student details.

**Request Body:**
```json
{
  "name": "Rahul Sharma"
}
```

**Allowed Fields:** `name`, `email`, `status`

**Success Response (200):**
```json
{
  "studentId": "S1001",
  "updated": true
}
```

---

## Delete Student

### DELETE /api/v1/students/{studentId}

Delete a student.

**Success Response (200):**
```json
{
  "studentId": "S1001",
  "deleted": true
}
```

**Business Rule:** Cannot delete a student enrolled in an active course.

**Error Response (400):**
```json
{
  "error": "Cannot delete student with active course enrollments"
}
```

---

# Course APIs

All course endpoints require Bearer token authentication.

---

## Create Course

### POST /api/v1/courses

Create a new course.

**Request Body:**
```json
{
  "title": "API Automation",
  "capacity": 2
}
```

**Success Response (201):**
```json
{
  "courseId": "C2001",
  "status": "OPEN",
  "enrolledCount": 0
}
```

**Validation Rules:**
- `title` and `capacity` are required
- `capacity` must be a positive number

---

## Get Course Details

### GET /api/v1/courses/{courseId}

Retrieve course details including derived fields.

**Success Response (200):**
```json
{
  "courseId": "C2001",
  "title": "API Automation",
  "capacity": 2,
  "enrolledCount": 1,
  "availableSeats": 1,
  "status": "OPEN",
  "created_date": "2024-01-15T10:30:00.000Z"
}
```

**Derived Field:** `availableSeats = capacity - enrolledCount`

---

## List Courses

### GET /api/v1/courses

List all courses with optional filtering and pagination.

**Query Parameters:**
| Parameter | Type   | Description                  |
|-----------|--------|------------------------------|
| status    | string | Filter by status (e.g., OPEN)|
| page      | number | Page number (default: 1)     |
| limit     | number | Items per page (default: 10) |

**Example:** `GET /api/v1/courses?page=1&limit=5`

**Success Response (200):**
```json
{
  "page": 1,
  "limit": 5,
  "total": 12,
  "data": [
    {
      "courseId": "C2001",
      "title": "API Automation",
      "capacity": 2,
      "enrolledCount": 1,
      "availableSeats": 1,
      "status": "OPEN"
    }
  ]
}
```

---

## Update Course

### PUT /api/v1/courses/{courseId}

Update course details.

**Request Body:**
```json
{
  "title": "Advanced API Automation",
  "capacity": 5
}
```

**Allowed Fields:** `title`, `capacity`, `status`

**Business Rule:** Capacity cannot be less than current `enrolledCount`.

**Error Response (400):**
```json
{
  "error": "Capacity cannot be less than current enrolled count"
}
```

---

## Delete Course

### DELETE /api/v1/courses/{courseId}

Delete a course.

**Success Response (200):**
```json
{
  "courseId": "C2001",
  "deleted": true
}
```

**Business Rule:** Cannot delete a course with enrolled students.

**Error Response (400):**
```json
{
  "error": "Cannot delete course with enrolled students"
}
```

---

# Enrollment APIs

All enrollment endpoints require Bearer token authentication.

---

## Enroll Student

### POST /api/v1/enrollments

Enroll a student in a course.

**Request Body:**
```json
{
  "studentId": "S1001",
  "courseId": "C2001"
}
```

**Success Response (201):**
```json
{
  "enrollmentId": "E3001",
  "status": "CONFIRMED"
}
```

**Business Rules:**
- Course must have status `OPEN`
- Course must have available seats (`enrolledCount < capacity`)
- Student cannot enroll twice in the same course

**Error Responses (400):**
```json
{
  "error": "Course is not open for enrollment"
}
```
```json
{
  "error": "Course is at full capacity"
}
```
```json
{
  "error": "Student is already enrolled in this course"
}
```

---

## Get Enrollment

### GET /api/v1/enrollments/{enrollmentId}

Retrieve enrollment details.

**Success Response (200):**
```json
{
  "enrollmentId": "E3001",
  "studentId": "S1001",
  "courseId": "C2001",
  "status": "CONFIRMED",
  "enrolledAt": "2024-01-15T10:30:00.000Z"
}
```

---

## List Enrollments

### GET /api/v1/enrollments

List enrollments with optional filtering.

**Query Parameters:**
| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| studentId | string | Filter by student        |
| courseId  | string | Filter by course         |
| status    | string | Filter by status         |

**Success Response (200):**
```json
{
  "total": 5,
  "data": [
    {
      "enrollmentId": "E3001",
      "studentId": "S1001",
      "courseId": "C2001",
      "status": "CONFIRMED",
      "enrolledAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Cancel Enrollment

### PUT /api/v1/enrollments/{enrollmentId}/cancel

Cancel an enrollment. The seat is restored to the course.

**Success Response (200):**
```json
{
  "status": "CANCELLED"
}
```

**Error Response (400):**
```json
{
  "error": "Enrollment is already cancelled"
}
```

---

# Recommended End-to-End Flow

1. Login using API Key or Username/Password
2. Extract Bearer token from response
3. Create Student
4. Create Course
5. Get Course Details (verify initial state)
6. Enroll Student in Course
7. Get Course Details (validate seat reduction)
8. Attempt duplicate enrollment (expect error)
9. Cancel Enrollment
10. Get Course Details (validate seat restoration)
11. Delete Student
12. Delete Course

---

# Error Handling

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
| Code | Description                           |
|------|---------------------------------------|
| 200  | Success                               |
| 201  | Created                               |
| 400  | Bad Request / Validation Error        |
| 401  | Unauthorized (invalid/missing token)  |
| 404  | Resource Not Found                    |
| 500  | Internal Server Error                 |

---

# License

This project is built for automation training purposes.
