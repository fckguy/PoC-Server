const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const logExampleOutput = async ({ name, data }) => {
  const baseUrl = process.env.WALLABY_SERVICE_API;
  const baseFolder = baseUrl && baseUrl.includes('localhost') ? 'local-env-tests' : 'server-env-tests';

  const directory = path.join(__dirname, `../outputs/${baseUrl ? `${baseFolder}/` : ''}${name}`);

  await mkdirp(directory);

  const fileName = `${directory}/${dayjs().format()}.json`;

  const content = { baseUrl, timestamp: dayjs().format(), data };

  fs.writeFileSync(fileName, JSON.stringify(content, undefined, 2));

  console.log(content);
};

exports.logExampleOutput = logExampleOutput;
