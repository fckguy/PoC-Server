const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');
const { faker } = require('@faker-js/faker');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');

const getUserAssets = async () => {
  try {
    // API KEY needed to access any endpoint
    const apiKey = '071b51027b264a1b8fcd3d73684d25ca';
    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMGViYWY1ZWYtZGU5Yy00YjgxLWFjYjMtYTUxYzY5MzQyNTgyIn0sInN1YiI6IjBlYmFmNWVmLWRlOWMtNGI4MS1hY2IzLWE1MWM2OTM0MjU4MiIsImlhdCI6MTY3NDIwNjk2MX0.yjzPKFMUkjc-OMHhRPBX5n4uBgkDN0Am7AGmJWYAc_8';
    const userId = '0ebaf5ef-de9c-4b81-acb3-a51c69342582';

    const { data } = await http.get(`/users/${userId}/assets`, {
      headers: {
        'X-API-KEY': apiKey,
        authorization: 'Bearer ' + accessToken,
      },
    });

    logExampleOutput({
      name: 'user-get-assets',
      data: {
        userId,
        ...data,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

getUserAssets();
