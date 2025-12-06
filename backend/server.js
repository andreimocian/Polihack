const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// EXPORT io so controllers can use it ❗
module.exports.io = io;

// MongoDB connect
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;

// IMPORTANT: listen with *server*, not app
server.listen(port, () => {
  console.log(`App running on port ${port}`);
});
