const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);
const nightmare = Nightmare({
  show: true, 
  width: 1080, 
  height: 1080, 
  typeInterval: 10, 
  waitTimeout: 120000
});
const fs_extra = require('fs-extra');
const path = require('path');
const {exec} = require('child_process');

init();

async function init () {
  // Make sure we got a filename on the command line.
  if (process.argv.length < 6) {
    console.log(`Usage: node ${process.argv[1]} fb_username fb_password path_to_tsv path_to_images [max_images]`);
    process.exit(1);
  }

  const fb_username = process.argv[2];
  const fb_password = process.argv[3];
  const path_to_tsv = process.argv[4];
  const path_to_images = path.resolve(process.argv[5]);
  const max_images = process.argv[6] || 10;

  const items = await parseSpreadsheet(path_to_tsv, path_to_images);
  await authenticate(fb_username, fb_password);
  await postItems(items, max_images);
  write(`PROCESS COMPLETE. EXITING (0)\n`);
}

async function parseSpreadsheet (path_to_tsv, path_to_images) {
  write(`READING TSV AT ${path_to_tsv}..`);
  const tsv_data = await fs_extra.readFile(path_to_tsv, 'utf8');
  const tsv_lines = tsv_data.split(/\r?\n/);
  tsv_lines.shift(); // Remove header
  tsv_lines.pop(); // Remove calculation row
  write(`.DONE!\PROCESSING ${tsv_lines.length} ITEMS:\n\n`);
  const items = [];
  for (i in tsv_lines) {
    const item_properties = tsv_lines[i].split(/\t/);
    write(`FINDING PROPERTIES FOR ${item_properties[0]}:\n\n`);
    items.push({
      file: item_properties[0],
      price: item_properties[1],
      title: item_properties[2],
      description: item_properties[3].replaceAll('  ', '\u000d\u000d').replaceAll('\u000d ', '\u000d'),
      tags: item_properties[4],
      category: item_properties[5],
      images: await getImages(path_to_images, item_properties[0])
    });
    console.log(items[items.length - 1]);
    write(`\n`);
  }
  return items;
}

async function getImages (path_to_images, item_folder) {
  const photos_path = `${path_to_images}/${item_folder}/Photos`;
  const images = await fs_extra.readdir(photos_path);
  for (i in images) {
    if (images[i] == '.DS_Store' || 
        (!images[i].endsWith('.png') &&
        !images[i].endsWith('.PNG') &&
        !images[i].endsWith('.jpg') &&
        !images[i].endsWith('.JPG') &&
        !images[i].endsWith('.jpeg') &&
        !images[i].endsWith('.JPEG'))
    ) {
      images.splice(i, 1);
    }
    images[i] = `${photos_path}/${images[i]}`;
  }
  return images;
}

// authenticate using Facebook
// async function authenticate (username, password) {
//   write(`AUTHENTICATING ${username}..`);
//   await nightmare

//     // Authenticate
//     .useragent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36')
//     .goto('https://letgo.com/')
//     .click('button[data-test="login"]') // "Log In"
//     .wait(3000)
//     .click('button[data-test="login-facebook"]')
//     .wait(3000)
//     .then(() => {
//       // This is a super hacky method to log in using the popup
//       exec(`cliclick t:${username} kp:tab t:${password} kp:enter`);
//     })
//     .catch(error => console.error);

//   await nightmare
//     // .insert('#email', username)
//     // .insert('#pass', password)
//     // .click('#loginbutton')
//     .wait('div.avatar') // Wait for captcha to be completed by user
//     .catch(error => console.error);
//   write('.DONE!\n');
// }

// Authenticate using email and password
async function authenticate (username, password) {
  write(`AUTHENTICATING ${username}..`);
  await nightmare

    // Authenticate
    .useragent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36')
    .goto('https://letgo.com/')
    .click('button[data-test="login"]') // "Log In"
    .click('button[data-test="login-email"]') // "Log In"
    .insert('input[data-test="login-input-email"]', username)
    .insert('input[data-test="login-input-password"]', password)

    .wait('button[data-test="login-email-submit"]') // "Log In"
    .wait(3000)
    .click('button[data-test="login-email-submit"]') // "Log In"
    .wait('div.avatar') // Wait for captcha to be completed by user
    .catch(error => console.error);
  write('.DONE!\n');
}

async function postItems (items, max_images) {
  write(`\nPOSTING ${items.length} ITEMS:\n`);
  for (let i = 0; i < items.length; i++) {
    await postItem(items[i], max_images);
  }
}

async function postItem (item, max_images) {
  write(`\nPOSTING ITEM:\n\n`);
  console.log(item);

  write(`\nFILLING OUT FORM..`);
  await nightmare
    // Create listing
    .click('button[data-test="sell-your-stuff-button"]') // "Sell Your Stuff"
    .upload('input[name="dropzone-input"]', item.images[0])
    
    .wait(3000) // "wait for animation to finish"
    .wait('input[name="price"]') // "Price"
    
    // .wait(2001)
    .click('button[data-test="confirm-sell-button"]')  // "Done"

    .wait(6000) // wait for publication to finish
    .wait('div.full-height.flex.justify-center.items-center.flex-column > button') // "Add more details"
    .click('div.full-height.flex.justify-center.items-center.flex-column > button') // "Add more details"
    
    .wait(5001) // wait for animation to finish
    .wait('input[name="dropzone-input"]')
    .upload('input[name="dropzone-input"]', item.images.splice(1, max_images))
    
    .wait(2000)
    .type('input[name="name"]', item.title)
    .type('textarea[name="description"]', `${item.description}\n\ntags: ${item.tags}`)
    .type('input[name="price"]', item.price) // "Price"
    
    // .wait(500)
    
    .wait(2001)
    .click('div.flex.items-center.my2 > button') // "Save changes"
    
    .wait(() => {
      // Wait until the post window closes before opening a new one
      return document.getElementById('dialog') == null
    })
    .wait(3000)
    .catch(error => console.error);
  write(`..DONE!\n`);
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

function write (value) {
  process.stdout.write(value);
}
