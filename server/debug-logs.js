const axios = require('axios');

async function checkLogs() {
    try {
        console.log("Fetching logs with limit=50...");
        const response = await axios.get('http://localhost:3000/api/logs?limit=50');

        let logs = [];
        if (Array.isArray(response.data)) {
            logs = response.data;
        } else if (response.data.data) {
            logs = response.data.data;
        }

        console.log(`Status: ${response.status}`);
        console.log(`Logs Returned: ${logs.length}`);

        if (response.data.pagination) {
            console.log("Pagination Info:", response.data.pagination);
        }
    } catch (error) {
        console.error("Error fetching logs:", error.message);
    }
}

checkLogs();
