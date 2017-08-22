Entity.Manager = class EntityManager {
    /**
     * Create a new entity manager.
     * @param {Life} life - Life instance
     * @param {Object} [options] - Options
     * @category entities
     */
        constructor(life, options) {
            /**
             * Life instance reference.
             * @readonly
             * @type {Life}
             */
                this.life = life

            /**
             * Entities container.
             * @readonly
             * @type {PIXI.Container}
             */
                this.container = this.life.stage.addChild(new Container())

            /**
             * Contains all entities created by manager.
             * @type {Set}
             */
                this.list = new Set()

            /**
             * <pre>
             * Contains all entities created by manager.
             * Used for interaction managements (faster access).
             * </pre>
             * @type {Quadtree}
             */
                this.quadtree = new Quadtree(0, 0, this.life.world.width, this.life.world.height)
                this.quadtree.max_items = 1
                this.quadtree.max_depth = 2
        }

    /**
     * Create a new entity.
     * <div class="alert info">
     * Entities should always be created by calling this method, as it links current manager.
     * </div>
     * @param {Class} type - Class to create
     * @param {Object} options - Options
     * @return {?Class} Instance of given class
     */
        create(type, options) {
            return this.life.world.outside(options) ? null : new type(this, options)
        }
}
