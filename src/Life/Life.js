class Life {
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
         */
            this.app = app

        /**
         * Shortcut to access main stage.
         * @type {PIXI.Container}
         */
            this.stage = this.app.stage

        /**
         * Associated world.
         * @type {World}
         */
            this.world = new World(this, {cell_size:16, seed})

        /**
         * Associated entities.
         * @type {Entity.Manager}
         */
            this.entities = new Entity.Manager(this)

        /**
         * Current iteration.
         * @type {Number}
         */
            this.iteration = 0

        //Populate world
            this.world.populate()

        //TODO
            this._iterator = this.iterator()
            setInterval(q => this.iterate(), 1)

            console.log(this)
    }

    /**
     * Compute next state of each entity and update them.
     */
        *iterator() {
            while (1) {
                this.iteration++
                this.entities.list.forEach(e => e.prepare())
                this.entities.list.forEach(e => e.update())
                this.entities.quadtree.rebuild()
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
            Biome.init()
        }
}
