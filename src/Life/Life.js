class Life {
    /**
     * <pre>
     * Create a new cellular automaton.
     * This will also create a new world and populate it, and will allow to iterate through time.
     * Each seed will create a specific universe, and using the same one will always give the same one, as random generators are also seeded.
     * </pre>
     * @param {PIXI.Application} app - Application
     * @param {Number} [seed=0] - Seed
     * @category life
     */
        constructor(app, seed = 0) {
            /**
             * Internal random number generator.
             * @readonly
             * @private
             * @type {Random.Distribution.Uniform}
             * @category life
             */
                this.generator = new Random.Distribution.Uniform().seed(seed)

            /**
             * Internal random number generator for suddent deaths.
             * @readonly
             * @private
             * @type {Random.Distribution.Exponential}
             */
                this.death_generator = new Random.Distribution.Exponential(5).seed(seed)

            /**
             *  Reference to application.
             * @type {PIXI.Application}
             * @readonly
             */
                this.app = app

            /**
             * Shortcut to access main stage.
             * @type {PIXI.Container}
             * @readonly
             */
                this.stage = this.app.stage

            /**
             * Associated world.
             * @type {World}
             * @readonly
             */
                this.world = new World(this, {cell_size:16, seed})

            /**
             * Sprite used for map interactions.
             * @type {PIXI.Sprite}
             * @readonly
             */
                this.interactions = this.stage.addChild(new Sprite())
                this.interactions.width = this.app.view.width
                this.interactions.height = this.app.view.height
                this.interactions.interactive = true

            /**
             * Associated entities.
             * @type {Entity.Manager}
             * @readonly
             */
                this.entities = new Entity.Manager(this)

            /**
             * Current iteration.
             * @type {Number}
             */
                this.iteration = 0

            /**
             * Internal iterator generator.
             * @private
             * @type {Generator}
             */
                this._iterator = this.iterator()

            //Populate world
                this.world.populate()

            /**
             * Iteration counter display.
             * @type {PIXI.Text}
             * @private
             */
                this._iterator_text = this.stage.addChild(new Text("", {fontSize:16, fontFamily:"Monospace", fill:0xFFFFFF}))

            //TODO - TEST - TODO - TEST - TODO
                console.warn("")
                setInterval(q => this.iterate(), 1)
                window.life = this

                this.interactions.click = (ev) => {
                    let p = ev.data.getLocalPosition(this.stage)
                    this.entities.create(Pokeblock, p)
                }
            //TODO - TEST - TODO - TEST - TODO
        }

    /**
     * Create a generator which compute next state of each entity and update them.
     * @return {Generator} Generator which compute next state of each entity and update them.
     */
        *iterator() {
            while (1) {
                this.iteration++
                this.entities.list.forEach(e => e.prepare())
                this.entities.list.forEach(e => e.update())
                this.entities.quadtree.rebuild()
                this._iterator_text.text = `Iteration : ${this.iteration}`
                yield this.iteration
            }
        }

    /**
     * Iterate to next iteration.
     */
        iterate() {
            return this._iterator.next().value
        }

    /**
     * Generate a new random number.
     * @param {Number} [min=0] - Minimum value
     * @param {Number} [max=1] - Maximum value
     * @param {Boolean} [integer=false] - If set, only integers values will be returned (note that max is excluded)
     */
        random(min = 0, max = 1, integer = false) {
            let r = min + this.generator.next() * (max - min)
            return integer ? Math.floor(r) : r
        }

    /**
     * Tell if entity should have a sudden death.
     * @param {Number} age - Age
     * @param {Number} [longetivity=1] - Longetivity
     * @return {Boolean} True if should die
     */
        reaper(age, longetivity = 1) {
            return this.death_generator.next() > longetivity/age
        }

    /**
     * Timeout method based on ticker.
     * @param {Function} f - Function to be delayed. First parameter is a function that can be called to force function removal from ticker.
     * @param {Number} timeout - Delay before execution (in ms)
     * @param {Number} [duration=Infinity] - Duration before expiration
     */
        timeout(f, timeout, duration = Infinity) {
            //Start and end timestamps, and quit allocation
                let start = this.tick + timeout, end = start + duration, quit
            //Function wrapper
                let wrapper = () => {
                    //Remove function from ticker if expired
                        if (this.tick >  end ) { return quit()  }
                    //Execute function
                        if (this.tick > start) { return f(quit) }
                }
            //Quit function
                quit = () => { this.app.ticker.remove(wrapper) }
            //Add to ticker
                this.app.ticker.add(wrapper)
        }

    /**
     * Internal current time.
     * @readonly
     * @type {Number}
     */
        get tick() { return this.app.ticker.lastTime }

    /**
     * Initialize cellular automaton (must be called before instanciating any Life structure).
     */
        static init() {
            PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
            Biome.init()
        }

    /**
     * Start cellular automaton.
     * @param {PIXI.Application} app - Application
     * @return {Life}
     */
        static start(app) {
            return new Life(app)
        }
}

/**
 * Current environment.
 * @type {?String}
 * @memberof Life
 */
    Life.ENV = "dev"

/**
 * Developpement parameters.
 * @type {Object}
 * @memberof Life
 */
    Life.DEV = {
        WORLD_SEED:0.7701236501068505,
        BIOME_MAX_ELEVATION:3
    }
