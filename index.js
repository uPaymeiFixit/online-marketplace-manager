const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);
const nightmare = Nightmare({show: true, width: 1100, height: 768, typeInterval: 10});
const fs_extra = require('fs-extra');
const path = require('path');
const {exec} = require('child_process');

init();

async function init () {
  // Make sure we got a filename on the command line.
  if (process.argv.length < 5) {
    console.log(`Usage: node ${process.argv[1]} USERNAME PASSWORD FILENAME`);
    process.exit(1);
  }

  const USERNAME = process.argv[2];
  const PASSWORD = process.argv[3];
  const folder = path.resolve(process.argv[4]);
  const data = await fs_extra.readFile(`${folder}/info.txt`, 'utf8');
  const info = await parseInfo(data);
  const images = await getImages(folder);
  postItems(USERNAME, PASSWORD, info, images);
}

async function getImages (folder) {
  const images = await fs_extra.readdir(`${folder}/photos/`);
  for (i in images) {
    if (images[i] == '.DS_Store') {
      images.splice(i, 1);
    }
    images[i] = `${folder}/photos/${images[i]}`;
  }
  return images;
}

async function parseInfo (data) {
  const info = {description: ''};
  const lines = data.split(/\r?\n/);
  for (i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case '{{PRICE}}': info.price = lines[++i]; break;
      case '{{TITLE}}': info.title = lines[++i]; break;
      case '{{CATEGORY}}': info.category = lines[++i]; break;
      case '{{DESCRIPTION}}': 
        while (!lines[i + 1].match(/{{.*}}/)) {
          info.description += `${lines[++i]}\n`;
        }
        break;
      case '{{TAGS}}': info.tags = lines[++i]; break;
    }
  }
  return info;
}

async function postItems (USERNAME, PASSWORD, info, images) {
  await nightmare
    // Authenticate
    .goto('https://facebook.com/marketplace')
    .insert('#email', USERNAME)
    .insert('#pass', PASSWORD)
    .click('#u_0_2') // "Login"

    // Navigate to marketplace
    .wait(3000) // For some reason if we goto too quickly, we won't be logged in
    .goto('https://facebook.com/marketplace/?ref=bookmark')

    // Create listing
    .wait('button._54qk._43ff._4jy0._4jy3._4jy1._51sy.selected._42ft')
    .click('button._54qk._43ff._4jy0._4jy3._4jy1._51sy.selected._42ft') // "+ Sell Something"
    .wait('div._4d0f._3-8_._4bl7') // "Item for Sale"
    .click('div._4d0f._3-8_._4bl7') // "Item for Sale" 

    // Fill out form data
    .upload('input[accept="image/*"]', images)
    .click('input[placeholder="Select a Category"]') // "Select a Category"
    .then(() => {
      // This is a super hacky method to select the category
      exec(`cliclick t:'${info.category}' && cliclick kp:arrow-down && cliclick kp:return && exit`);
    })
    // .catch(error => console.error);

  await nightmare
    .wait(3000)
    .insert('input[placeholder="What are you selling?"]', info.title) // "What are you selling?"
    .insert('input[placeholder="Price"]', info.price) // "Price"
    .click('div[data-testid="status-attachment-mentions-input"]') // "Describe your item (optional)"
    .type('body', info.description)
    .wait('button._1mf7._4jy0._4jy3._4jy1._51sy.selected._42ft')
    .click('button._1mf7._4jy0._4jy3._4jy1._51sy.selected._42ft')
    .catch(error => console.error);
}
