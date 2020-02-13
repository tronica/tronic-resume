const fs = require('fs');

function replaceInFile(file, text) {
  let data = fs.readFileSync(file).toString();

  data = data.replace(/[\r\n]*\/\/generated:start(.*)\/\/generated:end[\r\n]*/sg, '');
  data = data + "\n\n//generated:start\n";
  data += text
  data = data + "\n//generated:end\n";

  fs.writeFileSync(file, data);
}

module.exports = {
  replaceInFile
};