const express = require('express');
const dataStore = require('../utils/dataStore');

const router = express.Router();

// POST /enrollments - Enroll Student in Course
router.post('/', (req, res) => {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
        return res.status(400).json({ error: 'studentId and courseId are required' });
    }

    // Validate student exists
    const student = dataStore.getStudent(studentId);
    if (!student) {
        return res.status(404).json({ error: 'Student not found' });
    }

    // Validate course exists
    const course = dataStore.getCourse(courseId);
    if (!course) {
        return res.status(404).json({ error: 'Course not found' });
    }

    // Check if course is OPEN
    if (course.status !== 'OPEN') {
        return res.status(400).json({ error: 'Course is not open for enrollment' });
    }

    // Check capacity
    if (course.enrolledCount >= course.capacity) {
        return res.status(400).json({ error: 'Course is at full capacity' });
    }

    // Check if student is already enrolled
    const existingEnrollments = dataStore.getStudentEnrollments(studentId);
    const alreadyEnrolled = existingEnrollments.some(
        e => e.courseId === courseId && e.status === 'CONFIRMED'
    );

    if (alreadyEnrolled) {
        return res.status(400).json({ error: 'Student is already enrolled in this course' });
    }

    // Create enrollment
    const enrollmentId = `E${dataStore.getNextEnrollmentId()}`;

    const enrollment = {
        enrollmentId,
        studentId,
        courseId,
        status: 'CONFIRMED',
        enrolledAt: new Date().toISOString()
    };

    // Update course enrolled count
    course.enrolledCount += 1;
    dataStore.saveCourse(course);

    // Save enrollment
    const enrollments = dataStore.getEnrollments();
    enrollments.push(enrollment);
    dataStore.saveEnrollments(enrollments);

    res.status(201).json({
        enrollmentId,
        status: 'CONFIRMED'
    });
});

// GET /enrollments - List all enrollments
router.get('/', (req, res) => {
    const { studentId, courseId, status } = req.query;

    let enrollments = dataStore.getEnrollments();

    if (studentId) {
        enrollments = enrollments.filter(e => e.studentId === studentId);
    }

    if (courseId) {
        enrollments = enrollments.filter(e => e.courseId === courseId);
    }

    if (status) {
        enrollments = enrollments.filter(e => e.status === status.toUpperCase());
    }

    res.json({
        total: enrollments.length,
        data: enrollments
    });
});

// GET /enrollments/:enrollmentId - Get Enrollment
router.get('/:enrollmentId', (req, res) => {
    const { enrollmentId } = req.params;

    const enrollment = dataStore.getEnrollment(enrollmentId);
    if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json(enrollment);
});

// PUT /enrollments/:enrollmentId/cancel - Cancel Enrollment
router.put('/:enrollmentId/cancel', (req, res) => {
    const { enrollmentId } = req.params;

    const enrollments = dataStore.getEnrollments();
    const enrollmentIndex = enrollments.findIndex(e => e.enrollmentId === enrollmentId);

    if (enrollmentIndex === -1) {
        return res.status(404).json({ error: 'Enrollment not found' });
    }

    const enrollment = enrollments[enrollmentIndex];

    if (enrollment.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Enrollment is already cancelled' });
    }

    // Update enrollment status
    enrollment.status = 'CANCELLED';
    enrollment.cancelledAt = new Date().toISOString();

    // Restore seat in course
    const course = dataStore.getCourse(enrollment.courseId);
    if (course) {
        course.enrolledCount = Math.max(0, course.enrolledCount - 1);
        dataStore.saveCourse(course);
    }

    // Save updated enrollments
    enrollments[enrollmentIndex] = enrollment;
    dataStore.saveEnrollments(enrollments);

    res.json({
        status: 'CANCELLED'
    });
});

module.exports = router;
