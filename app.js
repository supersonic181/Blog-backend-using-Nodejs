const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const cors = require('cors');
require('dotenv').config()

const routes = require('./routes/routes');

//middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: "*"
}));

app.use('/api', routes);

module.exports = {app};