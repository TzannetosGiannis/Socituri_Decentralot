require('custom-env').env('localhost');

const express = require('express');
const cors = require('cors');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use((req, res, next) => { res.status(404).json({ message: 'ENDPOINT_NOT_FOUND' }); })


module.exports = app;