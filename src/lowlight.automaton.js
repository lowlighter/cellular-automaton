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
        let Container = PIXI.Container
        let Sprite = PIXI.Sprite
        let ParticleContainer = PIXI.ParticleContainer
        let Graphics = PIXI.Graphics
        let Quadtree = Lowlight.Quadtree
        let Random = Lowlight.Random
        let Texture = PIXI.Texture

        Math.PI_2 = Math.PI * 2

        function AnimatedTexture(frame) {
            let i = 0, textures = []
            while (`${frame}_${i}.png` in PIXI.utils.TextureCache) { textures.push(PIXI.Texture.fromFrame(`${frame}_${i++}.png`)) }
            return textures.length ? textures : [PIXI.Texture.EMPTY]
        }

        function AnimatedSprite(frame) {
            return new PIXI.extras.AnimatedSprite(AnimatedTexture(frame))
        }

        /* #include <Life/Life.js> */
        /* #include <World/Biome.js> */
        /* #include <World/World.js> */
        /* #include <Entity/Entity.js> */
        /* #include <Entity/Entity.Indicator.js> */
        /* #include <Entity/Entity.Manager.js> */
        /* #include <Entity/Foods/Food.js> */
        /* #include <Entity/Flora/BerryTree.js> */
        /* #include <Entity/Flora/Berry.js> */
        /* #include <Entity/Flora/Trees/OranTree.js> */
        /* #include <Entity/Flora/Trees/SitrusTree.js> */
        /* #include <Entity/Flora/Berries/OranBerry.js> */
        /* #include <Entity/Flora/Berries/SitrusBerry.js> */

        /* #include <Entity/Fauna/Creature.js> */

        $(function () {
            //Create PIXI View
                let app = new PIXI.Application(800, 800, {transparent:true})
                $(".app-view").append(app.view)
                window.app = app

            //Load textures
                PIXI.loader.add("/src/cellular-automaton/demo/sprites.json").load(function () {
                    Life.init()
                    new Life(app)
                })

        })



        global.Lowlight.CellularAutomation = {Life, Entity}

})(typeof window !== "undefined" ? window : this)
