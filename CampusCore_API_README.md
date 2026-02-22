# CampusCore API

Enterprise Training Backend for API Automation using ACCELQ

------------------------------------------------------------------------

## Overview

CampusCore API is a structured Node and Express based training backend
designed specifically for API automation learning.

It simulates a real world course enrollment system and enables learners
to practice:

-   Payload based authentication
-   Bearer token extraction and reuse
-   Request chaining
-   CRUD operations
-   State validation
-   Derived field validation
-   Negative scenarios
-   Business rule enforcement
-   Query parameters and pagination

All functional APIs require a valid Bearer token.

------------------------------------------------------------------------

## Base URL

http://localhost:3000/api/v1

------------------------------------------------------------------------

# Authentication

Both authentication mechanisms("API Key Login" and "Username and Password Login") generate a Bearer token.

All subsequent API calls must include:

Authorization: Bearer `<accessToken>`

If the token is missing or invalid, the API returns:

{ "error": "Unauthorized" }

------------------------------------------------------------------------

## 1. API Key Login (Payload Based)

POST /auth/login/apikey

Request: { "apiKey": "TRAINING-12345" }

Response: { "accessToken": "BEARER-APIKEY-ABC-123", "method": "API_KEY",
"expiresIn": 3600 }

------------------------------------------------------------------------

## 2. Username and Password Login

POST /auth/login

Request: { "username": "trainer", "password": "password123" }

Response: { "accessToken": "BEARER-USER-XYZ-456", "method":
"CREDENTIALS", "expiresIn": 3600 }

------------------------------------------------------------------------

# Student APIs

All APIs below require:

Authorization: Bearer `<accessToken>`

------------------------------------------------------------------------

## Create Student

POST /students

{ "name": "Rahul", "email": "rahul@test.com" }

Response: { "studentId": "S1001", "status": "ACTIVE" }

Validation Rules: - Email must be unique - Required fields enforced

when a student creation request is successfull generate an api key for the student and store in the app_data folder in the project root

------------------------------------------------------------------------

## Get Student

GET /students/{studentId}

Response: { "studentId": "S1001", "name": "Rahul", "email":
"rahul@test.com", "status": "ACTIVE", "enrollments": [] }

------------------------------------------------------------------------

## Update Student

PUT /students/{studentId}

{ "name": "Rahul Sharma" }

Response: { "studentId": "S1001", "updated": true }

------------------------------------------------------------------------

## Delete Student

DELETE /students/{studentId}

Rule: Cannot delete if enrolled in active course

------------------------------------------------------------------------

# Course APIs

## Create Course

POST /courses

{ "title": "API Automation", "capacity": 2 }

Response: { "courseId": "C2001", "status": "OPEN", "enrolledCount": 0 }

------------------------------------------------------------------------

## Get Course Details

GET /courses/{courseId}

Response: { "courseId": "C2001", "title": "API Automation", "capacity":
2, "enrolledCount": 0, "availableSeats": 2, "status": "OPEN", created_date: "<date>" }

Derived Validation: availableSeats = capacity - enrolledCount

------------------------------------------------------------------------

## Update Course

PUT /courses/{courseId}

Rule: Capacity cannot be less than enrolledCount

------------------------------------------------------------------------

## Delete Course

DELETE /courses/{courseId}

Rule: Cannot delete if students are enrolled

------------------------------------------------------------------------

# Enrollment APIs

## Enroll Student

POST /enrollments

{ "studentId": "S1001", "courseId": "C2001" }

Response: { "enrollmentId": "E3001", "status": "CONFIRMED" }

Rules: - Course must be OPEN - Capacity must not exceed - Student cannot
enroll twice

------------------------------------------------------------------------

## Cancel Enrollment

PUT /enrollments/{enrollmentId}/cancel

Response: { "status": "CANCELLED" }

Seat is restored after cancellation.

------------------------------------------------------------------------

# Search and Pagination

## Search Students

GET /students?status=ACTIVE

## Paginated Courses

GET /courses?page=1&limit=5

Response: { "page": 1, "limit": 5, "total": 12, "data": [] }

------------------------------------------------------------------------

# Recommended End to End Flow

1.  Login using API Key or Username/Password
2.  Extract Bearer token
3.  Create Student
4.  Create Course
5.  Get Course Details
6.  Enroll Student
7.  Validate seat reduction
8.  Attempt duplicate enrollment
9.  Cancel Enrollment
10. Validate seat restoration
11. Delete Student
12. Delete Course

------------------------------------------------------------------------

# Purpose

CampusCore API is built strictly for automation training. It enforces
unified Bearer token usage across all functional endpoints to ensure
learners practice proper authentication chaining and token reuse.
