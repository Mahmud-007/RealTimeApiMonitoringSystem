const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':***@'));

async function run() {
    const client = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
        // family: 4,
    });

    try {
        console.log('Attempting to connect...');
        await client.connect();
        console.log('Connected successfully!');
        const db = client.db('test');
        console.log('Database selected.');
    } catch (err) {
        console.error('Connection failed:');
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
