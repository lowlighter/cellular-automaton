class Pokeblock extends Food {
    /**
     * <pre>
     * Create a new Pokeblock.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}.
     * Unlike its counterpart in the main series, where Pokeblocks are created by mixing berries, this one represents literally "Pokemons" blocks.
     * They're dropped when a Pokemon die or is killed and have differents flavors.
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @category foods
     */
        constructor(manager, options) {
            //Heritage
                super(manager, Pokeblock.SPRITES.NEUTRAL, options)
            //Expiration
                this.max_cycle = this.manager.life.random(0.75, 1.25) * Pokeblock.MAX_CYCLES
            //Padding
                this.padding = {x:0, y:4}
        }

    /**
     * Compute next state properties.
     * @override
     */
        prepare() {
            super.prepare()
        }

     /**
     * Update method (Synchronize next state properties).
     * @override
     */
        update() {
            //Apply changes
                super.update()
            //Remove if expired
                if (this.cycle <= 0) {
                    this.destroy()
                }
        }

    /**
     * Called when an entity eat this instance.
     * @param {Entity} by - Entity eating this instance
     */
        eaten(by) {
            by.hunger += 15
            super.eaten(by)
        }

    /**
     * Entity type. Allows to prevent usage of instanceof.
     * @virtual
     * @override
     * @readonly
     * @type {String}
     */
        get type() { return "pokeblock" }
}

/**
 * List of Pokeblock textures.
 * @type {Object}
 * @memberof Pokeblock
 */
    Pokeblock.SPRITES = {
        NEUTRAL:"FX0"
    }

/**
 * Pokeblocks longetivity.
 * @type {Number}
 * @memberof Pokeblock
 */
    Pokeblock.MAX_CYCLES = 1000
