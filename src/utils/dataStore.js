const fs = require('fs');
const path = require('path');

// Determine base directory - use executable's directory when packaged, otherwise project root
function getBaseDir() {
    if (process.pkg) {
        // Running as pkg executable - use directory where executable is located
        return path.dirname(process.execPath);
    }
    // Development mode - use project root (2 levels up from utils folder)
    return path.join(__dirname, '../..');
}

const BASE_DIR = getBaseDir();
const APP_DATA_DIR = path.join(BASE_DIR, 'app_data');
const STUDENTS_DIR = path.join(APP_DATA_DIR, 'students');
const COURSES_DIR = path.join(APP_DATA_DIR, 'courses');
const ENROLLMENTS_FILE = path.join(APP_DATA_DIR, 'enrollments.json');
const TOKENS_FILE = path.join(APP_DATA_DIR, 'tokens.json');

// Ensure directories exist
function ensureDirectories() {
    [APP_DATA_DIR, STUDENTS_DIR, COURSES_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Initialize enrollments file if not exists
    if (!fs.existsSync(ENROLLMENTS_FILE)) {
        fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify([], null, 2));
    }

    // Initialize tokens file if not exists
    if (!fs.existsSync(TOKENS_FILE)) {
        fs.writeFileSync(TOKENS_FILE, JSON.stringify({}, null, 2));
    }
}

// Student operations - each student gets folder s_<id>
function getNextStudentId() {
    const folders = fs.readdirSync(STUDENTS_DIR).filter(f => {
        const fullPath = path.join(STUDENTS_DIR, f);
        return fs.statSync(fullPath).isDirectory() && f.startsWith('s_');
    });

    if (folders.length === 0) return 1001;

    const ids = folders.map(f => parseInt(f.replace('s_', '')));
    const maxId = Math.max(...ids);
    return maxId + 1;
}

function getStudentFolderPath(studentId) {
    const id = typeof studentId === 'string' ? studentId.replace('S', '') : studentId;
    return path.join(STUDENTS_DIR, `s_${id}`);
}

function saveStudent(student) {
    const folderPath = getStudentFolderPath(student.studentId);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(folderPath, 'data.json');
    fs.writeFileSync(filePath, JSON.stringify(student, null, 2));
}

function getStudent(studentId) {
    const folderPath = getStudentFolderPath(studentId);
    const filePath = path.join(folderPath, 'data.json');
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getAllStudents() {
    const folders = fs.readdirSync(STUDENTS_DIR).filter(f => {
        const fullPath = path.join(STUDENTS_DIR, f);
        return fs.statSync(fullPath).isDirectory() && f.startsWith('s_');
    });

    return folders.map(f => {
        const filePath = path.join(STUDENTS_DIR, f, 'data.json');
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return null;
    }).filter(s => s !== null);
}

function deleteStudent(studentId) {
    const folderPath = getStudentFolderPath(studentId);
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true });
        return true;
    }
    return false;
}

function studentEmailExists(email, excludeStudentId = null) {
    const students = getAllStudents();
    return students.some(s => s.email === email && s.studentId !== excludeStudentId);
}

// Save student API key
function saveStudentApiKey(studentId, apiKey) {
    const folderPath = getStudentFolderPath(studentId);
    const filePath = path.join(folderPath, 'apikey.json');
    fs.writeFileSync(filePath, JSON.stringify({ apiKey, createdAt: new Date().toISOString() }, null, 2));
}

// Course operations - each course gets folder c_<id>
function getNextCourseId() {
    const folders = fs.readdirSync(COURSES_DIR).filter(f => {
        const fullPath = path.join(COURSES_DIR, f);
        return fs.statSync(fullPath).isDirectory() && f.startsWith('c_');
    });

    if (folders.length === 0) return 2001;

    const ids = folders.map(f => parseInt(f.replace('c_', '')));
    const maxId = Math.max(...ids);
    return maxId + 1;
}

function getCourseFolderPath(courseId) {
    const id = typeof courseId === 'string' ? courseId.replace('C', '') : courseId;
    return path.join(COURSES_DIR, `c_${id}`);
}

function saveCourse(course) {
    const folderPath = getCourseFolderPath(course.courseId);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    const filePath = path.join(folderPath, 'data.json');
    fs.writeFileSync(filePath, JSON.stringify(course, null, 2));
}

function getCourse(courseId) {
    const folderPath = getCourseFolderPath(courseId);
    const filePath = path.join(folderPath, 'data.json');
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getAllCourses() {
    const folders = fs.readdirSync(COURSES_DIR).filter(f => {
        const fullPath = path.join(COURSES_DIR, f);
        return fs.statSync(fullPath).isDirectory() && f.startsWith('c_');
    });

    return folders.map(f => {
        const filePath = path.join(COURSES_DIR, f, 'data.json');
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return null;
    }).filter(c => c !== null);
}

function deleteCourse(courseId) {
    const folderPath = getCourseFolderPath(courseId);
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true });
        return true;
    }
    return false;
}

// Enrollment operations
function getEnrollments() {
    if (!fs.existsSync(ENROLLMENTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ENROLLMENTS_FILE, 'utf8'));
}

function saveEnrollments(enrollments) {
    fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(enrollments, null, 2));
}

function getNextEnrollmentId() {
    const enrollments = getEnrollments();
    if (enrollments.length === 0) return 3001;

    const ids = enrollments.map(e => parseInt(e.enrollmentId.replace('E', '')));
    const maxId = Math.max(...ids);
    return maxId + 1;
}

function getEnrollment(enrollmentId) {
    const enrollments = getEnrollments();
    return enrollments.find(e => e.enrollmentId === enrollmentId);
}

function getStudentEnrollments(studentId) {
    const enrollments = getEnrollments();
    return enrollments.filter(e => e.studentId === studentId);
}

function getCourseEnrollments(courseId) {
    const enrollments = getEnrollments();
    return enrollments.filter(e => e.courseId === courseId && e.status === 'CONFIRMED');
}

// Token operations
function getTokens() {
    if (!fs.existsSync(TOKENS_FILE)) return {};
    return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
}

function saveToken(token, data) {
    const tokens = getTokens();
    tokens[token] = { ...data, createdAt: Date.now() };
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

function validateToken(token) {
    const tokens = getTokens();
    const tokenData = tokens[token];
    if (!tokenData) return null;

    // Check if token expired (1 hour = 3600000 ms)
    if (Date.now() - tokenData.createdAt > 3600000) {
        delete tokens[token];
        fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
        return null;
    }

    return tokenData;
}

module.exports = {
    ensureDirectories,
    // Students
    getNextStudentId,
    saveStudent,
    getStudent,
    getAllStudents,
    deleteStudent,
    studentEmailExists,
    saveStudentApiKey,
    // Courses
    getNextCourseId,
    saveCourse,
    getCourse,
    getAllCourses,
    deleteCourse,
    // Enrollments
    getEnrollments,
    saveEnrollments,
    getNextEnrollmentId,
    getEnrollment,
    getStudentEnrollments,
    getCourseEnrollments,
    // Tokens
    saveToken,
    validateToken
};
