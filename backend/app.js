require('custom-env').env('localhost');

const express = require('express');
const cors = require('cors');

const fetchDetails = require('./routes/fetchDetails');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use('/campaign/',fetchDetails);
app.use((req, res, next) => { res.status(404).json({ message: 'ENDPOINT_NOT_FOUND' }); })


module.exports = app;