require('dotenv').config();
require('colors');
const fs = require('fs');
const mongoose = require('mongoose');

const Complain = require('./models/Complaint');
const Contract = require('./models/Contract');
const Specialization = require('./models/Specialization');
const Student = require('./models/Student');
const Tag = require('./models/Tag');
const Tutor = require('./models/Tutor');
const User = require('./models/User');

const connectDB = require('./services/database');
connectDB();

//const users = JSON.parse(fs.readFileSync(`${__dirname}/_database/users.json`, 'utf-8'));
//const tutors = JSON.parse(fs.readFileSync(`${__dirname}/_database_database/tutors.json`, 'utf-8'));
//const students = JSON.parse(fs.readFileSync(`${__dirname}/_database/students.json`, 'utf-8'));
// const tags = JSON.parse(fs.readFileSync(`${__dirname}/_database/tags.json`, 'utf-8'));
const specializations = JSON.parse(fs.readFileSync(`${__dirname}/_database/specializations.json`, 'utf-8'));

const importData = async () => {
    try {
        // await User.create(users);
        // await Tutor.create(tutors);
        // await Student.create(students);
        // await Specialization.create(specializations);
        console.log('Data Imported...'.green.inverse);
    } catch (error) {
        console.log(error);
    }
    
}

const deleteData = async() => {
    try {
        await User.deleteMany();
        await Tutor.deleteMany();
        await Student.deleteMany();
        console.log('Data Destroyed...'.red.inverse);
    } catch (error) {
        console.log(error);
        
    }
}

// node seeder.js -i
if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}
