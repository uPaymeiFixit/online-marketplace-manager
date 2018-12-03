const exec = require('await-exec');
const prompts = require('prompts');
require('dotenv').config()

init();

async function init () {
  while (true) {
    // const json = `{"price":10, "title": "Indecor Bathroom Sink Set", "description": "Comes with soap dispenser, toothbrush holder, and misc jar for toothpaste or other toiletries", "tags": "home decor decorate bathroom brown ceramic set upaymeifixit"}`;
    const json = await prompt('Enter JSON for sale item: ');
    const item = JSON.parse(json);

    // include default item description if there is none
    item.description = item.description || 'Please contact for more details.';
    await listItem(item);
  }
}

async function listItem (item) {
  // Bring Chrome to foreground
  write('Opening Google Chrome. Tab order should be Craigslist, Facebook Marketplace, Letgo\n');
  await exec(`open -a Google\\ Chrome && sleep 1 && exit`, execoutput);

  await craigslist(item);
  await facebook(item);
  await letgo(item);
  setTimeout(alert, 500);
  setTimeout(alert, 700);
  setTimeout(alert, 900);
  
}

function alert () {
  write('\u0007');
}

async function craigslist (item) {
  write('Creating Craigslist Ad...');
  // Switch to tab 1 (Craigslist)
  await exec(`cliclick kd:cmd kp:num-1 ku:cmd && sleep 1 && exit`, execoutput);
  // Input title, price, location, and zip
  await exec(`cliclick kp:tab t:'${item.title}' kp:tab t:${item.price} kp:tab t:'${process.env.CL_SPECIFIC_LOCATION}' kp:tab t:'${process.env.CL_POSTAL_CODE}' kp:tab && exit`, execoutput);
  // Input description with returns
  await typeWithReturns(item.description); 
  // Input tags
  await exec(`cliclick kp:return,return t:'  tags: ${item.tags}' kp:tab,tab,tab,tab t:'${process.env.CL_PHONE_NUMBER}' kp:tab,tab t:'${process.env.CL_CONTACT_NAME}' kp:tab t:'${process.env.CL_STREET}' kp:tab t:'${process.env.CL_CROSS_STREET}' kp:tab t:'${process.env.CL_CITY}' kp:tab,space,tab,tab,tab,tab,tab,tab,arrow-down,arrow-down,arrow-down,tab,space,tab,space,tab,tab,tab,space,tab,space,return && sleep 3 && exit`, execoutput);
  write('Done!\n\u0007');
}

async function facebook (item) {
  write('Creating Facebook Marketplace Ad...');
  // Switch to tab 2 (Facebook Marketplace)
  await exec(`cliclick kd:cmd kp:num-2 ku:cmd && sleep 1 && exit`, execoutput);
  // Input title and price
  await exec(`cliclick kp:tab,tab,tab,tab,tab t:'${item.title}' kp:tab t:'${item.price}' kp:tab,tab,tab && exit`);
  // Input description with returns
  await typeWithReturns(item.description);
  // Input tags
  await exec(`cliclick kp:return,return t:'  tags: ${item.tags}' && sleep 3 && exit`, execoutput)
  write('Done!\n\u0007');
}

async function letgo (item) {
  write('Creating Letgo Ad...');
  // Switch to tab 3 (Letgo)
  await exec(`cliclick kd:cmd kp:num-3 ku:cmd && sleep 1 && exit`, execoutput);
  // Input title
  await exec(`cliclick kp:tab t:'${item.title}' kp:tab && exit`, execoutput);
  // Input description with returns
  await typeWithReturns(item.description);
  // Input tags and price
  await exec(`cliclick kp:return,return t:'  tags: ${item.tags}' kp:tab t:'${item.price}' && sleep 3 && exit`, execoutput);
  write('Done!\n\u0007');
}

// Types the given parameter including \n characters
async function typeWithReturns (text) {
  text = text.split("\n");
  for (t of text) {
    if (t == "") {
      await exec(`cliclick kp:return && exit`, execoutput);
    } else {
      await exec(`cliclick t:'${t}' kp:return && exit`, execoutput);
    }
  }
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
