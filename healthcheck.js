import fetch from 'node-fetch';

const response = await fetch('http://localhost:3000/health');
process.exit(response.ok ? 0 : 1);