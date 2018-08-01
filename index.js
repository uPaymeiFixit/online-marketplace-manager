const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);
const nightmare = Nightmare({show: true, width: 1100, height: 768});
const fs = require('fs');

init();

async function init () {
  // Make sure we got a filename on the command line.
  if (process.argv.length < 5) {
    console.log(`Usage: node ${process.argv[1]} USERNAME PASSWORD FILENAME`);
    process.exit(1);
  }

  const USERNAME = process.argv[2];
  const PASSWORD = process.argv[3];
  const folder = process.argv[4];
  const data = await fs.readFile(`${folder}/info.txt`);
  const info = parseInfo(data);
  postItems(info);
}

async function parseInfo (data) {
  let info = {description: ''};
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

async function postItems (info) {
  await nightmare
    // Authenticate
    .goto('https://facebook.com/marketplace')
    .insert('#email', USERNAME)
    .insert('#pass', PASSWORD)
    .click('#u_0_2') // "Login"

    // Navigate to marketplace
    .wait(3000) // For some reason if we goto too quickly, we won't be logged in
    // .wait('#navItem_1606854132932955')
    .goto('https://facebook.com/marketplace/?ref=bookmark')

    // Create listing
    .click('button._54qk._43ff._4jy0._4jy3._4jy1._51sy.selected._42ft') // "+ Sell Something"
    .wait('div._4d0f._3-8_._4bl7') // "Item for Sale"
    .click('div._4d0f._3-8_._4bl7') // "Item for Sale"

    // Fill out form data (Direct method)
    .evaluate(() => {
      document.querySelector('input[placeholder="Select a Category"]').value = info.category;
      document.querySelector('input[placeholder="What are you selling?"]').value = info.title;
      document.querySelector('input[placeholder="Price"]').value = info.price;

      for (element of document.querySelectorAll('div[id^="placeholder-"]')) {
        if (element.innerHTML == 'Describe your item (optional)') {
          element.innerHTML = info.description;
          return;
        }
      }
    })  

    // // Fill out form data (Nightmare method)
    // // Setting the category this way doesn't work
    // .type('input[placeholder="Select a Category"]', info.category) // "Select a Category"
    // .insert('input[placeholder="What are you selling?"]', info.title) // "What are you selling?"
    // .insert('input[placeholder="Price"]', info.price) // "Price"
    // .click('div[data-testid="status-attachment-mentions-input"]') // "Describe your item (optional)"
    // .insert('body', info.description)
    // .upload('input[accept="image/*"]', `${folder}/photos/example_image_2.jpg`)

    // .end()
    .then(console.log)
    .catch(error => {
      console.error('Search failed:', error)
    });

}
