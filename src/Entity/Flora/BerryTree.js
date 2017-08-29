class BerryTree extends Entity {
    /**
     * <pre>
     * Create a new Berry Tree.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}.
     * Berry trees are living entities which provide berries after flowering.
     * They're much simpler than creatures as they don't have special behaviors.
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @param {Number} [options.genes] - Genes
     * @category flora
     */
        constructor(manager, options) {
            //Heritage
                super(manager, BerryTree.SPRITES.SEED, options)

            /**
             * Current stage of berry tree. See [BerryTree.STAGES]{@link BerryTree#STAGES} for more informations.
             * @type {Number}
             */
                this.stage = 0

            //Cycle value and indicator
                this._cycle_value = 0
                this._cycle_indic = new Entity.Indicator(this.container)

            //Sprite padding
                this.padding = {x:0, y:4}

            /**
             * List of tree genes.
             * <ul>
             * <li>adaptability : Growth rate in specified biome. Can't grow if not compatible.</li>
             * <li>harvest : Number min and max of berries produced per harvest.</li>
             * <li>longetivity : Average lifetime.</li>
             * <li>fertility : Fertility rate of berries.</li>
             * </ul>
             * @type {Object}
             */
                this.genes = options.genes||this.constructor.DEFAULT_GENES

            /**
             * If set, tree will die at the end of next iteration.
             * @type {Boolean}
             */
                this.sudden_death = false
        }

    /**
     * <pre>
     * Make tree growing to next stage.
     * This method must be overriden for adult stages textures.
     * </pre>
     * @virtual
     * @private
     */
        grow() {
            //Stage incrementation
                this.stage++
            //If over max stage, harvest berry and return to basic adult stage
                if (this.stage >= BerryTree.STAGES.length) {
                    this.harvest()
                    this.stage = (this.stage - BerryTree.ADULT_STAGE)%BerryTree.ADULT_STAGES + BerryTree.ADULT_STAGE
                }
            //Sprout stage
                if (this.stage === 1) { this.texture = BerryTree.SPRITES.SPROUT }
        }

    /**
     * Harvest berries from this tree.
     * @param {Berry} berry - Berry to harvest
     */
        harvest(berry) {
            let harvested = this.manager.life.random(this.genes.harvest.min, this.genes.harvest.max+1, true)
            for (let i = 0; i < harvested; i++) {
                let r = this.manager.life.random(BerryTree.BERRIES_FALL_MIN_RADIUS, BerryTree.BERRIES_FALL_MAX_RADIUS), t = this.manager.life.random(0, Entity.PI2)
                this.manager.create(berry, {x:this.x+r*Math.cos(t), y:this.y+r*Math.sin(t), genes:this.genes})
            }
        }

    /**
     * Adaptability coefficient.
     * @type {Number}
     * @readonly
     */
        get adaptability() {
            return (this.biome in this.genes.adaptability) ? this.genes.adaptability[this.biome] : 0
        }


    /**
     * Cycle iterator (internal clock).
     * @type {Number}
     */
        set cycle(v) {
            this._cycle_value = v
            this._cycle_indic.value(v*this.adaptability/BerryTree.CYCLES[this.stage])
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
                cycle:this.cycle+1,
                sudden_death:this.manager.life.reaper(this.age, this.genes.longetivity)
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
                if (this.cycle * this.adaptability > BerryTree.CYCLES[this.stage]) {
                    this.grow()
                    this.cycle = 0
                }
            //Update animation speed
                if (this.alive) {
                    this.sprite.animationSpeed = Entity.ANIMATION_SPEED * this.adaptability
                }
            //Sudden death
                if (this.sudden_death) {
                    this.destroy()
                }
        }

    /**
     * Entity type. Allows to prevent usage of instanceof.
     * @virtual
     * @override
     * @readonly
     * @type {String}
     */
        get type() { return "berry_tree" }
}

/**
 * List of Berry Trees stages.
 * @type {String[]}
 * @readonly
 * @memberof BerryTree
 */
    BerryTree.STAGES = ["SEED", "SPROUT", "TALLER", "BLOOM", "BERRY"]

/**
 * Number of cycles to reach each stage.
 * @type {Object}
 * @readonly
 * @memberof BerryTree
 */
    BerryTree.CYCLES = [100, 200, 200, 200, 300]

/**
 * Maturity stage index.
 * @type {Number}
 * @readonly
 * @memberof BerryTree
 */
    BerryTree.ADULT_STAGE = 2

/**
 * Number of adult stages.
 * @type {Number}
 * @readonly
 * @memberof BerryTree
 */
    BerryTree.ADULT_STAGES = BerryTree.STAGES.length - BerryTree.ADULT_STAGE

/**
 * List of Berry Trees textures.
 * @type {Object}
 * @memberof BerryTree
 */
    BerryTree.SPRITES = {
        SEED:"T00",
        SPROUT:"T01",
        ORAN:["T02", "T03", "T04"],
        SITRUS:["T05", "T06", "T07"]
    }

/**
 * Neighbors area radius (used for population calculations).
 * @type {Number}
 * @readonly
 * @memberof BerryTree
 */
    BerryTree.AREA_RADIUS = 32

/**
 * Max population per area.
 * @type {Number}
 * @readonly
 * @memberof BerryTree
 */
    BerryTree.MAX_POPULATION = 3

/**
 * Minimum distance from tree for berry falls.
 * @type {Number}
 * @readonly
 * @memberof BerryTree
 */
    BerryTree.BERRIES_FALL_MIN_RADIUS = 16
/**
 * Maximum distance from tree for berry falls.
 * @type {Number}
 * @readonly
 * @memberof BerryTree
 */
    BerryTree.BERRIES_FALL_MAX_RADIUS = 32

/**
 * Default genes.
 * @type {Object}
 * @readonly
 * @memberof BerryTree
 */
    BerryTree.DEFAULT_GENES = {
        adaptability:{},
        harvest:{min:1, max:1},
        longetivity:7000,
        fertility:0
    }
