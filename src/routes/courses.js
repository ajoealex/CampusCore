const express = require('express');
const dataStore = require('../utils/dataStore');

const router = express.Router();

// POST /courses - Create Course
router.post('/', (req, res) => {
    const { title, capacity } = req.body;

    if (!title || capacity === undefined) {
        return res.status(400).json({ error: 'title and capacity are required' });
    }

    if (typeof capacity !== 'number' || capacity < 1) {
        return res.status(400).json({ error: 'capacity must be a positive number' });
    }

    const courseId = `C${dataStore.getNextCourseId()}`;

    const course = {
        courseId,
        title,
        capacity,
        enrolledCount: 0,
        status: 'OPEN',
        createdAt: new Date().toISOString()
    };

    dataStore.saveCourse(course);

    res.status(201).json({
        courseId,
        status: 'OPEN',
        enrolledCount: 0
    });
});

// GET /courses - List Courses with pagination
router.get('/', (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    let courses = dataStore.getAllCourses();

    // Filter by status if provided
    if (status) {
        courses = courses.filter(c => c.status === status.toUpperCase());
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedCourses = courses.slice(startIndex, endIndex);

    res.json({
        page: pageNum,
        limit: limitNum,
        total: courses.length,
        data: paginatedCourses.map(c => ({
            courseId: c.courseId,
            title: c.title,
            capacity: c.capacity,
            enrolledCount: c.enrolledCount,
            availableSeats: c.capacity - c.enrolledCount,
            status: c.status
        }))
    });
});

// GET /courses/:courseId - Get Course Details
router.get('/:courseId', (req, res) => {
    const { courseId } = req.params;

    const course = dataStore.getCourse(courseId);
    if (!course) {
        return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
        courseId: course.courseId,
        title: course.title,
        capacity: course.capacity,
        enrolledCount: course.enrolledCount,
        availableSeats: course.capacity - course.enrolledCount,
        status: course.status,
        created_date: course.createdAt
    });
});

// PUT /courses/:courseId - Update Course
router.put('/:courseId', (req, res) => {
    const { courseId } = req.params;
    const updates = req.body;

    const course = dataStore.getCourse(courseId);
    if (!course) {
        return res.status(404).json({ error: 'Course not found' });
    }

    // Validate capacity change
    if (updates.capacity !== undefined) {
        if (typeof updates.capacity !== 'number' || updates.capacity < 1) {
            return res.status(400).json({ error: 'capacity must be a positive number' });
        }

        if (updates.capacity < course.enrolledCount) {
            return res.status(400).json({
                error: 'Capacity cannot be less than current enrolled count'
            });
        }
    }

    // Update allowed fields
    const allowedFields = ['title', 'capacity', 'status'];
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            course[field] = updates[field];
        }
    });

    course.updatedAt = new Date().toISOString();
    dataStore.saveCourse(course);

    res.json({
        courseId,
        updated: true
    });
});

// DELETE /courses/:courseId - Delete Course
router.delete('/:courseId', (req, res) => {
    const { courseId } = req.params;

    const course = dataStore.getCourse(courseId);
    if (!course) {
        return res.status(404).json({ error: 'Course not found' });
    }

    // Check if course has enrolled students
    const enrollments = dataStore.getCourseEnrollments(courseId);
    if (enrollments.length > 0) {
        return res.status(400).json({
            error: 'Cannot delete course with enrolled students'
        });
    }

    dataStore.deleteCourse(courseId);

    res.json({
        courseId,
        deleted: true
    });
});

module.exports = router;
