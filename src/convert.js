// convert-json-to-scss.js
const fs = require("fs");

const json = JSON.parse(fs.readFileSync("src/examples.json", "utf8"));
let scss = "";

for (const [key, value] of Object.entries(json)) {
  scss += `--${key}: ${value};\n`;
}

fs.writeFileSync("_variables.scss", scss);
