Creature.Input = class CreatureInput {
        /**
         * <pre>
         * Create a new Creature Input.
         * Contains essentially creature's sight and range action.
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
         * @return {Boolean} True if position is contained within input sight.
         */
            contains(p) {
                //If point is in lower circle
                    if (this.lower.contains(p.x, p.y)) { return true }
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


            visible() {
                console.warn("Creature.Input.visible not implemented yet")
            }

            interactable() {
                console.warn("Creature.Input.interactable not implemented yet")
            }



            list() {
                console.warn("Creature.Input.list not implemented yet")
                /*
                    return {
                        hp:...
                        hunger...
                        visible:[{entity:..., distance:...}, ...]
                        interactable:idem,
                        last_action:...
                    }

                    Structure qui permettra à Creature.Output de déterminer quelle(s) action(s) sont prioritaires
                    et d'agir.
                */
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
