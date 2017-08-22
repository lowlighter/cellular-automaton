class World {
    /**
     * Create a new world.
     * @param {Life} life - Life instance
     * @param {Object} [options] - Options
     * @param {Number} [options.cell_size] - Cell size
     * @param {Number} [options.seed] - Seed for generation
     * @category world
     */
        constructor(life, options) {
            /**
             * Life instance reference.
             * @readonly
             * @type {Life}
             */
                this.life = life

            /**
             * Cells textures container.
             * @readonly
             * @type {PIXI.Container}
             */
                this.container = this.life.stage.addChild(new Container())

            /**
             * Cells size in pixels.
             * @readonly
             * @type {Number}
             */
                this.cell_size = options.cell_size

            /**
             * Map containing cells data.
             * @private
             * @type {Map}
             */
                this.map = new Map()
                this._map = new Map()

            //Generate map
                this.generate(options.seed)
                this.postprocessing()
                this.container.cacheAsBitmap = true
        }

    /**
     * Retrieve Biome stored in map on a given location.
     * @param {Number} x - X
     * @param {Number} y - Y
     * @param {Boolean} [previous=false] - If set, will return previous stored biome
     * @return {Biome} Biome stored in [x, y] pair key
     */
        get(x, y, previous = false) {
            return previous ? this._map.get(`${x}_${y}`) : this.map.get(`${x}_${y}`)
        }

    /**
     * Retrieve Biome stored in map with its 8 neighbors.
     * @param {Number} x - X
     * @param {Number} y - Y
     */
        gets(x, y) {
            let world = this
            return {
                get c0() { return world.get(x  , y  ) },
                get c1() { return world.get(x-1, y-1) },
                get c2() { return world.get(x  , y-1) },
                get c3() { return world.get(x+1, y-1) },
                get c4() { return world.get(x+1, y  ) },
                get c5() { return world.get(x+1, y+1) },
                get c6() { return world.get(x  , y+1) },
                get c7() { return world.get(x-1, y+1) },
                get c8() { return world.get(x-1, y  ) }
            }
        }

    /**
     * Set a Biome in map on a given location.
     * @param {Number} x - X
     * @param {Number} y - Y
     * @param {Biome} Biome - Biome to store in [x, y] pair key
     */
        set(x, y, value) {
            this.map.set(`${x}_${y}`, value)
        }

    /**
     * Populate world.
     */
        populate() {
            console.warn("World.populate is hard-coded")
            //this.life.entities.create(OranTree, {x:250, y:450})
            //this.life.entities.create(SitrusTree, {x:250, y:350})
            window.test = this.life.entities.create(Creature, {x:50, y:50})
        }

    /**
     * Generate a new world map.
     * @param {Number} [seed] - Seed
     */
        generate(seed) {
            //Seed
                seed =  0.7701236501068505
                noise.seed(seed)
            //Generate
                for (let i = 0; i < Biome.MAX_ELEVATION; i++) { this._generate_level(i) }
            //Display textures
                this._generate_add_textures()
        }

    /**
     * <pre>
     * Generate a level of world map.
     * Should be called only by [World.generate]{@link World#generate} or one of its sub-methods.
     * </pre>
     * @private
     * @param {Number} lv - Elevation level
     */
        _generate_level(lv) {
            //Copy old map
                this._map = new Map(this.map)
            //Rough generation
                for (let x = -1; x <= this.x; x++) { for (let y = -1; y <= this.y; y++) {
                    //Generate a new biome and check eligibility
                        let b = this._generate_at(lv, x, y)
                        if (this._generate_is_eligible(b, x, y)) { this.set(x, y, b) }
                } }

            //Remove isolated cells
                let updated = 0, breaker = 0
                do {
                    //New iteration
                        updated = 0
                        for (let x = 0; x < this.x; x++) { for (let y = 0; y < this.y; y++) {
                            //Check if cell is isolated
                                let r = this._generate_is_isolated(x, y)
                                if ((r.c0.elevation > 0)&&(r.isolated)) {
                                    //Replacement by fusion with neighbors
                                        if ((r.isolated)&&(r.d812)) { this.set(x, y, r.c1) }
                                        if ((r.isolated)&&(r.d234)) { this.set(x, y, r.c3) }
                                        if ((r.isolated)&&(r.d456)) { this.set(x, y, r.c5) }
                                        if ((r.isolated)&&(r.d678)) { this.set(x, y, r.c7) }
                                    //Replacement by elevation difference
                                        if ((r.isolated)&&(!r.c8X)&&(r.r8X)) { this.set(x, y, r.r8X) }
                                        if ((r.isolated)&&(!r.c2X)&&(r.r2X)) { this.set(x, y, r.r2X) }
                                        if ((r.isolated)&&(!r.c4X)&&(r.r4X)) { this.set(x, y, r.r4X) }
                                        if ((r.isolated)&&(!r.c6X)&&(r.r6X)) { this.set(x, y, r.r6X) }
                                    //Default Replacement if still isolated
                                        if ((r.isolated)&&(r.r0X)) { this.set(x, y, r.r0X)}
                                        if (r.isolated) { this.set(x, y, this.get(x, y, true)) }
                                    //Update counter
                                        updated++
                                }
                        } }
                } while ((updated > 0)&&(breaker++ < 10))
        }

    /**
     * <pre>
     * Find a biome for one of world's map cell.
     * Should be called only by [World.generate]{@link World#generate} or one of its sub-methods.
     * </pre>
     * @private
     * @param {Number} lv - Elevation level
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     */
        _generate_at(lv, x, y) {
            //Computing climate parameter
                x /= this.x ; y /= this.y
                let weights = [1, 2, 4, 8], weights_sum = weights.reduce((w, v) => w + 1/v, 0)
                let c = weights.reduce((w, v) => w + 0.5*(1/v)*(1 + noise.simplex2(v * (x + lv), v * (y + lv))), 0) / weights_sum
            //Biome type
                return Biome.type(lv, c)
        }

    /**
     * <pre>
     * Tell if cell is isolated and find possible replacement for it.
     * Should be called only by [World.generate]{@link World#generate} or one of its sub-methods.
     * </pre>
     * @private
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     */
        _generate_is_isolated(x, y) {
            let world = this
            return $.extend({
                //Check if 3 consecutives cells are same biome type
                // X O O    Here d234 is true, regardless of i type
                // X i O    However d456 is missing cell 5 to be true
                // X O X
                    get d812() { return this.c1.same(this.c8) && this.c2.same(this.c8) },
                    get d234() { return this.c3.same(this.c2) && this.c4.same(this.c2) },
                    get d456() { return this.c5.same(this.c4) && this.c6.same(this.c4) },
                    get d678() { return this.c7.same(this.c6) && this.c8.same(this.c6) },

                //Check if 3 consecutives cells AND current cell are same biome type
                //See previous schema, i must be same type as the serie
                    get c812() { return this.c8.same(this.c0) && this.d812 },
                    get c234() { return this.c2.same(this.c0) && this.d234 },
                    get c456() { return this.c4.same(this.c0) && this.d456 },
                    get c678() { return this.c6.same(this.c0) && this.d678 },
                //Check if any of previous conditions are satisfied
                    get cXXX() { return this.c812 || this.c234 || this.c456 || this.c678 },

                //Check if there aren't isolated direct neighbors
                // X O O    Here c2X and c4X are true, because c234 is satisfied
                // X O O    c8X is also satisfied because it isn't the same type as i
                // X O X    However c6X isn't because it start a serie without making a 3 consecutive one
                    get c8X() { return this.c8.same(this.c0) ? this.c678 || this.c812 : true },
                    get c2X() { return this.c2.same(this.c0) ? this.c812 || this.c234 : true },
                    get c4X() { return this.c4.same(this.c0) ? this.c234 || this.c456 : true },
                    get c6X() { return this.c6.same(this.c0) ? this.c456 || this.c678 : true },
                //Check if all previous conditions are satisfied
                    get cXX() { return this.c8X && this.c2X && this.c4X && this.c6X },

                //Replacements if cXX isn't satisfied
                    get r8X() { return this.rXX([this.c6, this.c7, this.c1, this.c2]) },
                    get r2X() { return this.rXX([this.c8, this.c1, this.c3, this.c4]) },
                    get r4X() { return this.rXX([this.c2, this.c3, this.c5, this.c6]) },
                    get r6X() { return this.rXX([this.c4, this.c5, this.c7, this.c8]) },
                    get r0X() { return this.rXX([this.c1, this.c2, this.c3, this.c4, this.c5, this.c6, this.c7, this.c8]) },
                    rXX(array) {
                        let b = array.filter(v => v.lower(this.c0))[0] || world._generate_at(this.c0.elevation-1, x, y) || null
                        return world._generate_is_eligible(b, x, y) ? b : null
                    },

                //Tell if cell is isolated
                    get isolated() { return !(this.cXXX && this.cXX) }
            }, this.gets(x, y))
        }

    /**
     * <pre>
     * Tell if cell is isolated and find possible replacement for it.
     * Should be called only by [World.generate]{@link World#generate} or one of its sub-methods.
     * </pre>
     * @private
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     */
        _generate_is_eligible(b, x, y) {
            //Retrieve neighbors
                let r = this.gets(x, y)

            //If no new biome, keep old one
                if (b === null) { return false }
            //If cell hasn't be defined yet, accept new biome
                if (!r.c0) { return true }

            //Elevation difference betweeen old and new biome should be 0 < x <= 1
                if (b.elevation - r.c0.elevation > 1) { return false }
                for (let i = 1; i <= 8; i++) {
                    if ((r[`c${i}`])&&(r[`c${i}`].lower(r.c0))) { return false }
                }

            //Eligible if conditions are satisfied
                return true
        }

    /**
     * <pre>
     * Add cells textures to world's map sprites container.
     * Should be called only by [World.generate]{@link World#generate} or one of its sub-methods.
     * </pre>
     * @private
     */
        _generate_add_textures() {
            for (let x = 0; x < this.x; x++) { for (let y = 0; y < this.y; y++) {
                this._generate_add_texture(x, y)
            } }
        }

    /**
     * <pre>
     * Add a single cell texture to world's map sprites container, based on its neighborhood.
     * Should be called only by [World.generate]{@link World#generate} or one of its sub-methods.
     * </pre>
     * @private
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     */
        _generate_add_texture(x, y) {
            //Retrieve neighborhood and compute elevation texture
                let r = this.gets(x, y), ce = null, cx = null
                let e = Math.min(r.c0.elevation-1, 2)

            //Diagonals
                if (r.c1.lower(r.c0)) { ce = {frame:`E0${e}_5.png`} ; cx = r.c1 }
                if (r.c3.lower(r.c0)) { ce = {frame:`E0${e}_7.png`} ; cx = r.c3 }
                if (r.c5.lower(r.c0)) { ce = {frame:`E0${e}_1.png`} ; cx = r.c5 }
                if (r.c7.lower(r.c0)) { ce = {frame:`E0${e}_3.png`} ; cx = r.c7 }

            //Laterals
                if (r.c4.lower(r.c0)) { ce = {frame:`E0${e}_8.png`} ; cx = r.c4 }
                if (r.c8.lower(r.c0)) { ce = {frame:`E0${e}_4.png`} ; cx = r.c8 }
                if (r.c6.lower(r.c0)) { ce = {frame:`E0${e}_2.png`} ; cx = r.c6 }
                if (r.c2.lower(r.c0)) { ce = {frame:`E0${e}_6.png`} ; cx = r.c2 }

            //Corners (frame may be changed according to middle cell of corner)
                if (r.c8.lower(r.c0) && r.c2.lower(r.c0)) { ce = {frame:`E0${e}_1b.png`} ; cx = r.c1.lower(r.c0) ? r.c1 : r.c8 }
                if (r.c6.lower(r.c0) && r.c8.lower(r.c0)) { ce = {frame:`E0${e}_7b.png`} ; cx = r.c7.lower(r.c0) ? r.c7 : r.c6 }
                if (r.c2.lower(r.c0) && r.c4.lower(r.c0)) { ce = {frame:`E0${e}_3b.png`} ; cx = r.c3.lower(r.c0) ? r.c3 : r.c2 }
                if (r.c4.lower(r.c0) && r.c6.lower(r.c0)) { ce = {frame:`E0${e}_5b.png`} ; cx = r.c5.lower(r.c0) ? r.c5 : r.c4 }

            //Add base texture
                this.tile(x, y, r.c0.frame)

            //Add elevation texture (if exists)
                if (ce) {
                    this.tile(x, y, ce.frame)
                    //Add complementary cell texture (if exists)
                        if (cx) {
                            let p = this.tile(x, y, cx.frame)
                            let m = p.addChild(new Sprite(this.life.app.renderer.generateTexture(new Sprite.fromFrame(ce.frame.replace(/\.png/, "m.png")))))
                            p.mask = m
                        }
                }
        }

    /**
     * Place a tile at given coordinates.
     * @private
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     * @param {String} frame - Frame name
     */
        tile(x, y, frame) {
            //Create sprite
                let s = this.container.addChild(new Sprite.fromFrame(frame))
                s.width = s.height = this.cell_size
                s.position.set(x*s.width, y*s.height)
                s.alpha = frame === "BXX_X.png" ? 0.8 : 1
            //Return
                return s
        }

    /**
     *
     */
        postprocessing() {
            //TODO TODO TODO
            console.warn("World.postprocessing is not implemented yet")
        }

    /**
     * World's width.
     * @type {Number}
     */
        get width() { return this.life.app.view.width }

    /**
     * World's height.
     * @type {Number}
     */
        get height() { return this.life.app.view.height }

    /**
     * World's max X coordinate.
     * @type {Number}
     */
        get x() { return this.width/this.cell_size }

    /**
     * World's max Y coordinate.
     * @type {Number}
     */
        get y() { return this.height/this.cell_size }

    /**
     * Tell if position if outside of world.
     * @param {Object} position - Position containing x and y properties
     * @return {Boolean} True if outside of map
     */
        outside(position) {
            return (position.x < 0)||(position.y < 0)||(position.x > this.width)||(position.y > this.height)
        }
}












