const axios = require('axios');

const API_URL = 'https://backend-module2-lpqw.onrender.com/api/activities';

const runLiveTest = async () => {
    console.log('--- Starting Live Activity Tracking Test ---');
    console.log(`Target: ${API_URL}`);

    const payload = {
        eventType: 'landing_click',
        screenName: 'Landing Page',
        timestamp: new Date().toISOString(),
        metadata: {
            buttonName: 'LIVE_TEST_BUTTON',
            timeSpent: 42,
            referralCode: 'TEST'
        }
    };

    try {
        console.log('Sending test activity...');
        const response = await axios.post(API_URL, payload);

        if (response.data.success) {
            console.log('✅ Success: Activity recorded on server.');
        } else {
            console.error('❌ Failed: Server responded with error:', response.data);
        }

        console.log('\nFetching recent activities to verify...');
        const listResponse = await axios.get(`${API_URL}/all?limit=5`);
        const activities = listResponse.data.data;

        const found = activities.find(a => a.metadata && a.metadata.buttonName === 'LIVE_TEST_BUTTON');

        if (found) {
            console.log('✅ Verified: Test activity found in the activity list!');
            console.log('Details:', JSON.stringify(found, null, 2));
        } else {
            console.error('❌ Error: Test activity not found in recent logs.');
        }

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
};

runLiveTest();
