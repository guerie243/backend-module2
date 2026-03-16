const axios = require('axios');

const API_URL = 'http://localhost:5000/api/sync/phrase';
const testPhrase = `test_sync_m2_${Date.now()}`;

async function verifySync() {
    console.log(`--- Verification of Module 2 Sync API ---`);
    console.log(`Target: ${API_URL}`);

    try {
        // 1. POST
        console.log(`\nStep 1: Setting phrase "${testPhrase}"...`);
        const postRes = await axios.post(API_URL, { phrase: testPhrase });
        console.log('Response:', postRes.data);

        // 2. GET
        console.log(`\nStep 2: Retrieving phrase...`);
        const getRes = await axios.get(API_URL);
        console.log('Retrieved:', getRes.data);
        if (getRes.data.phrase === testPhrase) {
            console.log('✅ Phrase matches!');
        } else {
            console.error('❌ Mismatch!');
        }

        // 3. DELETE
        console.log(`\nStep 3: Deleting phrase...`);
        const deleteRes = await axios.delete(API_URL);
        console.log('Response:', deleteRes.data);

        // 4. Verify deletion
        console.log(`\nStep 4: Final check (should be 404)...`);
        try {
            await axios.get(API_URL);
            console.error('❌ Phrase still exists!');
        } catch (e) {
            if (e.response && e.response.status === 404) {
                console.log('✅ Correct: Phrase deleted.');
            } else {
                console.error('❌ Error:', e.message);
            }
        }

    } catch (error) {
        console.error('Critical Error:', error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

verifySync();
