/**
 * Copyright 2017, Lecoq Simon (lowlight.fr)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function (global) {
    //Registering
        if (typeof global.Lowlight === "undefined") { global.Lowlight = {} }
        if ((typeof module === "object")&&(typeof module.exports === "object")) { module.exports = global.Lowlight }

    //Includes
        /* #include <Life/Configuration.js> */
        /* #include <Life/Life.js> */

        /* #include <World/Biome.js> */
        /* #include <World/World.js> */

        /* #include <Entity/Entity.js> */
        /* #include <Entity/Entity.Indicator.js> */
        /* #include <Entity/Entity.Manager.js> */

        /* #include <Entity/Flora/BerryTree.js> */
        /* #include <Entity/Flora/Trees/OranTree.js> */
        /* #include <Entity/Flora/Trees/SitrusTree.js> */

        /* #include <Entity/Foods/Food.js> */

        /* #include <Entity/Foods/Pokeblocks/Pokeblock.js> */

        /* #include <Entity/Flora/Berry.js> */
        /* #include <Entity/Foods/Berries/OranBerry.js> */
        /* #include <Entity/Foods/Berries/SitrusBerry.js> */

        /* #include <Entity/Fauna/Creature.js> */
        /* #include <Entity/Fauna/Creature.Input.js> */
        /* #include <Entity/Fauna/Creature.Output.js> */
        /* #include <Entity/Fauna/Creature.Egg.js> */

        /* #include <Entity/Fauna/Pokemons/Magicarpe.js> */
        /* #include <Entity/Fauna/Pokemons/Evoli.js> */

        /* #include <Entity/Fauna/Actions/Creature.attack.js> */
        /* #include <Entity/Fauna/Actions/Creature.eat.js> */
        /* #include <Entity/Fauna/Actions/Creature.flee.js> */
        /* #include <Entity/Fauna/Actions/Creature.follow.js> */
        /* #include <Entity/Fauna/Actions/Creature.hunt.js> */
        /* #include <Entity/Fauna/Actions/Creature.move.js> */
        /* #include <Entity/Fauna/Actions/Creature.protect.js> */
        /* #include <Entity/Fauna/Actions/Creature.reproduce.js> */
        /* #include <Entity/Fauna/Actions/Creature.sleep.js> */
        /* #include <Entity/Fauna/Actions/Creature.wander.js> */

        //Create PIXI View
            let app = new PIXI.Application(800, 800, {transparent:true})
            $(".app-view").append(app.view)
            app.renderer.backgroundColor = 0xC0C0C0

        //Load textures
            PIXI.loader.add("src/sprites.json").load(function () {
                Life.init()
                window.life = Life.start(app)

                $(".app-controller [name=indicators]").on("change", function () {
                  parseInt($(this).val()) ? life.entities.show_indicators() : life.entities.hide_indicators()
                })

                $(".app-controller [name=sight]").on("change", function () {
                  life.entities.list.forEach(e => e instanceof Creature ? e.inputs[parseInt($(this).val()) ? "show" : "hide"]() : null)
                })
            })

        global.Lowlight.CellularAutomation = {Life, Entity}

})(typeof window !== "undefined" ? window : this)
