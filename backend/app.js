const express = require('express');
const cors = require('cors');

const campaignDetails = require('./routes/campaign');
const ticketDetails = require('./routes/ticket');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use('/campaigns/',campaignDetails);
app.use('/tickets/',ticketDetails);
app.use((req, res, next) => { res.status(404).json({ message: 'ENDPOINT_NOT_FOUND' }); })


module.exports = app;