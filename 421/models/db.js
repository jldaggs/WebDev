// Require Mongoose
var mongoose = require('mongoose');
// Require dotenv and specify the custom path to your config.env
require('dotenv').config({ path: './config.env' });

// Build the connection string using environment variables from config.env
var dbURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}` +
    `@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

var name  = process.env.DB_USER
// Connect to MongoDB
mongoose.connect(dbURI);

// Monitor and report when database is connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + name);
});

// Monitor and report error connecting to database
mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});

// Monitor and report when database is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});
// Closes (disconnects) from Mongoose DB upon shutdown
async function gracefulShutdown() {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
}

process.on('SIGINT', gracefulShutdown).on('SIGTERM', gracefulShutdown);


// For nodemon restarts
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
        process.kill(process.pid, 'SIGUSR2');
    }); });

// For app termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function () {
        process.exit(0);
    }); });

