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

// const users = JSON.parse(fs.readFileSync(`${__dirname}/_database/users.json`, 'utf-8'));
// const tutors = JSON.parse(fs.readFileSync(`${__dirname}/_database_database/tutors.json`, 'utf-8'));
// const students = JSON.parse(fs.readFileSync(`${__dirname}/_database/students.json`, 'utf-8'));


const importData = async () => {
    try {
        await Tutor.updateMany({}, {
            paymentPerHour: 20,
            tags: ['5df3a6a8a0a5d03dac29e3c1', '5df4469986cbb71fa8849c05', '5df446df86cbb71fa8849c06', '5df446ff86cbb71fa8849c07'],
            specialization: '5df4468e86cbb71fa8849c04',
            selfIntro: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad mini veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
            successRate: 0.9,
            averageRating: 4.7
        });
        console.log('Data Imported...'.green.inverse);
    } catch (error) {
        console.log(error);
    }
    
}

const deleteData = async() => {
    try {
        await Tag.deleteMany();
        await Specialization.deleteMany();
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
