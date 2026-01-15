const mongoose = require('mongoose');
require('dotenv').config();

console.log('MongoDB Connection Diagnostics');
console.log('================================');
console.log('Connection String:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
console.log('Node Version:', process.version);
console.log('Mongoose Version:', mongoose.version);
console.log('\nAttempting connection...\n');

async function testConnection() {
    try {
        // Test 1: Try with minimal options
        console.log('[Test 1] Connecting with default options...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');

        // Test database operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name));

        await mongoose.disconnect();
        console.log('✅ Disconnected successfully');

    } catch (error) {
        console.error('❌ FAILED:', error.message);
        console.error('\nPossible causes:');
        console.error('1. IP Address not whitelisted in MongoDB Atlas');
        console.error('2. Invalid credentials (username/password)');
        console.error('3. Network/Firewall blocking connection');
        console.error('4. MongoDB Atlas cluster is paused or deleted');
        console.error('5. Node.js OpenSSL version incompatibility');

        console.error('\nFull error:', error);
        process.exit(1);
    }
}

testConnection();
