const ee = require('@google/earthengine');
const privateKey = require('../../service-account.json');

console.log('Testing GEE Connection...');
console.log('Private Key Project ID:', privateKey.project_id);

const initialize = () => {
    return new Promise((resolve, reject) => {
        ee.data.authenticateViaPrivateKey(privateKey, () => {
            console.log('Authentication successful.');
            ee.initialize(null, null, () => {
                console.log('Initialization successful.');
                resolve();
            }, (err) => {
                console.error('Initialization failed:', err);
                reject(err);
            });
        }, (err) => {
            console.error('Authentication failed:', err);
            reject(err);
        });
    });
};

const runTest = async () => {
    try {
        await initialize();
        console.log('GEE Ready. Trying simple operation...');

        // Simple test: Get info about an image collection
        const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');
        const info = await new Promise((resolve, reject) => {
            s2.limit(1).evaluate((val, err) => {
                if (err) reject(err);
                else resolve(val);
            });
        });
        console.log('Test Operation Successful:', info);

    } catch (error) {
        console.error('Test Failed:', error);
    }
};

runTest();
