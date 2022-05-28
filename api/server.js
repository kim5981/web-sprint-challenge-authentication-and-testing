const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const knex = require("../data/dbConfig")

const session = require("express-session")
const Store = require("connect-session-knex")(session)

const { restricted } = require('./middleware/restricted.js');

const authRouter = require('./auth/auth-router.js');
const jokesRouter = require('./jokes/jokes-router.js');

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());

server.use('/api/auth', authRouter);
server.use('/api/jokes', restricted, jokesRouter); // only logged-in users should have access!

server.use(session({
  name: "sprint4",
  secret: process.env.JWT_SECRET,
  saveUninitialized: false,
  resave: false,
  store: new Store({
    knex,
    createTable: true,
    clearInterval:  1000 * 60 * 10,
    tablename: "sessions",
    sidFieldName: "sid",
  }),
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false, // true in prod
    httpOnly: true
  }
}))

server.use((err, req, res, next) => { // eslint-disable-line
    res.status(err.status || 500).json({
      message: err.message,
      stack: err.stack,
    })
  })

module.exports = server;
