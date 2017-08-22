class OranBerry extends Berry {
    /**
     * <pre>
     * Create a new Oran Berry.
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
            //Tree and textures
                this.texture = Berry.SPRITES.ORAN
                this.tree = OranTree
        }
}
