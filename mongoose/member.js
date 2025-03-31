const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
    name: String,
    description: String,
    startDate: Date,
    endDate: Date,
    points: Number,
    score: Number,
    rate: Number,


})


const weekSchema = new mongoose.Schema({
    name: String,
    date: {
        type: Date,
    },
    tasks: []
})

const monthSchema = new mongoose.Schema({
    name: String,
    date: {
        type: Date,
    },
    weeks: [
        {
            type: weekSchema,
        }
    ],
    // Add this validation
    weeks: {
        type: Array,
        validate: [arrayLimit, '{PATH} exceeds the limit of 4 weeks'],
        maxLength: 4
    }
});

// Add this function
function arrayLimit(val) {
    return val.length <= 4;
}
const memberSchema = new mongoose.Schema({
    name: String,
    email: String,
    college: String,
    year: String,
    phone: String,
    months: [
        {
            type: monthSchema,
        }
    ],
    // Add this validation
    // months: {
    //     type: Array,
    //     validate: [arrayLimit, '{PATH} exceeds the limit of 12 months'],
    //     maxLength: 12
    // }
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;