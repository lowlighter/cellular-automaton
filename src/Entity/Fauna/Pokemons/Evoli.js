class Evoli extends Creature {
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
                this.padding = {x:0, y:4}
        }

    /**
     * Graph layer to use (See [World.LAYERS]{@link World#LAYERS}).
     * @type {Number}
     * @virtual
     * @readonly
     */
         get layer() {
             return 2
         }
    /**
     * Tell if an entity could be eaten by current entity.
     * @param {Entity} food - Potential food
     * @return {Boolean} True if edible by current entity
     * @virtual
     */
        edible(food) {
            return food.type === "berry"
        }
}

/**
 * Frame name for pokemon sprite (default, and for males).
 * @memberof Magicarpe
 */
    Evoli.SPRITE = "P02"

/**
 * Frame name for pokemon sprite (for females, define it only when it exists).
 * @memberof Magicarpe
 */
    Evoli.SPRITE_F = null

/**
 * Default genes.
 * @type {Object}
 * @readonly
 * @memberof Creature
 */
    Evoli.DEFAULT_GENES = {
        hp_max:100, //Max health points
        hp_regen:0.4, //Health points regen at each iteration
        hunger_rate:0.02, //Hunger loss at each iteration
        hunger_hp_loss:-0.06, //Health points lost at each iteration if hunger is zero
        longetivity:Infinity, //Longetivity (decrease risk of sudden death if age is lower than this value)
        growth_rate:0.04, //Size increase at each iteration if hunger greater than zero
        egg_growth_rate:0.07, //Cycle increase at each iteration if it's an egg
        max_size:1.8, //Maximum size value (limited also by Creature.MAX_SCALE)
        fertility_rate:0.1, //Fertility point increase at each iteration
        adaptability:{ //List of adapted biome
            TEMPERED_BEACH:1,
            POLAR_BEACH:0.6,
            TROPICAL_BEACH:0.8,
        },
        inputs:{ //Inputs parameter
            radius:120, //Sight radius
            angle:0.7*Entity.PI2 //Sight angle
        },
        stats:{
            speed:0.2 //Speed (for movements)
        }
    }
