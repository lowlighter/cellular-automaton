class Entity {
    /**
     * <pre>
     * Create a new entity.
     * Entity is the basic structure used by automaton.
     * It automatically creates PIXI elements to be displayed and also references itself in the manager.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}.
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {String} frame - Frame name
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @category entities
     */
        constructor(manager, frame, options) {
            /**
             * Entity manager.
             * @readonly
             * @type {Entity.Manager}
             */
                this.manager = manager

            /**
             * <pre>
             * Entity container.
             * Used for position, and to contains entity's related elements sprites.
             * </pre>
             * <div class="alert info">
             * It wasn't possible to use <span class="bold">Sprite</span> directly, because adding elements (such as vision) will
             * change entity's width and height, which is not a wanted behavior.
             * </div>
             * @readonly
             * @type {PIXI.Container}
             */
                this.container = this.manager.container.addChild(new Container())
                this.container.position.set(options.x, options.y)

            /**
             * Entity main sprite.
             * @readonly
             * @type {PIXI.Sprite}
             */
                this.sprite = this.container.addChild(new AnimatedSprite())
                this.sprite.animationSpeed = Entity.ANIMATION_SPEED
                this.texture = frame||Entity.SPRITES.MISSING
                //Interaction
                    this.sprite.interactive = true
                    this.sprite.mouseover = (ev) => this._interaction_over(ev)
                    this.sprite.mouseout = (ev) => this._interaction_out(ev)
                    this.sprite.click = (ev) => this._interaction_click(ev)

            /**
             * Tell if entity is alive.
             * @type {Boolean}
             */
                this.alive = true

            /**
             * Entity iteration birth.
             * @type {Number}
             */
                this.created = this.manager.life.iteration

            //Referencing
                this.manager.list.add(this)
                this.manager.quadtree.add(this)
        }

    /**
     * <pre>
     * Destructor.
     * Destroy container and sprite and remove reference from quadtree.
     * </pre>
     */
        destructor() {
            //Quit if already destructed
                if (!this.alive) { return } else { delete this.alive }
            //Dereferencing
                this.manager.list.delete(this)
                this.manager.quadtree.delete(this)
            //Removing graphics instances
                let container = this.container
                //this.container = null
                this.sprite.interactive = false
                //this.sprite = null
            //Transition
                container.parent.removeChild(container)
                container.children.map(v => v.destroy())
                container.destroy()
                /*
                    this.manager.life.timeout(function (quit) {
                        if ((container.alpha *= 0.9) < 0.01) {
                            container.parent.removeChild(container)
                            container.children.map(v => v.destroy())
                            container.destroy()
                            quit()
                        }
                    }, 0)
                */
        }

    /**
     * Alias for destructor.
     */
        destroy() {
            this.destructor()
        }

    /**
     * Compute next state properties.
     * @virtual
     */
        prepare() { }

    /**
     * Update method (Synchronize next state properties).
     * @virtual
     */
        update() {
            //Synchronize states
                for (let i in this.prepared) {
                    if (i in this) {
                        this[i] = this.prepared[i]
                    }
                }
            //Reset preparator
                this.prepared = {}
        }

    /**
     * Update entity textures.
     * @type {String} frame - Frame name
     */
        set texture(frame) {
            this.sprite.textures = AnimatedTexture(frame)
            this.sprite.play()
            this.sprite.anchor.set(0.5, 1)
        }

    /**
     * <pre>
     * Texture padding.
     * Setting this member will update sprite's texture offset.
     * </pre>
     * @type {Object}
     */
        set padding(v) {
            this._padding = v
            this.sprite.position.set(v.x, v.y)
        }
        get padding() {
            return this._padding
        }

    /**
     * X coordinate.
     * @type {Number}
     */
        get x()  { return this.container.position.x }
        set x(v) { this.container.position.x = Math.max(0, Math.min(v, this.world.width-1)) }

    /**
     * Y coordinate.
     * @type {Number}
     */
        get y()  { return this.container.position.y }
        set y(v) { this.container.position.y = Math.max(0, Math.min(v, this.world.height-1)) }

    /**
     * Width (Dimensions are always rounded to prevent miscalulations).
     * @type {Number}
     * @readonly
     */
        get width() { return Math.round(this.sprite.width)  }

    /**
     * Height (Dimensions are always rounded to prevent miscalulations).
     * @type {Number}
     * @readonly
     */
        get height() { return Math.round(this.sprite.height) }

    /**
     * X anchor (used by Quadtree).
     * @readonly
     * @type {Number}
     */
        get ax() { return this.sprite.anchor.x }

    /**
     * Y anchor (used by Quadtree).
     * @readonly
     * @type {Number}
     */
        get ay() { return this.sprite.anchor.y }

    /**
     * X cell coordinate.
     * @readonly
     * @type {Number}
     */
        get cx() { return ~~(this.x/this.world.cell_size) }

    /**
     * Y cell coordinate.
     * @readonly
     * @type {Number}
     */
        get cy() { return ~~(this.y/this.world.cell_size) }

    /**
     * Entity type. Allows to prevent usage of instanceof.
     * @virtual
     * @readonly
     * @type {String}
     */
        get type() { return "entity" }

    /**
     * World containing entity.
     * @type {World}
     * @readonly
     */
        get world() { return this.manager.life.world }

    /**
     * Current age (number of iterations since its creation).
     * @type {Number}
     * @readonly
     */
        get age() {
            return this.manager.life.iteration - this.created
        }

    /**
     * Retrieve nearby entities.
     * @param {Number} [radius] - Filter by radius relative to this instance
     * @param {String|String[]} [filters] - List of type filters
     * @param {Boolean} [array=false] - If set, return an array instead of a Set
     * @return {Set|Array} Set of entity
     */
        nearby(radius, filters, array = false) {
            //List
                //TODO : let s = [...this.manager.quadtree.retrieve(this)].filter(v => v.alive)
                let tmp = new Set(this.manager.list) ; tmp.delete(this)
                let s = [...tmp].filter(v => v.alive)
            //Filter by radius
                if (radius) {
                    s = s.filter(v => Math.pow(v.x - this.x, 2) + Math.pow(v.y - this.y, 2) < Math.pow(radius, 2))
                }
            //Filter by type
                if (filters) {
                    if (!Array.isArray(filters)) { filters = [filters] }
                    s = s.filter(v => filters.indexOf(v.type) >= 0)
                }
            return array ? s : new Set(s)
        }

    /**
     * Current biome.
     * @type {Biome}
     ù @readonly
     */
        get biome() {
            return this.world.get(this.cx, this.cy).name
        }

    /**
     * Callback for mouse over event.
     * @param {Event} [ev] - Interaction event data
     * @private
     */
        _interaction_over(ev) {
            //Add tint
                this.sprite.tint = 0x0000FF
        }

    /**
     * Callback for mouse out event.
     * @param {Event} [ev] - Interaction event data
     * @private
     */
        _interaction_out(ev) {
            //Remove tint
                this.sprite.tint = 0xFFFFFF
        }

    /**
     * Callback for mouse click.
     * @param {Event} [ev] - Interaction event data
     * @private
     */
        _interaction_click(ev) {
            console.warn("No interactions has been implemented yet when clicking on entity")
        }
}

/**
 * List of sprites.
 * @memberof Entity
 * @type {Object}
 */
    Entity.SPRITES = {
        MISSING:"PXX"
    }

//Prevent recalculation of 2*PI
    Entity.PI2 = Math.PI * 2

/**
 * Default animation speed.
 * @memberof Entity
 * @type {Number}
 */
    Entity.ANIMATION_SPEED = 0.05
