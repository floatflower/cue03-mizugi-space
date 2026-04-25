const fs = require("fs");
const { has, get } = require("lodash");
const path = require("path");

module.exports = {
  locales: JSON.parse(fs.readFileSync(path.join(__dirname, "src/lib/locale.json"))),
  output: "messages/$LOCALE.json",
  keepRemoved: [],
  defaultValue: (locale, namespace, key, value) => {
    const dictionary = JSON.parse(
      fs.readFileSync(path.join(__dirname, `messages/dictionary/${locale}.json`), "utf8"),
    );
    if (has(dictionary, key)) return get(dictionary, key);
    if (value) return value;
    const last = key.split(".").at(-1);
    return last
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  },
  lexers: {
    jsx: [{ lexer: "JsxLexer", functions: ["t", "t.rich"] }],
    tsx: [{ lexer: "JsxLexer", functions: ["t", "t.rich"] }],
  },
};