/*
//
World.GENERATION = {
PADDING:{x:2, y:2}
}
    get(x, y) {
        return this.map.get(`${x}_${y}`)
    }

    set(x, y, value) {
        this.map.set(`${x}_${y}`, value)
    }

    isset(x, y) {
        return this.map.has(`${x}_${y}`)
    }

    unset(x, y) {
        this.map.delete(`${x}_${y}`)
    }

    generate(X, Y, S) {
        //Rough biome initialization ans smoothing
            this._generate_rough_biomes(X, Y)
            this._generate_grow_biomes(X, Y)
            this._generate_apply_smoothing(S)
            this._generate_apply_cropping()


        //
            for (let x = 0; x < this.x; x++) { for (let y = 0; y < this.y; y++) {
                if (!this.isset(x, y)) continue
                this.tile(x, y, this.get(x, y).frame)
            } }
    }

        _generate_rough_biomes(X, Y) {
            //Rough biome initialization
                let p = World.GENERATION.PADDING
                for (let x = -p.x; x <= X+p.x-1; x++) { for (let y = -p.y; y <= Y+p.y-1; y++) {
                    this.set(x, y, Biome.random())
                } }
        }

        _generate_grow_biomes(X, Y) {
            //Growth biome generation
                while ((X < this.x)||(Y < this.y)) {
                    this._generate_apply_growth_biomes(X, Y)
                    X *= 2 ; Y *= 2
                }
        }

        _generate_apply_growth_biomes(X, Y) {
            //Transfer data i to 2*i
                let p = World.GENERATION.PADDING
                for (let x = X+p.x-1; x >= -p.x/2; x--) { for (let y = Y+p.y-1; y >= p.y/2; y--) {
                    //
                        if ((2*x >= this.x+p.x)||(2*y >= this.y+p.y)) { break }
                    //Transfer
                        this.set(2*x, 2*y, this.get(x, y))
                    //Unset
                        if ((x === 0)&&(y === 0)) { continue }
                        this.unset(x, y)
                } }

            //Filling missing cells
                for (let x = -p.x; x <= 2*(X+p.x-1); x++) { for (let y = -p.y; y <= 2*(Y+p.y-1); y++) {
                    //
                        if ((x >= this.x+p.x)||(y >= this.y+p.y)) { break }
                    //Pass if biome is already determined
                        if (this.isset(x, y)) { continue }
                    //Biome selection betweeen neighbors
                        let b = []
                        if (Math.abs(x) % 2 === 0) { b.push(this.get(x, y-1), this.get(x, y+1)) }
                        if (Math.abs(y) % 2 === 0) { b.push(this.get(x-1, y), this.get(x+1, y)) }
                        if ((Math.abs(x) % 2 === 1)&&(Math.abs(y) % 2 === 1)) { b.push(this.get(x-1, y-1), this.get(x+1, y-1), this.get(x-1, y+1), this.get(x+1, y+1)) }
                        b = b.filter(v => v)
                        this.set(x, y, b[Life.INSTANCE.random(0, b.length, true)])
                } }
        }

        _generate_apply_smoothing(S) {
            for (let s = 0; s < S; s++) {

            //
                for (let x = 0; x < this.x; x++) { for (let y = 0; y < this.y; y++) {
                    //
                        let b = []
                        if (this.get(x, y-1).same(this.get(x, y+1))) { b.push(this.get(x, y-1)) }
                        if (this.get(x-1, y).same(this.get(x+1, y))) { b.push(this.get(x-1, y)) }
                    //
                        b = b.filter(v => v)
                        if (b.length) { this.set(x, y, b[Life.INSTANCE.random(0, b.length, true)]) }
                } }
            }
        }

        _generate_apply_cropping() {
            let p = World.GENERATION.PADDING

            for (let x = -p.x; x <= this.x+p.x-1; x++) { for (let y = -p.y; y <= this.y+p.y-1; y++) {
                if ((x < 0)||(y < 0)||(x >= this.x)||(y >= this.y)) { this.unset(x, y) }
            } }

        }
*/

