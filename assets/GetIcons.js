const targetFolder = './';
const fs = require('fs');
const path = require('path');
let content = 'const pictures = [\n';

fs.readdir(targetFolder + '/album-arts', (err, files) => {
  console.log('files', files);
  files.forEach(file => {
    content +=
      ' {\nartwork: require("../assets/album-arts/' + file + '"),\n},\n';
  });
  content += ' ];\nexport default pictures;';

  fs.writeFile('./picture.js', content, err => {
    if (err) {
      console.error(err);
      return;
    }
  });
});
