const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);
const nightmare = Nightmare({show: true, width: 1080, height: 1080, typeInterval: 10});
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

async function authenticate (fb_username, fb_password) {
  write(`AUTHENTICATING ${fb_username}..`);
  await nightmare
    // Authenticate
    .goto('https://facebook.com/marketplace')
    .insert('#email', fb_username)
    .insert('#pass', fb_password)
    .click('#u_0_2') // "Login"

    // Navigate to marketplace
    .wait(3000) // For some reason if we goto too quickly, we won't be logged in
    .goto('https://facebook.com/marketplace/?ref=bookmark')
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
    .wait('button._54qk._43ff._4jy0._4jy3._4jy1._51sy.selected._42ft')
    .click('button._54qk._43ff._4jy0._4jy3._4jy1._51sy.selected._42ft') // "+ Sell Something"
    .wait('div._4d0f._3-8_._4bl7') // "Item for Sale"
    .click('div._4d0f._3-8_._4bl7') // "Item for Sale" 

    // Fill out form data
    .upload('input[accept="image/*"]', item.images.splice(0, max_images))
    .click('input[placeholder="Select a Category"]') // "Select a Category"
    .then(() => {
      write(`.`);
      // This is a super hacky method to select the category
      exec(`cliclick t:'${item.category}' && cliclick kp:arrow-down && cliclick kp:return && exit`);
      write(`.`);
    })
    .catch(error => console.error);
    write(`..`);

  await nightmare
    .wait(4000)
    .insert('input[placeholder="What are you selling?"]', item.title) // "What are you selling?"
    .insert('input[placeholder="Price"]', item.price) // "Price"
    .click('div[data-testid="status-attachment-mentions-input"]') // "Describe your item (optional)"
    .type('body', `${item.description}\u000d\u000dtags: ${item.tags}`)
    .wait('div._332r > span > button._1mf7._4jy0._4jy3._4jy1._51sy.selected._42ft') // "Post"
    .click('button._1mf7._4jy0._4jy3._4jy1._51sy.selected._42ft') // "Post"
    .wait(() => {
      // Wait until the post window closes before opening a new one
      return document.querySelector('div._4t2a') == null
    })
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
