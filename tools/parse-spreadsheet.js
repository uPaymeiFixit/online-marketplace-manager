const fs_extra = require('fs-extra');
init();
async function init () {
  // Make sure we got a filename on the command line.
  if (process.argv.length < 3) {
    console.log(`Usage: node ${process.argv[1]} SPREADSHEET`);
    process.exit(1);
  }
  const item_info = [{}];
  const path = process.argv[2];
  const tsv = await fs_extra.readFile(path, 'utf8');
  const item_line = tsv.split(/\r?\n/);
  for (let i = 1; i < 3; i++) {
    const parts = item_line[i].split(/\t/);
    item_info[i] = {
      file: parts[0],
      price: parts[1],
      title: parts[2],
      description: parts[3],
      tags: parts[4],
      category: parts[5]
    };
  }

  console.log(item_info);

  // for (let i = 1; i < items.length; i++) {
  //   const data = await fs_extra.readFile(`${folder}/${items[i]}/info.txt`, 'utf8');
  //   console.log(await parseInfo(items[i], data));
  // }
}

async function parseInfo (item, data) {
  const lines = data.split(/\r?\n/);
  let description = '';
  for (let i = 5; lines[i] != '{{tags}}'; i++) {
    description += lines[i] + '\n';
  }
  description = description.trim().replaceAll('\n', 'char(10)');

  return `${item}; ${lines[1]}; ${lines[3]}; ${description}; ${lines[lines.length - 2]}`;
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};
