const exec = require('await-exec');
const prompts = require('prompts');
require('dotenv').config()

init();

async function init () {
  // const json = `{"price":10, "title": "Indecor Bathroom Sink Set", "description": "Comes with soap dispenser, toothbrush holder, and misc jar for toothpaste or other toiletries", "tags": "home decor decorate bathroom brown ceramic set upaymeifixit"}`;
  const json = await prompt('Enter JSON for sale item: ');
  const item = JSON.parse(json);
  listItem(item);
}

async function listItem (item) {
  // Bring Chrome to foreground
  write('Opening Google Chrome. Tab order should be Craigslist, Facebook Marketplace, Letgo\n');
  await exec(`open -a Google\\ Chrome && exit`, execoutput);

  // write('Creating Craigslist Ad...');
  // await exec(`cliclick kd:cmd kp:num-1 ku:cmd kp:tab t:'${item.title}' kp:tab t:${item.price} kp:tab t:'${process.env.CL_SPECIFIC_LOCATION}' kp:tab t:'${process.env.CL_POSTAL_CODE}' kp:tab t:'${item.description}' kp:return,return t:'  tags: ${item.tags}' kp:tab,tab,tab,tab t:'${process.env.CL_PHONE_NUMBER}' kp:tab,tab t:'${process.env.CL_CONTACT_NAME}' kp:tab t:'${process.env.CL_STREET}' kp:tab t:'${process.env.CL_CROSS_STREET}' kp:tab t:'${process.env.CL_CITY}' kp:tab,space,tab,tab,tab,tab,tab,tab,arrow-down,arrow-down,arrow-down,tab,space,tab,space,tab,tab,tab,space,tab,space,return && sleep 3000 && exit`, execoutput);
  // write('Done!\n');

  // write('Creating Facebook Marketplace Ad...');
  // await exec(`cliclick kd:cmd kp:num-2 ku:cmd kp:tab,tab,tab,tab,tab t:'${item.title}' kp:tab t:'${item.price}' kp:tab,tab,tab t:'${item.description}' kp:return,return t:'  tags: ${item.tags}' && sleep 3000 && exit`);
  // write('Done!\n');

  write('Creating Letgo Ad...');
  await exec(`cliclick kd:cmd kp:num-3 ku:cmd kp:tab t:'${item.title}' kp:tab t:'${item.description}' kp:return,return t:'  tags: ${item.tags}' kp:tab t:'${item.price}' && sleep 3000 && exit`);
  write('Done!\n');
}

function execoutput (error, stdout, stderr) {
    if (stdout) console.log(`stdout: ${stdout}`);
    if (stderr) console.log(`stderr: ${stderr}`);
    if (error) console.log(`exec error: ${error}`);
}

// Get input from user with 'prompts' framework
async function prompt (output_text) {
  const response = await prompts({
      type: 'text',
      name: 'value',
      message: output_text,
      validate: value => validJSON(value) ? true : `JSON failed to parse`
  });
  return response.value;
}

function validJSON (json) {
  try {
    JSON.parse(json);
    return true;
  } catch(err) {
    return false;
  }
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

function write (value) {
  process.stdout.write(value);
}
