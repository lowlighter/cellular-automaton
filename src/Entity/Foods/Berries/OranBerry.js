class OranBerry extends Berry {
    /**
     * <pre>
     * Create a new Oran Berry.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}.
     * Restore 15% of eater's hp.
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
                this.texture = Berry.SPRITES.ORAN
                this.tree = OranTree
        }

    /**
     * Called when an entity eat this instance.
     * @param {Entity} by - Entity eating this instance
     */
        eaten(by) {
            by.prepared.hp += 0.20*by.hp_max
            by.prepared.hunger += 25
            super.eaten(by)
        }
}
