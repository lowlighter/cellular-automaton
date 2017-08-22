class Food extends Entity {
    /**
     * <pre>
     * Create a new food entity..
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {String} frame - Frame name
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @category entities
     */
        constructor(manager, frame, options) {
            //Heritage
                super(manager, frame, options)
            //Cycles indicators
                this._cycle_indic = new Entity.Indicator(this.container, {radius:Math.floor(2 + this.sprite.width/4)})
                this.max_cycle = Food.DEFAULT_MAX_CYCLES
        }

    /**
     * Max cycle value before expiration.
     * @type {Number}
     */
        set max_cycle(v) {
            this._max_cycle = v
            this._cycle_value = this.max_cycle
        }
        get max_cycle() {
            return this._max_cycle
        }

    /**
     * Cycle value (internal clock).
     * @type {Number}
     */
        set cycle(v) {
            this._cycle_value = v
            this._cycle_indic.value(v/this.max_cycle)
        }
        get cycle() {
            return this._cycle_value
        }

    /**
     * Compute next state properties.
     * @override
     */
        prepare() {
            this.prepared = {
                cycle:this.cycle-1
            }
        }

    /**
     * Update method (Synchronize next state properties).
     * @override
     */
        update() {
            super.update()
        }
}

/**
 * Food default max cycles.
 * @type {Number}
 * @memberof Food
 */
    Food.DEFAULT_MAX_CYCLES = 100
