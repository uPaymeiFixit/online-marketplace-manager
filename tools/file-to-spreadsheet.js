const fs_extra = require('fs-extra');
init();
async function init () {
  // Make sure we got a filename on the command line.
  if (process.argv.length < 3) {
    console.log(`Usage: node ${process.argv[1]} DIRECTORY`);
    process.exit(1);
  }

  const folder = process.argv[2];
  const items = await fs_extra.readdir(folder);
  for (let i = 1; i < items.length; i++) {
    const data = await fs_extra.readFile(`${folder}/${items[i]}/info.txt`, 'utf8');
    console.log(await parseInfo(items[i], data));
  }
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
