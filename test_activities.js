const axios = require('axios');

const API_URL = 'http://localhost:5000/api/activities';

const testActivities = async () => {
    try {
        console.log('--- Testing Activity API ---');

        // 1. Log an activity
        console.log('\n1. Logging new activity...');
        const activity = {
            eventType: 'TEST_EVENT',
            userId: 'user_test_123',
            screenName: 'TestScreen',
            metadata: { info: 'test' }
        };
        await axios.post(API_URL, activity);
        console.log('✅ Activity logged successfully');

        // 2. Get activities
        console.log('\n2. Fetching activities...');
        const res = await axios.get(`${API_URL}/all`);
        console.log(`✅ Fetched ${res.data.count} activities`);
        console.log('First activity:', res.data.data[0]);

        if (res.data.count > 0 && res.data.data[0].eventType === 'TEST_EVENT') {
            console.log('✅ Data verification passed');
        } else {
            console.error('❌ Data verification failed');
        }

        // 3. Delete activities
        console.log('\n3. Deleting all activities...');
        await axios.delete(`${API_URL}/all`);
        console.log('✅ Activities deleted');

        // 4. Verify deletion
        console.log('\n4. Verifying deletion...');
        const res2 = await axios.get(`${API_URL}/all`);
        if (res2.data.count === 0) {
            console.log('✅ Deletion verified (count is 0)');
        } else {
            console.error(`❌ Deletion failed (count is ${res2.data.count})`);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

testActivities();
