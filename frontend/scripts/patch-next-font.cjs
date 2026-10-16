const fs = require("fs");
const path = require("path");

const loaderPath = path.join(
  __dirname,
  "../node_modules/next/dist/compiled/@next/font/dist/google/loader.js"
);

if (fs.existsSync(loaderPath)) {
  let content = fs.readFileSync(loaderPath, "utf8");
  if (content.includes("const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];")) {
    content = content.replace(
      "const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];",
      'const ext = (/\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl) || [null, "woff2"])[1];'
    );
    fs.writeFileSync(loaderPath, content);
    console.log("Patched next/font/google loader with URL fallback");
  }
}
