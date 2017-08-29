Creature.Input = class CreatureInput {
        /**
         * <pre>
         * Create a new Creature Input.
         * This must be linked to a [Creature]{@link Creature}.
         * Contains essentially creature's sight and range action (influenced by genes).
         * This will allow to prepare input data for [Creature.Output]{@link CreatureOutput}.
         * Using this structure will allow more flexibility towards Creatures' behaviors, and even the possibility for machine learning.
         * </pre>
         * @param {Creature} creature - Associated creature
         */
            constructor(creature) {
                //Reference to creature
                    this.creature = creature

                /**
                 * Polygon, used for sight calculations.
                 * @type {PIXI.Polygon}
                 * @private
                 */
                    this.polygon = new Polygon()
                /**
                 * Circle, used for sight calculations.
                 * @type {PIXI.Circle}
                 * @private
                 */
                    this.circle = new Circle()
                /**
                 * <pre>
                 * Ellipse, used for sight calculations.
                 * Unlike Creature.Input.circle, an entity within this area will be considered having collision with creature.
                 * It's based on its actual width and height.
                 * Sorta like a hitbox.
                 * </pre>
                 * @type {PIXI.Circle}
                 * @private
                 */
                    this.lower = new Ellipse()
                /**
                 * Drawing surface.
                 * @type {PIXI.Graphics}
                 * @private
                 * @readonly
                 */
                    this.sprite = this.creature.container.addChild(new Graphics())
                    this.sprite.alpha = Creature.Input.ALPHA

                //Links shapes to Creature data
                    let that = this
                    Object.defineProperties(this.circle, {
                        x:{get() { return that.x }, set() {}},
                        y:{get() { return that.y }, set() {}},
                        radius:{get() { return that.creature.sight.radius}, set() {}}
                    })
                    Object.defineProperties(this.lower, {
                        x:{get() { return that.x }, set() {}},
                        y:{get() { return that.y }, set() {}},
                        width:{get() { return that.creature.width/2 }, set() {}},
                        height:{get() { return that.creature.height/2 }, set() {}}
                    })
                    Object.defineProperty(this.polygon, "points", {
                        get() {
                            let x = that.x, y = that.y, dr = Math.pow(that.circle.radius, 2), ha = that.angle/2
                            let a = that.r - ha, b = that.r + ha
                            return [x, y, x+dr*Math.cos(a), y+dr*Math.sin(a), x+dr*Math.cos(b), y+dr*Math.sin(b), x, y]
                        },
                        set() {}
                    })

                //Render
                    this.render()
            }

        /**
         * Destructor.
         */
            destructor() {
                if (this.sprite) {
                    this.sprite.destroy()
                    this.sprite = null
                }
            }

        /**
         * Call destructor.
         */
            destroy() {
                this.destructor()
            }

        /**
         * X coordinate.
         * @type {Number}
         * @readonly
         */
            get x() {
                return this.creature.x
            }
        /**
         * Y coordinate.
         * @type {Number}
         * @readonly
         */
            get y() {
                return this.creature.y
            }
        /**
         * R coordinate (rotation).
         * @type {Number}
         * @readonly
         */
            get r() {
                return this.creature.r
            }

        /**
         * Sight angle (in rad).
         * @type {Number}
         * @readonly
         */
            get angle() {
                return this.creature.sight.angle
            }

        /**
         * Tell if a position if contained within input sight.
         * @param {Object} p - Position
         * @param {Number} p.x - X coordinate
         * @param {Number} p.y - Y coordinate
         * @param {Boolean} [lower=false] - Limit test to lower area only
         * @param {Number} [layer=this.creature.layer] - Layer to use
         * @return {Boolean} True if position is contained within input sight.
         */
            contains(p, lower = false, layer = this.creature.layer) {
                //If point is in lower circle
                    if (this.lower.contains(p.x, p.y)) { return true } else if (lower) { return false }
                //
                    if (!this.creature.manager.life.world.connected(this.creature, p, layer)) { return false }
                //If angle is equal to pi (or very similar) : must be in right half-circle
                    if (Math.abs(Math.PI - this.angle) < 0.01) { return (this.circle.contains(p.x, p.y))&&(p.x >= this.x) }
                //If angle is less than pi : must be in intersection between polygon and circle
                //If angle is more than pi : must be in circle but not in polygon
                    return (this.circle.contains(p.x, p.y))&&(this.angle < Math.PI ? this.polygon.contains(p.x, p.y) : !this.polygon.contains(p.x, p.y) )
            }

        /**
         * Render input sight.
         */
            render() {
                //Paremeters
                    let p = this.sprite.parent.toLocal({x:this.x, y:this.y}), ha = this.angle/2
                    let a = this.r - ha, b = this.r + ha
                //Drawing
                    this.sprite.clear().position.set(p.x, p.y)
                    this.sprite.beginFill(Creature.Input.COLOR).moveTo(0, 0).arc(0, 0, this.circle.radius, a, b).moveTo(0, 0).drawEllipse(0, 0, this.lower.width, this.lower.height).endFill()
            }

        /**
         * Show sight vision area and return itself.
         * @return {Creature.Input} Instance
         */
            show() {
                return (this.sprite.visible = true, this)
            }

        /**
         * Hide sight vision area and return itself.
         * @return {Creature.Input} Instance
         */
            hide() {
                return (this.sprite.visible = false, this)
            }

        /**
         * Retrieve nearby entities and filters only visible entities.
         * @param {String|String[]} [filters] - List of type filters
         * @return {Entity[]} Visible entities
         */
            visible(filters) {
                return this.creature.nearby(this.circle.radius, filters, true).filter(v => this.contains(v))
            }

        /**
         * Retrieve nearby entities and filters only visible entities with possible interactions.
         * @return {Entity[]} Visible entities with possible interactions
         */
            interactible() {
                return this.visible().filter(v => this.contains(v, true))
            }

        /**
         * Format data for usage by [Creature.Output]{@link CreatureOutput}
         * @return {Object} Prepared data
         */
            prepared() {
                return {
                    visible:this.visible().map(e => this.creature.from(e)),
                    interactible:this.interactible().map(e => this.creature.from(e)),
                    //
                }
            }
    }

/**
 * Render color.
 * @type {Number}
 * @memberof {CreatureInput}
 */
    Creature.Input.COLOR = 0x000000

/**
 * Render alpha.
 * @type {Number}
 * @memberof {CreatureInput}
 */
    Creature.Input.ALPHA = 0.4
