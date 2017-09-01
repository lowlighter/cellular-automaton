Entity.Indicator = class EntityIndicator {
    /**
     * Create a new value indicator.
     * This draws a circle based on one of current entity's value, allowing to visualize it quickly.
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
                this.sprite.alpha = 0.7

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
                this.width = options.width||4

            /**
             * Type (used for referencing).
             * @type {String}
             */
                this.type = options.type

            /**
             * Entities manager.
             * @type {Entity.Manager}
             */
                this.manager = options.manager

            //Referencing
                if (this.manager) {
                    this.manager.indicators.add(this)
                    if (this.manager._indicators_visible) { this.show() } else { this.hide() }
                }
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
            this.sprite.clear().lineStyle(this.width, this.color).arc(0, 0, this.radius, 0, value*Entity.PI2)
        }

    /**
     * Destructor.
     */
        destructor() {
            if (this.manager) { this.manager.indicators.delete(this) }
            this.sprite.destroy()
            this.sprite = null
        }
}
