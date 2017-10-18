# Cellular automaton
This library contains a complex cellular automaton which simulates a complete ecosystem, including universe, fauna and flora.
It has no special purpose except the pleasure of watching it.

* [Live demo](https://lowlighter.github.io/cellular-automaton/demo/)
* [Documentation](https://lowlighter.github.io/cellular-automaton/docs/)
* [About](https://lowlight.fr/en/blog/cellular-automaton)

![Image of cellular automaton](https://github.com/lowlighter/cellular-automaton/raw/master/demo/imgs/demo.gif)

# Features
* **Deterministic** simulation of life based on PRNG
* A complete **procedurally generated** universe
    * 15 differents **biomes**
    * **Day and night** cycles
    * **Weather**
* **Flora** simulation
    * **Berry trees** growth and harvests
    * Delicious **berries** with multiple effects
* **Fauna** simulation
    * **Predators and preys** system
    * Huge **genome** statistics
    * Unique **behavior**, only the smartest creatures will survive !
    * **Reproduction**

*Nota Bene : This is a project under development, features listed above may not be implemented yet.*

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

### Dependancies

This library requires the following libraries :
* [lowlighter/astar](https://github.com/lowlighter/astar)
* [lowlighter/random](https://github.com/lowlighter/random)
* [lowlighter/quadtree](https://github.com/lowlighter/quadtree)
* [pixi.js](https://github.com/pixijs/pixi.js/)
* [noise.js] (based on Stefan Gustavson)

These are already included in `demo/js` folder.

## Usage

Just include the following html structure :

```html
    <div class="app">
        <div class="app-view"></div>
        <button type="button" id="cellular-automaton-start-button"></button>
    </div>
```

Then, as it's a cellular automaton the only thing you can do is watching it evoling :)

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
