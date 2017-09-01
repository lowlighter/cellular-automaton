Creature.Egg = class CreatureEgg extends Entity {
    /**
     * <pre>
     * Create a new Creature egg.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}.
     * After a certain amount of iterations, it will hatch into a new creature.
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @param {Number} [options.genes] - Genes
     * @category fauna
     */
        constructor(manager, options) {
            //Heritage
                super(manager, Creature.Egg.SPRITE, options)

            //Cycle value and indicator
                this._cycle_value = 0
                this._cycle_indic = new Entity.Indicator(this.container, {manager:this.manager, type:"cycle"})

            //Sprite padding
                this.padding = {x:0, y:6}

            /**
             * Creature's future species.
             * @type {Class}
             * @readonly
             */
                this.species = options.species||null

            /**
             * Creature's futures genes (See [Creature.genes]{@link Creature#genes} for more details)
             * @type {Object}
             * @readonly
             */
                this.genes = options.genes||this.constructor.DEFAULT_GENES
        }

    /**
     * <pre>
     * Hatch egg.
     * Instantiate a neew create and destroy this instance.
     * </pre>
     */
        hatch() {
            if (this.species) {
                this.manager.create(this.species, {x:this.x, y:this.y, genes:this.genes})
            }
            this.destroy()
        }

    /**
     * Cycle iterator (internal clock).
     * @type {Number}
     */
        set cycle(v) {
            this._cycle_value = v
            this._cycle_indic.value(v/Creature.Egg.CYCLES)
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
                cycle:this.cycle+this.genes.egg_growth_rate
            }
        }

    /**
     * Update method (Synchronize next state properties).
     * @override
     */
        update() {
            //Apply changes
                super.update()
            //If number of required circle is attained, grow to next stage
                if (this.cycle >= Creature.Egg.CYCLES) {
                    this.hatch()
                }
            //Update animation speed
                if (this.alive) {
                    this.sprite.animationSpeed = Creature.Egg.ANIMATION_SPEED_COEF * Entity.ANIMATION_SPEED * (this.cycle/Creature.Egg.CYCLES)
                }
        }

    /**
     * Entity type. Allows to prevent usage of instanceof.
     * @virtual
     * @override
     * @readonly
     * @type {String}
     */
        get type() { return "creature_egg" }

    /**
     * Default genes.
     * @type {Number}
     * @readonly
     */
        static get DEFAULT_GENES() { return Creature.DEFAULT_GENES }
}

/**
 * Number of cycles required to give
 * @type {Object}
 * @readonly
 * @memberof CreatureEgg
 */
    Creature.Egg.CYCLES = 100

/**
 * List of egg textures.
 * @type {Object}
 * @memberof CreatureEgg
 */
    Creature.Egg.SPRITE = "P00"

/**
 * Animation speed coefficient (based on [Entity.ANIMATION_SPEED]{@link Entity#ANIMATION_SPEED}).
 * @type {Number}
 * @readonly
 * @memberof CreatureEgg
 */
    Creature.Egg.ANIMATION_SPEED_COEF = 2.5
