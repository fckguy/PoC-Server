require('dotenv').config();

const axios = require('axios');

const baseURL = process.env.WALLABY_SERVICE_API || 'https://dev-testnet.wallaby.cash/api/v1';

const http = axios.create({
  baseURL,
});

module.exports.http = http;
