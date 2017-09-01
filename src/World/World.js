class World {
    /**
     * <pre>
     * Create a new world.
     * A world is associated to a [Life]{@link Life} instance and initialized with its seed.
     * It is used to generate a world with differents biome and obstacles and also populate it once.
     * This can also be used to access cell's biome infos, find path between two cells or check cells connectivity.
     * Note that world is static and isn't altered after. Although I would have loved to have seasons and sea level changes,
     * it wasn't included because I found it complicated (textures update, graph rebuilding, etc.) but maybe in future versions.
     * </pre>
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
             * Cells size (in pixels).
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

            /**
             * A&ast; configuration for pathfinding methods..
             * @private
             * @type {Astar.Configuration}
             */
                this.astar = null

            //Generate map
                this.generate(options.seed)
                this.container.cacheAsBitmap = true
        }

    /**
     * Retrieve Biome stored in map on a given location.
     * @param {Number} x - X
     * @param {Number} y - Y
     * @param {Boolean} [previous=false] - If set, will return previous stored biome (used for generation)
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
     * <pre>
     * Return biome type located on a givent location.
     * <div class="alert info">
     * World must have been generated before using this method.
     * This is slightly different from [Biome.type]{@link Biome#type} as it uses post-processed cells.
     * </div>
     * </pre>
     * @param {Number} x - X
     * @param {Number} y - Y
     * @return {Biome}
     */
        at(x, y) {
            x = ~~(x/this.cell_size)
            y = ~~(y/this.cell_size)
            return this.get(x, y)
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
            console.warn("World.populate is not yet implemented for live env")
            if (Life.ENV === "dev") {
                this.life.entities.create(OranTree, {x:250, y:450}).grow(4)
                this.life.entities.create(OranTree, {x:750, y:50}).grow(4)
                this.life.entities.create(OranTree, {x:600, y:150}).grow(4)
                this.life.entities.create(SitrusTree, {x:250, y:350}).grow(4)
                //window.test = this.life.entities.create(Magicarpe, {x:500, y:700})
                //this.life.entities.create(Magicarpe, {x:550, y:700})
                window.test = this.life.entities.create(Evoli, {x:250, y:475})
                //this.life.entities.create(Evoli, {x:250, y:375})
            }
        }

    /**
     * <pre>
     * Generate a new world map with a given seed.
     * This method should only be called once.
     * </pre>
     * @param {Number} [seed] - Seed
     */
        generate(seed) {
            //Seed
                noise.seed(Life.ENV === "dev" ? Life.DEV.WORLD_SEED : seed)
            //Generate
                for (let i = 0; i < Biome.MAX_ELEVATION; i++) { this._generate_level(i) }
                this._generate_map_to_astar()
            //Display textures
                this._generate_add_textures()
            //Postprocessing
                this._generate_postprocessing()
        }

    /**
     * <pre>
     * Generate a level of world map while removing isolated cells.
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
     * @return {Biome} Biome type
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
     * @return {Object} Cell isolation informations (check code for more informations)
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
     * Tell if cell can be replaced with the given biome.
     * This prevent having elevation difference greater than 1.
     * Should be called only by [World.generate]{@link World#generate} or one of its sub-methods.
     * </pre>
     * @private
     * @param {Biome} b - New biome
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     * @return {Boolean} True if can be replaced
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
            console.warn("World._generate_add_textures doesn't add transition for C0 textures yet")
            for (let x = 0; x < this.x; x++) { for (let y = 0; y < this.y; y++) {
                this._generate_add_texture(x, y, "E0")
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
     * @param {String} XX - Texture bank (See [TEXTURES_BANKS]{@link World#TEXTURES_BANKS})
     */
        _generate_add_texture(x, y, XX) {
            //Retrieve neighborhood and compute elevation texture
                let r = this.gets(x, y), ce = null, cx = null
                let F = World.TEXTURES_BANK[XX].F
                let e = World.TEXTURES_BANK[XX].E(r)

            //Diagonals
                if (r.c1[F](r.c0)) { ce = {frame:`${XX}${e}_5.png`} ; cx = r.c1 }
                if (r.c3[F](r.c0)) { ce = {frame:`${XX}${e}_7.png`} ; cx = r.c3 }
                if (r.c5[F](r.c0)) { ce = {frame:`${XX}${e}_1.png`} ; cx = r.c5 }
                if (r.c7[F](r.c0)) { ce = {frame:`${XX}${e}_3.png`} ; cx = r.c7 }

            //Laterals
                if (r.c4[F](r.c0)) { ce = {frame:`${XX}${e}_8.png`} ; cx = r.c4 }
                if (r.c8[F](r.c0)) { ce = {frame:`${XX}${e}_4.png`} ; cx = r.c8 }
                if (r.c6[F](r.c0)) { ce = {frame:`${XX}${e}_2.png`} ; cx = r.c6 }
                if (r.c2[F](r.c0)) { ce = {frame:`${XX}${e}_6.png`} ; cx = r.c2 }

            //Corners (frame may be changed according to middle cell of corner)
                if (r.c8[F](r.c0) && r.c2[F](r.c0)) { ce = {frame:`${XX}${e}_1b.png`} ; cx = r.c1[F](r.c0) ? r.c1 : r.c8 }
                if (r.c6[F](r.c0) && r.c8[F](r.c0)) { ce = {frame:`${XX}${e}_7b.png`} ; cx = r.c7[F](r.c0) ? r.c7 : r.c6 }
                if (r.c2[F](r.c0) && r.c4[F](r.c0)) { ce = {frame:`${XX}${e}_3b.png`} ; cx = r.c3[F](r.c0) ? r.c3 : r.c2 }
                if (r.c4[F](r.c0) && r.c6[F](r.c0)) { ce = {frame:`${XX}${e}_5b.png`} ; cx = r.c5.lower(r.c0) ? r.c5 : r.c4 }

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
     * <pre>
     * Convert [World.map]{@link World#map} to an array structure.
     * Should be called only by [World.generate]{@link World#generate} or one of its sub-methods.
     * </pre>
     * @private
     */
        _generate_map_to_array() {
            let map = []
            for (let x = 0; x < this.x; x++) { map[x] = [] ; for (let y = 0; y < this.y; y++) {
                map[x][y] = this.get(x, y)
            } }
            return map
        }

    /**
     * <pre>
     * Instantiate a new [Astar.Configuration]{@link https://lowlighter.github.io/astar/docs/Configuration.html}.
     * Graph are based on [Biome.SEA_LEVEL]{@link Biome#SEA_LEVEL}.
     * Should be called only by [World.generate]{@link World#generate} or one of its sub-methods.
     * </pre>
     * @private
     */
        _generate_map_to_astar() {
            console.warn("Lowlight.Astar cutting option should be strict")
            let options = {order:"xy", diagonals:true, cutting:false, torus:false, heuristic:"euclidian"}
            this.astar = new Astar(this._generate_map_to_array(),
                $.extend({cost(n, m) { return 1 }}, options),
                $.extend({cost(n, m) { return m.elevation <= Biome.SEA_LEVEL ? 1 : null }}, options),
                $.extend({cost(n, m) { return m.elevation >  Biome.SEA_LEVEL ? 1 : null }}, options),
            )
        }

    /**
     * <pre>
     * Perform generated world's postprocessing.
     * This add obstacles and decorations based on biome.
     * </pre>
     * @private
     */
        _generate_postprocessing() {
            console.warn("World.postprocessing is not implemented yet")
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
            //Return
                return s
        }

    /**
     * World's width.
     * @type {Number}
     * @readonly
     */
        get width() { return this.life.app.view.width }

    /**
     * World's height.
     * @type {Number}
     * @readonly
     */
        get height() { return this.life.app.view.height }

    /**
     * World's max X coordinate.
     * @type {Number}
     * @readonly
     */
        get x() { return this.width/this.cell_size }

    /**
     * World's max Y coordinate.
     * @type {Number}
     * @readonly
     */
        get y() { return this.height/this.cell_size }

    /**
     * Tell if position if outside of world.
     * @param {Object} position - Position containing x and y properties
     * @return {Boolean} True if outside of map
     */
        outside(position) {
            return (position.x < 0)||(position.y < 0)||(position.x >= this.width)||(position.y >= this.height)
        }

    /**
     * Compute a path between two cells.
     * @param {Object} from - Start cell
     * @param {Objetc} to - Goal cell
     * @param {Number} [layer=World.LAYERS.ALL] - Layer to use
     * @return {Object[]} Array of cell to attain to reach goal
     */
        path(from, to, layer = World.LAYERS.ALL) {
            if (this.outside(from)||this.outside(to)) { return [] }
            let a = {x:~~(from.x/this.cell_size), y:~~(from.y/this.cell_size)}
            let b = {x:~~(to.x/this.cell_size), y:~~(to.y/this.cell_size)}
            return this.astar.path(a, b, {layer, jps:true, static:true})
        }

    /**
     * Tell if a path exists between two cells without computing path (extremely fast).
     * <div class="alert info">
     * This test is automatically performed before computing a path, there's no need to call it again.
     * </div>
     * @param {Object} from - Start cell
     * @param {Objetc} to - Goal cell
     * @param {Number} [layer=World.LAYERS.ALL] - Layer to use
     * @return {Boolean} True if a path exists
     */
        connected(from, to, layer = World.LAYERS.ALL) {
            if (this.outside(from)||this.outside(to)) { return false }
            let graph = this.astar.graphs[layer]
            let a = {x:~~(from.x/this.cell_size), y:~~(from.y/this.cell_size)}
            let b = {x:~~(to.x/this.cell_size), y:~~(to.y/this.cell_size)}
            return graph.connected(graph.node(a, true), graph.node(b, true))
        }

}

/**
 * Graph layers identifiers.
 * @readonly
 * @const
 * @memberof World
 */
    World.LAYERS = {
        ALL:0,
        SEA:1,
        GROUND:2
    }

/**
 * <pre>
 * Textures bank used for textures transitions.
 * <span class="bold">F</span> should contains the name of the method of [Biome]{@link Biome} to use.
 * <span class="bold">E</span> should be a function which takes an object given by [World.gets]{@link World#gets} and return a number used for texture.
 * </pre>
 * @readonly
 * @const
 * @memberof World
 */
    World.TEXTURES_BANK = {
        "E0":{F:"lower", E(r) { return Math.min(r.c0.elevation-1, 2) }},
        //"C0":{F:"colder", E(r) { return Math.min(r.c0.climate-1, 2) }}
    }
