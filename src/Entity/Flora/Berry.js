class Berry extends Food {
    /**
     * <pre>
     * Create a new Berry.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}.
     * Berry are produced by Berry trees and provide differents effects when eaten.
     * As food, they expire after a certain amount of iterations, but have a chance to give birth to another tree upon expiring.
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @param {Number} [options.genes] - Genes
     * @category flora
     * @extends Food
     */
        constructor(manager, options) {
            //Heritage
                super(manager, Berry.SPRITES.ENIGMA, options)
            //Save genes
                this.genes = options.genes||BerryTree.DEFAULT_GENES
            //Expiration
                this.max_cycle = this.manager.life.random(0.75, 1.25) * Berry.MAX_CYCLES
        }

    /**
     * Compute next state properties.
     * @override
     */
        prepare() {
            //
                super.prepare()
            //If berry expired and tree can be planted, random test
                if ((this.prepared.cycle <= 0)&&(this.tree)&&(this.nearby(BerryTree.AREA_RADIUS, "berry_tree").size < BerryTree.MAX_POPULATION)) {
                    this.create_tree = (this.manager.life.random() > 1 - this.genes.fertility)
                }
        }


     /**
     * Update method (Synchronize next state properties).
     * @override
     */
        update() {
            //Apply changes
                super.update()
            //Create a new tree
                if (this.create_tree) {
                    this.manager.create(this.tree, {x:this.x, y:this.y, genes:this.genes})
                }
            //Remove if expired
                if (this.cycle <= 0) {
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
        get type() { return "berry" }
}

/**
 * List of Berry textures.
 * @type {Object}
 * @memberof Berry
 */
    Berry.SPRITES = {
        ENIGMA:"F00",
        ORAN:"F01",
        SITRUS:"F02"
    }

/**
 * Berries longetivity.
 * @type {Number}
 * @memberof Berry
 */
    Berry.MAX_CYCLES = 1000
