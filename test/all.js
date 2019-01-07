
const uif2json = require('../src/lib/uif2json');
const json2uif = require('../src/lib/json2uif');
const fs = require('fs');
const path = require('path');
const UIF_DIR = 'C:\\ko\\SexyKO\\UI_UNPACK';

const skip = [
  'ka_page_quest_us.uif',
  'ka_page_quest.uif',
  'ka_hotkey_us.uif',
  'ka_hotkey.uif',
  'ka_characterselect.uif',
  'ka_characterselect_us.uif',
  'ka_change_us.uif',
  'ka_change.uif',
  'ka_page_friends.uif',
  'ka_page_friends_us.uif',
  'ka_page_knights_union_sub_us.uif',
  'ka_page_knights_union_sub.uif',
  'ka_page_knights_union_main.uif',
  'ka_page_knights_union_main_us.uif',
  'ka_page_clan.uif',
  'ka_page_clan_us.uif',
  'ka_page_knights.uif',
  'ka_page_knights_us.uif',
  'co_login.uif',
  'co_login_us.uif',
  'ka_page_state.uif',
  'ka_page_state_us.uif',
  'ka_partyboard_us.uif',
  'ka_partyboard.uif',
];

fs.readdir(UIF_DIR, async (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files = files
    .filter(x => x.endsWith('.uif') && skip.findIndex(y => y == x) == -1)
    .map(x => {
      let fullPath = path.resolve(UIF_DIR, x);
      return { fullPath, path: x, size: fs.statSync(fullPath).size };
    });
  files.sort((a, b) => a.size - b.size);

  let i = 0;
  let start = Date.now();
  for (let file of files) {
    i++;
    let percent = ((i / files.length * 1000) >>> 0) / 10;
    let buffer = await read(file.fullPath);
    let output;
    try {
      output = uif2json(buffer);
      // console.log(file.path + ' ok! ' + percent + '% size: ' + fileSize(file.size));
    } catch (e) {
      console.error(file.path + ' uif2json failed! ' + percent + '% size: ' + fileSize(file.size));
      console.error(e);
      process.exit(1);
    }

    try {
      let outputBuffer = json2uif(output);

      if (outputBuffer.length != buffer.length) {
        throw new Error('lengths are not match');
      }
      // console.log(file.path + ' ok! ' + percent + '% size: ' + fileSize(file.size));
    } catch (e) {
      console.error(file.path + ' json2uif failed! ' + percent + '% size: ' + fileSize(file.size));
      console.error(e);
      process.exit(1);
    }
  }
  let timeDifference = (Date.now() - start) / 1000;
  let totalSize = files.reduce((total, x) => total + x.size, 0);
  console.log('all ok! total: ' + files.length + ' | total file size: ' + fileSize(totalSize) + ' | bench: u->j->u | avg speed: ' + fileSize(totalSize / timeDifference * 2) + '/s');
});

function read(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });
}

function fileSize(x) {
  if (x > 1024 * 1024) {
    return (((x / 1024 / 1024 * 10) >>> 0) / 10) + 'mb';
  }

  if (x > 1024) {
    return (((x / 1024 * 10) >>> 0) / 10) + 'kb';
  }

  return x + 'b';
}