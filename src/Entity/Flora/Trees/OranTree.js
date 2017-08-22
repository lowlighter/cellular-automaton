class OranTree extends BerryTree {
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
            super.harvest(OranBerry)
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
            if (this.stage >= BerryTree.ADULT_STAGE) { this.texture = BerryTree.SPRITES.ORAN[this.stage-BerryTree.ADULT_STAGE] }
        }
}

/**
 * Default genes.
 * @type {Number}
 * @readonly
 * @memberof OranTree
 */
    OranTree.DEFAULT_GENES = {
        adaptability:{
            POLAR_BEACH:0.1,
            TEMPERED_BEACH:1,
            TROPICAL_BEACH:0.8,
            PLAINS:0.4,
            FOREST:0.7,
            JUNGLE:0.4
        },
        harvest:{min:3, max:6},
        longetivity:7000,
        fertility:0.2
    }
