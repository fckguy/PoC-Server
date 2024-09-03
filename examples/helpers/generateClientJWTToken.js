const jwt = require('jsonwebtoken');

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQBphoSqssjiSHIVCZVEgFFhdAaEQ6wUR0mUY87Zq8Ul7PD+mLC6
CHsP+Z0GiNVaGAEPYMyIjhTFcXWq1nzTFBHHw12tRTFbsEtc6yJ0gPeHHI70OKPj
kBTK82XgvzfyY7ypvEC5mHoTyEZwJF3eDi659USha1257isnZ8JB8kkK/UUhtd8t
NshCR5EI8mAT3Ps9iFfU6hp+3fgpnNZYonjAEyYYhIsg8wxk2MS12QtC0J7aVnbW
ehm2gRrWQsYhEnqckqiCerkufvFv73xCm9XkOuhKg7+IMrdkIuqj97DRkhL5tMDx
U7IzVqEAoND1BLnpc0rus3mVCfIK77o9EdgRAgMBAAECggEAUyfJy6nvW0GzhJh0
o/JqLt17dSbOp3w1o1WzXxxY0zYQAtDYEwEz2Lbe4pNZbRGVZETnaIRuIdjy3JkA
7GTYTg7J9wybhKE8AhDYqe4nILWEgTdRDrYvbG65TY3hzISD202Zw6dAK+6acyx1
O9L5R1jbqEgvJ6FjKD4/ejAvFxTP0Ds9hhPOv8SK17E6n4ylyFcF2nF1PJ35yTP4
fw0REg2Ur/HveM50GWWHwOtOw0ZCXBYkLiZI3G9NCnCxKDEUZtGUp/d9s5rqG/Mv
Pe227cH2uqBtW9Al/T/Rt270Do111LuZXR7r+fSVqzWqNW4UTl8K8BVVZiEcQwr8
OtimcQKBgQDA89/hs2noJyZ0PvPXy0bcT6ZAiSHOffiiC0hImAFZKN70/9B5GK/T
Iv0r1L9lYIH7NINDE5ihvCUEmV49ZRiyrb4ItNpITn23pfey8flsM+WV2GhZeLuw
/caXthrpLwJ+CMo0u+k4MEWnfuzd7g4jFZ5v7ItmcpvwGRuNQrBjnwKBgQCMAYZf
LpDpSdkGSHUNkFkGI6chnoIqqYmPbPWrBgUTddHzNKDM6vyhnPCW4mTHLq4GHz/g
4Ohz+qLx7I+IgwS5HzOBCtC72XBLQ1lOBMR+NqTjvibb/xltep2urWDWUfPKd0ip
O71aOSeKc2PvpB50bG5v5s/zlzlue47ma7amTwKBgGeqHpxaEgpCDmzh7YwAkH+I
419Ezb7s+wnEWf92ezL1vGOQlOaalswuviowUOwcX3khC2ycOKKcPJ8t7u25RP2q
TrDKyYOTeAOUzXF8g27Yqv5ImDeJn/1FOs8DbY3eTc581nZihrhDZwjILmZFoZ7D
3K1xPqu544GpW54XOEEtAoGADlHNm4iYu7OY5eKdTkDYSh91ZaPfrltevXOogNCB
zma7jYNxeuQB6Mmzdcs8AX9Nv0SM9QQr4kjdR58pYw37eq+tReKETOJFcP03chpc
uof+P2jgcpnZ0O+8lvQWtnT1WVzv6pc4m7TCzY9Vxlnj34aDmSBjXoe2EQ3EJN8Z
dFMCgYEAlpTm8UaXItdgT462lqSfzVb0mS8RGSvTCG/6exIfxionXQC8XChCzDcj
wbfIhLmc1na44ek7giRNZrRgsEOkj+q9BZw1MMijd4yq/8yFjiR5G/PMUWPz7sa6
uUWlaWmuXpTqhmQVBd8YJPIVd5zbQ3KMgxl6EXEiHmdEri0JnCM=
-----END RSA PRIVATE KEY-----`;

const generateClientJWTToken = (externalUserId) => {
  const jwtToken = jwt.sign(
    {
      externalUserId,
    },
    privateKey,
    { algorithm: 'RS256', expiresIn: '1d', allowInsecureKeySizes: true },
  );

  return jwtToken;
};

module.exports.generateClientJWTToken = generateClientJWTToken;
