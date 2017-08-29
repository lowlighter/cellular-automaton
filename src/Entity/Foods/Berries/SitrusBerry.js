class SitrusBerry extends Berry {
    /**
     * <pre>
     * Create a new Sitrus Berry.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}.
     * Restore 30% of eater's hp.
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @param {Number} [options.genes] - Genes
     * @category foods
     */
        constructor(manager, options) {
            //Heritage
                super(manager, options)
            //Tree and textures
                this.texture = Berry.SPRITES.SITRUS
                this.tree = SitrusTree
        }

    /**
     * Called when an entity eat this instance.
     * @param {Entity} by - Entity eating this instance
     */
        eaten(by) {
            by.hp += 0.30*by.genes.hp_max
            super.eaten(by)
        }
}
