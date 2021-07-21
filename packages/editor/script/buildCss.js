// dependencies
const fs = require('fs');
const postcss = require('postcss');
const atImport = require('postcss-import');

// css to be processed
const css = fs.readFileSync('./src/style/index.css', 'utf8');

// process css
postcss()
  .use(atImport())
  .process(css, {
    // `from` option is needed here
    from: './src/style/index.css',
  })
  .then((result) => {
    const output = result.css;

    console.log(output);
  });
