// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
// require('./connection');

//Parse url encoded bodies(sent by HTML forms)
app.use(express.urlencoded({extended : false}));

//Parse JSON bodies(sent by API clients)
app.use(express.json());

app.use(cookieParser());

//Test Server
app.get('/', (req, res) => {
    res.send("Hello World");
});

// Define Routes
app.use('/api', require('./controllers/routes'));
app.use('/update', require('./controllers/update'));

// Server Listening
app.listen(3700, () => {
    console.log('Server is running at port 3700');
});