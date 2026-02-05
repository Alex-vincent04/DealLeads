const fetch = require('node-fetch');

async function testBroadcast() {
    try {
        console.log('--- STARTING LOCAL BROADCAST TEST ---');
        const response = await fetch('http://localhost:3000/api/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Antigravity Verification Test',
                summary: 'This is a test broadcast to verify Resend API integration from the local environment.',
                auth: 'dealLeads2026'
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ TEST PASSED: Broadcast endpoint answered correctly.');
        } else {
            console.log('❌ TEST FAILED:', data.error || 'Unknown error');
        }
    } catch (err) {
        console.error('❌ TEST ERROR:', err.message);
    }
}

testBroadcast();
