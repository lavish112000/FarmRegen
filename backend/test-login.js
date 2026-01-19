const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login endpoint...\n');

        const response = await axios.post('https://farmregen.onrender.com/api/auth/login', {
            email: 'lalitchoudhary112000@gmail.com',
            password: '1234567890Lc'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Login successful!');
        console.log('Response:', response.data);

    } catch (error) {
        console.error('❌ Login failed!');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data);
        console.error('Full error:', error.message);
    }
}

testLogin();
