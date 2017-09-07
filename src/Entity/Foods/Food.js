class Food extends Entity {
    /**
     * <pre>
     * Create a new food entity..
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}.
     * Food can provide different effects for entities when eaten.
     * It automatically expires after max cycles is reached.
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {String} frame - Frame name
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @category foods
     * @extends Entity
     */
        constructor(manager, frame, options) {
            //Heritage
                super(manager, frame, options)
            //Cycles indicators
                this._cycle_indic = new Entity.Indicator(this.container, {radius:Math.floor(2 + this.sprite.width/4), manager:this.manager, type:"cycle"})
                this._cycle_indic.hide()
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
            this._cycle_indic.value(Math.max(v, 0)/this.max_cycle)
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

    /**
     * Called when an entity eat this instance.
     * @param {Entity} by - Entity eating this instance
     * @virtual
     */
        eaten(by) {
            this.destroy()
        }
}

/**
 * Food default max cycles.
 * @type {Number}
 * @memberof Food
 */
    Food.DEFAULT_MAX_CYCLES = 100
