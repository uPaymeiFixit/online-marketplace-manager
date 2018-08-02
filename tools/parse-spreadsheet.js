const fs_extra = require('fs-extra');
init();
async function init () {
  // Make sure we got a filename on the command line.
  if (process.argv.length < 3) {
    console.log(`Usage: node ${process.argv[1]} SPREADSHEET`);
    process.exit(1);
  }
  const file_path = process.argv[2];
  const tsv = await fs_extra.readFile(file_path, 'utf8');
  const tsv_lines = tsv.split(/\r?\n/);
  tsv_lines.shift(); // Remove header

  const items = [{}];
  for (let i = 0; i < 3; i++) {
    const item_properties = tsv_lines[i].split(/\t/);
    items[i] = {
      file: item_properties[0],
      price: item_properties[1],
      title: item_properties[2],
      description: item_properties[3].replaceAll('  ', '\n\n').replaceAll('\n ', '\n'),
      tags: item_properties[4],
      category: item_properties[5]
    };
  }

  console.log(items);
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};
