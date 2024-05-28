const mongoose = require('mongoose');

const connectMongoDB = async () => {
    const conn = await mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`, {
	 	dbName: process.env.DB_NAME,
    });

    console.log(`MongoDB "${conn.connection.name}" connected: ${conn.connection.host}`);
}

module.exports = connectMongoDB;