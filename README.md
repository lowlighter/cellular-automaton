# Cellular automaton
This library is a template for **Projects**.

* [Live demo](https://lowlighter.github.io/cellular-automaton/demo/)
* [Documentation](https://lowlighter.github.io/cellular-automaton/docs/)
* [About](https://lowlight.fr/en/blog/cellular-automaton)


# Features
* Make your **dreams** alive !



## Getting Started
First of all, you'll need to include the library :
```html
    <script src="./bin/lowlight.automaton.js"></script>
```

You may include the minified library instead :
```html
    <script src="./bin/lowlight.automaton.min.js"></script>
```

Then you may create alias for convenience :
```javascript
    let Life = Lowlight.CellularAutomation.Life
```

## Usage

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.


## Project content
|            |                             |
| ---------- | --------------------------- |
| **/bin**   | Live and dev scrripts files |
| **/src**   | Source files                |
| **/demo**  | Demo and codes examples     |
| **/docs**  | Documentation               |

## Rebuild project and expanding the library
You'll need to run the following command the first time to install dependencies.
```shell
npm install
```

Then to rebuild project, just run the following command :
```shell
npm run build
```

This will update `/bin` files with included `/src` files.
Although `package.json` (which contains `"source" and "output"` paths) are preconfigured, you may need to reconfigure them if you're planning to expand this library.

To include a file just use the following syntax in the `"source"` file :
```javascript
    /* #include <path/to/file.js> */
```

* File minification is performed with [Babel minify](https://github.com/babel/minify).
* Documentation is generated with [JSDoc 3](https://github.com/jsdoc3/jsdoc).

Although `package.json` (which contains `"jsdoc_source", "jsdoc_output", "jsdoc_config" and "jsdoc_readme"`) and `docs/categories.json` are preconfigured, you may need to reconfigure them if you're planning to expand this library.

## License
This project is licensed under the MIT License.

See [LICENSE.md](https://github.com/lowlighter/cellular-automaton/blob/master/LICENSE.md) file for details.