/*

    generate(seed = 0) {
            seed = Math.random()
            console.info(seed)
            noise.seed(seed)
            this.map = [] ; this.tiles = []
        //Biome generation (first draft)
            for (let x = -1; x <= this.x; x++) { this.map[x] = []; this.tiles[x] = []; for (let y = -1; y <= this.y; y++) {
                this.map[x][y] = this._generate_on(x, y)
                this.tiles[x][y] = []
            } }
        //
            this._generate_remove_isolated()
            this._generate_add_textures()
    }

    _generate_on(x, y) {
        //Elevation
            x /= this.x ; y /= this.y
            let ew = [1, 2, 4, 8], ews = ew.reduce((w, v) => w + 1/v, 0)

            let e = ew.reduce((w, v) => w + (1/v)*Math.abs(noise.simplex2(v * x, v * y)), 0) / ews

        //Climate
            let c = 1*Math.abs(noise.simplex2(1 * y, 1 * x)) + 0.5*Math.abs(noise.simplex2(2 * y, 2 * x))
        //Biomes
            return Biome.type(e, c/1.5)
    }



    _generate_remove_isolated() {
        let changed = 0, breaker = 0
        //
        do { changed = 0
            for (let x = 0; x < this.x; x++) { for (let y = 0; y < this.y; y++) {
                //
                    let b = this.map[x][y], r = this._generate_is_isolated(x, y)

                //
                    if ((r.c0.elevation > 0) && r.isolated) {
                        console.warn(r, x, y)
                        //Replacement by
                            if ((r.isolated)&&(r.d812)) { this.map[x][y] = r.c1 }
                            if ((r.isolated)&&(r.d234)) { this.map[x][y] = r.c3 }
                            if ((r.isolated)&&(r.d456)) { this.map[x][y] = r.c5 }
                            if ((r.isolated)&&(r.d678)) { this.map[x][y] = r.c7 }
                        //
                            if ((r.isolated)&&(!r.c8X)) { this.map[x][y] = [r.c6, r.c7, r.c1, r.c2].sort((a, b) => b.lower(a))[0] }
                            if ((r.isolated)&&(!r.c2X)) { this.map[x][y] = [r.c8, r.c1, r.c3, r.c4].sort((a, b) => b.lower(a))[0] }
                            if ((r.isolated)&&(!r.c4X)) { this.map[x][y] = [r.c2, r.c3, r.c5, r.c6].sort((a, b) => b.lower(a))[0] }
                            if ((r.isolated)&&(!r.c6X)) { this.map[x][y] = [r.c4, r.c5, r.c7, r.c8].sort((a, b) => b.lower(a))[0] }

                            this.tile(x, y, "BXX_X.png")

                            changed++
                    }
            } }
        } while (changed > 0 && breaker++ < 100)
    }
*/
