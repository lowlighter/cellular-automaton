class SitrusTree extends BerryTree {
    /**
     * <pre>
     * Create a new Oran Berry Tree.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}
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
                super(manager, options)
        }

    /**
     * Harvest berries from this tree.
     * @override
     */
        harvest() {
            super.harvest(SitrusBerry)
        }

    /**
     * <pre>
     * Make tree growing to next stage.
     * This method must be overriden for adult stages textures.
     * </pre>
     * @override
     */
        grow() {
            super.grow()
            if (this.stage >= BerryTree.ADULT_STAGE) { this.texture = BerryTree.SPRITES.SITRUS[this.stage-BerryTree.ADULT_STAGE] }
        }
}

/**
 * Default genes.
 * @type {Number}
 * @readonly
 * @memberof OranTree
 */
    SitrusTree.DEFAULT_GENES = {
        adaptability:{
            TEMPERED_BEACH:1,
            TROPICAL_BEACH:0.6,
            PLAINS:0.2,
            FOREST:0.8,
            JUNGLE:0.3
        },
        harvest:{min:2, max:3},
        longetivity:17000,
        fertility:0.1
    }
