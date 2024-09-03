import 'dotenv/config';

const { NODE_ENV, JWT_SECRET, JWT_EXPIRATION_IN = '1d', DASHBOARD_JWT_EXPIRATION_IN = '7d' } = process.env;

export const isCronApp = process.env.CRON === 'true';

export const isProduction = NODE_ENV === 'production';

export const isStaging = NODE_ENV === 'staging';

export const isDevelopment = NODE_ENV === 'development';

export const isTest = NODE_ENV === 'test';

export const jwtConstants = {
  secret: `${JWT_SECRET}`,
  expiresIn: JWT_EXPIRATION_IN,
  dashboardExpiresIn: DASHBOARD_JWT_EXPIRATION_IN,
};

export const DATADOG_API_KEY = process.env.DATADOG_API_KEY;

export const ALGO_MINIMUM_BALANCE = Number(process.env.ALGO_MINIMUM_BALANCE || '0.1');

export const HEALTH_CHECK_ORIGIN = process.env.HEALTH_CHECK_ORIGIN || 'http://www.uptimerobot.com/';

const whitelistedDomains = [
  'https://republic.com',
  'https://republic.com/',
  'https://wallaby.cash',
  'https://dashboard.wallaby.cash',
  'https://testnet-dashboard.wallaby.cash',
  'https://qa.r-eng.app',
  'https://qa.r-eng.app/',
  'https://app.gitbook.com',
  HEALTH_CHECK_ORIGIN,
];

if (isStaging || isDevelopment) {
  // add staging origin
  whitelistedDomains.push(
    'https://dev.r-eng.app',
    'https://dev.r-eng.app/',
    'https://autotest.r-eng.app',
    'https://autotest.r-eng.app/',
    'https://qa-monolith.r-eng.app/',
    'https://qa-monolith.r-eng.app',
    'https://dev-monolith.r-eng.app',
    'https://dev-monolith.r-eng.app/',
    'https://autotest-monolith.r-eng.app',
    'https://autotest-monolith.r-eng.app/',
    'https://zeta-monolith.r-eng.app',
    'https://zeta-monolith.r-eng.app/',
    'https://sigma-monolith.r-eng.app',
    'https://sigma-monolith.r-eng.app/',
    'https://gamma-monolith.r-eng.app',
    'https://gamma-monolith.r-eng.app/',
    'https://epsilon-monolith.r-eng.app',
    'https://epsilon-monolith.r-eng.app/',
    'https://delta-monolith.r-eng.app',
    'https://delta-monolith.r-eng.app/',
    'https://sigma.r-eng.app',
    'https://sigma.r-eng.app/',
    'https://zeta.r-eng.app',
    'https://zeta.r-eng.app/',
    'https://omega.r-eng.app',
    'https://omega.r-eng.app/',
    'https://delta.r-eng.app',
    'https://delta.r-eng.app/',
    'https://epsilon.r-eng.app',
    'https://epsilon.r-eng.app/',
    'https://gamma.r-eng.app',
    'https://gamma.r-eng.app/',
    'http://localhost:4200',
    'http://localhost:4200/',
  );
}

if (isDevelopment) {
  // add localhost
  whitelistedDomains.push(
    'http://localhost:3000',
    'http://localhost:3000/',
    'http://localhost:4200',
    'http://localhost:4200/',
  );
}

export const whitelistedOrigins = whitelistedDomains;

const dashboardDomainNames = ['https://dashboard.wallaby.cash', 'https://testnet-dashboard.wallaby.cash'];

if (isStaging || isDevelopment) {
  dashboardDomainNames.push(
    'https://staging-dashboard.wallaby.cash',
    'https://staging-testnet-dashboard.wallaby.cash',
    'https://dev-dashboard.wallaby.cash',
    'https://dev-testnet-dashboard.wallaby.cash',
  );
}

if (isDevelopment) {
  dashboardDomainNames.push('http://localhost:3050');
}

export const dashboardDomainNamesOrigins = dashboardDomainNames;
