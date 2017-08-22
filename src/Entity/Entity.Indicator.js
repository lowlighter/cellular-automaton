Entity.Indicator = class EntityIndicator {
    /**
     * Create a new value indicator.
     * <div class="alert danger">
     * As it uses Graphics, indicators are redrawn at each update, which is lot of computations which can slow down automaton.
     * To prevent this, hide unused indicators.
     * </div>
     * @param {PIXI.Container} parent - Sprite container
     * @param {Object} [options] - Indicator options
     * @param {Number} [options.color=0x006800] - Default color
     * @param {Number} [options.radius=10] - Default radius
     * @param {Number} [options.width=2] - Default width
     * @category entities
     */
        constructor(parent, options = {}) {
            /**
             * Drawing surface.
             * @type {Graphics}
             */
                this.sprite = parent.addChild(new Graphics())

            /**
             * Color.
             * @type {Number}
             */
                this.color = options.color||0x006800

            /**
             * Radius.
             * @type {Number}
             */
                this.radius = options.radius||10

            /**
             * Width.
             * @type {Number}
             */
                this.width = options.width||2
        }

    /**
     * Show indicator and return itself.
     * @return {Indicator} Instance
     */
        show() {
            return (this.sprite.visible = true, this)
        }

    /**
     * Hide indicator and return itself.
     * @return {Indicator} Instance
     */
        hide() {
            return (this.sprite.visible = false, this)
        }

    /**
     * Value update.
     * @param {Number} - New value (in percentage)
     */
        value(value) {
            this.sprite.clear().lineStyle(this.width, this.color).arc(0, 0, this.radius, 0, value*Entity.Indicator.PI2)
        }

    /**
     * Destructor.
     */
        destructor() {
            this.sprite.destroy()
            this.sprite = null
        }
}

//Prevent recalculation of 2*PI
    Entity.Indicator.PI2 = Math.PI * 2
