const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');

const router = express.Router();

// POST /students - Create Student
router.post('/', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'name and email are required' });
    }

    // Check email uniqueness
    if (dataStore.studentEmailExists(email)) {
        return res.status(400).json({ error: 'Email already exists' });
    }

    const studentId = `S${dataStore.getNextStudentId()}`;

    const student = {
        studentId,
        name,
        email,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
    };

    dataStore.saveStudent(student);

    // Generate and save API key for the student
    const apiKey = `STU-${uuidv4().substring(0, 12).toUpperCase()}`;
    dataStore.saveStudentApiKey(studentId, apiKey);

    res.status(201).json({
        studentId,
        status: 'ACTIVE'
    });
});

// GET /students - List/Search Students
router.get('/', (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    let students = dataStore.getAllStudents();

    // Filter by status if provided
    if (status) {
        students = students.filter(s => s.status === status.toUpperCase());
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedStudents = students.slice(startIndex, endIndex);

    res.json({
        page: pageNum,
        limit: limitNum,
        total: students.length,
        data: paginatedStudents
    });
});

// GET /students/:studentId - Get Student
router.get('/:studentId', (req, res) => {
    const { studentId } = req.params;

    const student = dataStore.getStudent(studentId);
    if (!student) {
        return res.status(404).json({ error: 'Student not found' });
    }

    // Get enrollments for this student
    const enrollments = dataStore.getStudentEnrollments(studentId);

    res.json({
        ...student,
        enrollments: enrollments.map(e => ({
            enrollmentId: e.enrollmentId,
            courseId: e.courseId,
            status: e.status
        }))
    });
});

// PUT /students/:studentId - Update Student
router.put('/:studentId', (req, res) => {
    const { studentId } = req.params;
    const updates = req.body;

    const student = dataStore.getStudent(studentId);
    if (!student) {
        return res.status(404).json({ error: 'Student not found' });
    }

    // Check email uniqueness if email is being updated
    if (updates.email && updates.email !== student.email) {
        if (dataStore.studentEmailExists(updates.email, studentId)) {
            return res.status(400).json({ error: 'Email already exists' });
        }
    }

    // Update allowed fields
    const allowedFields = ['name', 'email', 'status'];
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            student[field] = updates[field];
        }
    });

    student.updatedAt = new Date().toISOString();
    dataStore.saveStudent(student);

    res.json({
        studentId,
        updated: true
    });
});

// DELETE /students/:studentId - Delete Student
router.delete('/:studentId', (req, res) => {
    const { studentId } = req.params;

    const student = dataStore.getStudent(studentId);
    if (!student) {
        return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student has active enrollments
    const enrollments = dataStore.getStudentEnrollments(studentId);
    const activeEnrollments = enrollments.filter(e => e.status === 'CONFIRMED');

    if (activeEnrollments.length > 0) {
        return res.status(400).json({
            error: 'Cannot delete student with active course enrollments'
        });
    }

    dataStore.deleteStudent(studentId);

    res.json({
        studentId,
        deleted: true
    });
});

module.exports = router;
