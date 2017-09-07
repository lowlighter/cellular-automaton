class Magicarpe extends Creature {
    /**
     * <pre>
     * Create a new Pokemon.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}, see [Creature]{@link Creature} for more informations.
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {Object} options - Options
     * @category pokemon
     * @extends Creature
     */
        constructor(manager, options) {
            //Heritage
                super(manager, options)
            //Sprite padding
                this.texture = (this.gender === "F")&&(this.constructor.SPRITE_F) ? this.constructor.SPRITE_F : this.constructor.SPRITE
                this.padding = {x:0, y:12}
        }

    /**
     * Graph layer to use (See [World.LAYERS]{@link World#LAYERS}).
     * @type {Number}
     * @virtual
     * @readonly
     */
         get layer() {
             return 1
         }
    /**
     * Tell if an entity could be eaten by current entity.
     * @param {Entity} food - Potential food
     * @return {Boolean} True if edible by current entity
     * @virtual
     */
        edible(food) {
            return food.type === "pokeblock"
        }
}

/**
 * Frame name for pokemon sprite (default, and for males).
 * @memberof Magicarpe
 */
    Magicarpe.SPRITE = "P01"

/**
 * Frame name for pokemon sprite (for females, define it only when it exists).
 * @memberof Magicarpe
 */
    Magicarpe.SPRITE_F = "P01b"
