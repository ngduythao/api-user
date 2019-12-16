require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const connectDB = require('./services/database');
const passportConfig = require('./middleware/passport');
const errorHandler = require('./middleware/error');
const cors = require('cors')

const app = express();
app.use(cors());
connectDB();
passportConfig();

require('./models/Complaint');
require('./models/Contract');
require('./models/Specialization');
require('./models/Student');
require('./models/Tag');
require('./models/Tutor');
require('./models/User');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const tutorsRouter = require('./routes/tutors');
const tagsRouter = require('./routes/tag');
const specializationsRouter = require('./routes/specialization');
const contractRouter = require('./routes/contract');
const complaintRouter = require('./routes/complaint');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// mouting route
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/tutors', tutorsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/specializations', specializationsRouter);
app.use('/api/contracts', contractRouter);
app.use('/api/complaints', complaintRouter);
app.use(errorHandler);

module.exports = app;

// https://exceptionshub.com/missingschemaerror-schema-hasnt-been-registered-for-model-user.html