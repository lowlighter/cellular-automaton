class Creature extends Entity {
    /**
     * <pre>
     * Create a new creature.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}.
     * Creature are complex living entities, which are the heart of this cellular automaton.
     * They need to eat food to grow and stay alive (when hungry, they'll start to lose hp).
     * When mature enough, they'll be able to reproduce with a compatible creature of the opposite sex.
     * Some creatures are predators (which means they'll attack other creatures to get food) while other will be preys.
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @param {Number} [options.genes] - Genes
     * @category fauna
     */
        constructor(manager, options) {
            //Heritage
                super(manager, Entity.SPRITES.MISSING, options)
            //Sprite padding
                this.padding = {x:0, y:10}

            /**
             * List of tree genes.
             * <ul>
             * <li>Not yet available<li>
             * </ul>
             * @type {Object}
             */
                this.genes = options.genes||this.constructor.DEFAULT_GENES

            //Cycle value and indicator
                this._cycle_value = 0
                this._cycle_indic = new Entity.Indicator(this.container, {radius:12, color:0x000080, manager:this.manager, type:"cycle"})
            //Cycle value and indicator
                this._fertility_value = 0
                this._fertility_indic = new Entity.Indicator(this.container, {radius:12, color:0x0000FF, manager:this.manager, type:"fertility"})
            //Hp value and indicator
                this._hp_value = this.hp_max
                this._hp_indic = new Entity.Indicator(this.container, {radius:16, manager:this.manager, type:"hp"})
            //Hunger value and indicator
                this._hunger_value = Creature.MAX_HUNGER_VALUE
                this._hunger_indic = new Entity.Indicator(this.container, {radius:20, color:0x800000, manager:this.manager, type:"hunger"})
            //Action value and indicator
                this._action_value = 0
                this._action_indic = new Entity.Indicator(this.container, {radius:12, color:0xC8A820, manager:this.manager, type:"action"})
                this._action_text = this.container.addChild(new Text("", {fontSize:14, fontFamily:"Monospace", fill:0xFFFFFF}))

            /**
             * If set, tree will die at the end of next iteration.
             * @type {Boolean}
             */
                this.sudden_death = false

            /**
             * Current action.
             * @type {String}
             */
                this.action = null

            /**
             * Current action status. When true, this means that action has been (or will be) performed.
             * @type {Boolean}
             */
                this.done = false

            /**
             * Creature's gender.
             * @type {String}
             */
                this.gender = this.manager.life.random() > 0.5 ? "M" : "F"
                this.container.addChild(new Sprite.fromFrame(Creature.GENDER_SPRITE[this.gender])).anchor.set(1, 0)


            //Initialization
                this.scale = Creature.MIN_SCALE
                this.r = 0
                this.targets = []

            /**
             * Creature's inputs.
             * @type {Creature.Input}
             * @readonly
             */
                this.inputs = new Creature.Input(this, this.genes.inputs)
            /**
             * Creature's output (determine which action to perform at each iteration).
             * @type {Creature.Output}
             * @readonly
             */
                this.output = new Creature.Output(this)
        }

        /**
         * <pre>
         * Destructor.
         * Destroy container and sprite and remove reference from quadtree.
         * Also remove creature's inputs.
         * </pre>
         */
            destructor() {
                super.destructor()
                this.inputs.destroy()
                this.output.destroy()
                this.inputs = null
                this.output = null
            }

        /**
         * <pre>
         * Called on creature's death.
         * Will produce a certain amount of food and call destructor.
         * </pre>
         */
            die() {
                //Food creation
                    let food = this.size/Creature.POKEBLOCK_UNIT + this.manager.life.random(0.8, 1.2)
                    for (let i = 0; i < food; i++) {
                        let r = this.manager.life.random(Creature.POKEBLOCK_FALL_MIN_RADIUS, Creature.POKEBLOCK_FALL_MAX_RADIUS), t = this.manager.life.random(0, Entity.PI2)
                        this.manager.create(Pokeblock, {x:this.x+r*Math.cos(t), y:this.y+r*Math.sin(t)})
                    }
               //Destruction
                    this.destroy()
            }

        /**
         * Entity type. Allows to prevent usage of instanceof.
         * @virtual
         * @override
         * @readonly
         * @type {String}
         */
            get type() { return "creature" }

        /**
         * <pre>
         * HO (Health points).
         * Note that setting to 0 (or lower) doesn't instantly kill entity, it'll be killed at next iteration.
         * </pre>
         * @type {Number}
         */
            set hp(v) {
                this._hp_value = Math.min(v, this.hp_max)
                this._hp_indic.value(this._hp_value/this.hp_max)
            }
            get hp() {
                return this._hp_value
            }

        /**
         * <pre>
         * Hunger points.
         * Once it reaches 0, creature will start losing hp instead of regenerating.
         * </pre>
         * @type {Number}
         */
            set hunger(v) {
                this._hunger_value = Math.max(0, Math.min(v, Creature.MAX_HUNGER_VALUE))
                this._hunger_indic.value(this._hunger_value/Creature.MAX_HUNGER_VALUE)
            }
            get hunger() {
                return this._hunger_value
            }

        /**
         * <pre>
         * Cycle iterator (internal clock).
         * It allows to track creature's growth (both in size and in sexual maturity).
         * </pre>
         * @type {Number}
         */
            set cycle(v) {
                this._cycle_value = v
                this._cycle_indic.value(v/Creature.MATURITY_CYCLES)
                this.scale = this.size
            }
            get cycle() {
                return this._cycle_value
            }

        /**
         * Scale update. Note that it must be called after setting texture padding.
         * @type {Number}
         */
            set scale(v) {
                this.sprite.scale.set(this.direction * v, v)
                this.sprite.position.y = this.padding.y * v
                if (this.inputs) { this.inputs.render() }
            }
            get scale() {
                return this.sprite.scale.x
            }

        /**
         * Tell direction coefficient (apply mirror effect on sprite depending on current rotation).
         * @type {Number}
         * @readonly
         */
            get direction() {
                return Math.sign(-Math.cos(this.r))||1
            }

        /**
         * Current size of creature (also determine sprite scale).
         * @type {Number}
         * @readonly
         */
            get size() {
                return Math.max(Creature.MIN_SCALE, Math.min(this.cycle/Creature.MATURITY_CYCLES, this.genes.max_size, Creature.MAX_SCALE))
            }

        /**
         * Tell if creature reached maturity.
         * @type {Boolean}
         * @readonly
         */
            get adult() {
                return this.cycle >= Creature.MATURITY_CYCLES
            }


        /**
         * <pre>
         * Fertility cycle iterator (internal clock).
         * It allows to control creature's fertility.
         * </pre>
         * @type {Number}
         */
            set fertility(v) {
                this._fertility_value = v
                this._fertility_indic.value(Number.isNaN(this._fertility_value) ? 0 : v/Creature.FERTILITY_CYCLES)
            }
            get fertility() {
                return this._fertility_value
            }

        /**
         * <pre>
         * Tell if creature is ready to mate.
         * A creature is fertile if is reached the required number of fertility cycles.
         * Setting this to either true or false will instantly make creature fertile or infertile.
         * Setting this to null will prevent creature to have any children.
         * </pre>
         * @type {Boolean}
         */
            set fertile(v) {
                if (v === true) { this.fertility = Creature.FERTILITY_CYCLES }
                if (v === false) { this.fertility = 0 }
                if (v === null) { this.fertility = NaN }
            }
            get fertile() {
                //Side note : comparing NaN with any number will always return false
                    return this.fertility >= Creature.FERTILITY_CYCLES
            }

        /**
         * Compute next state properties.
         * @override
         */
            prepare() {
                //Update values
                    this.prepared = {
                        cycle:this.cycle + (this.hunger > 0 ? this.genes.growth_rate : 0),
                        fertility:this.fertility + (this.adult ? this.genes.fertility_rate : 0),
                        hp:this.hp + (this.hunger > 0 ? this.genes.stats.hp_regen : this.genes.hunger_hp_loss),
                        hunger:this.hunger-this.genes.hunger_rate,
                        sudden_death:this.manager.life.reaper(this.age, this.genes.longetivity),
                        busy:-1
                    }
                //Update action and target
                    this.prepared.action = this.output.prepare(this.inputs.prepared())
                //Update target infos
                    if ((this.targets.length)||("r" in this.prepared)) {
                        if (!("r" in this.prepared)) { this.prepared.r = this.r + this.from(this.targets[0]).angle }
                        if (!this.busy) {
                            this.prepared.x = this.x + Math.cos(this.prepared.r)*this.speed
                            this.prepared.y = this.y + Math.sin(this.prepared.r)*this.speed
                        }
                    }
            }

        /**
         * Update method (Synchronize next state properties).
         * @override
         */
            update() {
                //Apply changes
                    super.update()
                //Execute action
                    if (this.action in this) {
                        this[this.action]()
                        this.output.idle = 0
                    }

                //Update animation speed
                    if (this.alive) {
                        this.sprite.animationSpeed = Entity.ANIMATION_SPEED * this.adaptability
                    }
                //Sudden death
                    if ((this.sudden_death)||(this.hp <= 0)) {
                        this.die()
                    }
            }


        /**
        * Rotation angle (rad).
        * @type {Number}
        */
            set r(v) {
                this._r = ((v % Entity.PI2) + Entity.PI2) % Entity.PI2
                if (this.inputs) { this.inputs.render() }
            }
            get r()  {
                return this._r
            }

        /**
         * X coordinate (Coordinates are always rounded to prevent miscalulations).
         * @type {Number}
         */
            get x()  { return super.x }
            set x(v) {
                super.x = v
                if (this.inputs) { this.inputs.render() }
            }

        /**
         * Y coordinate (Coordinates are always rounded to prevent miscalulations).
         * @type {Number}
         */
             get y()  { return super.y }
             set y(v) {
                 super.y = v
                 if (this.inputs) { this.inputs.render() }
             }

        /**
         * X margin (used by quadtree, in order to have [Entity.nearby]{@link Entity#nearby} work correctly)
         * @type {Number}
         */
             get mx() { return this.genes ? this.sight.radius : 0 }

         /**
          * Y margin (used by quadtree, in order to have [Entity.nearby]{@link Entity#nearby} work correctly)
          * @type {Number}
          */
             get my() { return this.genes ? this.sight.radius : 0 }

        /**
         * Sight parameters (radius and angle), altered by adaptability.
         * @type {Object}
         * @readonly
         */
             get sight() { return {radius:this.genes.inputs.radius, angle:this.genes.inputs.angle} }

         /**
          * Speed, altered by adaptability.
          * @type {Object}
          * @readonly
          */
             get speed() { return this.genes.stats.speed*this.adaptability+Creature.MIN_SPEED }

             get hp_max() { return this.genes.stats.hp_max*(this.size/this.genes.max_size) }

         /**
          * Adaptability coefficient.
          * @type {Number}
          * @readonly
          */
             get adaptability() {
                 return (this.biome in this.genes.adaptability) ? this.genes.adaptability[this.biome] : 0
             }

         /**
          * Adaptability coefficient of next position.
          * @type {Number}
          * @readonly
          */
             get adaptability_next() {
                 let x = this.x + Math.cos(this.prepared.r)*this.speed
                 let y = this.y + Math.sin(this.prepared.r)*this.speed
                 return this.world.outside({x, y}) ? false : this.world.at(x, y).name in this.genes.adaptability
             }

         /**
          * Secondary targets (used mainly for pathfinding).
          * <div class="alert info">
          * To prevent errors caused by entity destructions, targets are always filtered checking if <span class="bold">alive</span> member is defined.
          * If you need to use non-Entity objects (e.g. position objects), add a <span class="bold">subtarget</span> member set to true to prevent removal.
          * </div>
          * @type {Entity[]|Object[]}
          */
             set targets(v) {
                 this._targets = v
             }
             get targets() {
                 this._targets = this._targets.filter(v => v.alive||v.subtarget)||[]
                 if ((this._targets.length > 1)&&(this.same_cell(this._targets[0]))) { this._targets.shift() }
                 return this._targets
             }

         /**
          * Current target (last element of [this.targets]{@link Creature#targets}).
          * @type {Entity|Object}
          */
             get target() {
                 return this.targets[this.targets.length-1]
             }
             set target(v) {
                 this.targets = [v === null ? {} : v]
             }

         /**
          * Tell if current target is visible (within sight).
          * @readonly
          * @type {Boolean}
          */
             get target_visible() {
                 return !!(this.target && this.inputs.contains(this.target))
             }

        /**
         * Tell if current target is interactible (action can be performed, within range).
         * @readonly
         * @type {Boolean}
         */
             get target_interactible() {
                 return !!(this.target && this.inputs.contains(this.target, true))
             }

        /**
         * Tell if another entity (or object containing a position) is on the same cell as current entity.
         * @param {Object|Entity} e - Entity
         * @return {Boolean} True if entity is on same cell
         */
             same_cell(e) {
                 return (e.cx == this.cx)&&(e.cy == this.cy)
             }

        /**
         * Compute euclidian and angular distance between current entity and another one.
         * @param {Entity} e - Other entity
         * @return {Object} Distance and angle
         */
             from(e) {
                 let r = {
                     entity:e,
                     distance:Math.sqrt(Math.pow(e.x-this.x, 2) + Math.pow(e.y-this.y, 2)),
                     angle:0
                 }
                 if (r.distance >= 1) {
                     r.angle = Math.atan2(e.y - this.y, e.x - this.x) - Math.atan2(Math.sin(this.r), Math.cos(this.r))
                 }
                 return r
             }

         /**
          * Graph layer to use (See [World.LAYERS]{@link World#LAYERS}).
          * @type {Number}
          * @virtual
          * @readonly
          */
              get layer() {
                  return 0
              }

        /**
         * <pre>
         * Current action.
         * Setting this value will update [busy]{@link Creature#busy} and [done]{@link Creature#done} values.
         * </pre>
         * @type {String}
         */
             set action(v) {
                //Reset done status if action has changed
                    if (this.action != v) {
                        this.busy = 0
                        this.done = false
                    }
                //Update data
                    this._previous_action = this.action
                    this._action_text.text = this._action = v
             }
             get action() {
                 return this._action
             }

        /**
         * Tell if previous action is different from the one given as parameter.
         * @param {String} action - Action name
         * @return {Boolean} True if previous action is different from the one given as parameter
         */
             wasnt(action) {
                 return this._previous_action != action
             }

        /**
         * Busy indicator (freeze creature's movements when performing an action).
         * <div class="alert warn">
         * This member works differently in getter and setter mode.
         * When set, use a negative value to decrement counter and a positive one to set it.
         * When get, only a boolean value will be returned based on current value.
         * </div>
         * @type {Boolean|Number}
         */
             get busy() {
                 return this._action_value > 0
             }
             set busy(v) {
                //Decrement if negative, set if positive
                    let old = this._action_value
                    this._action_value = (v < 0) ? this._action_value + v : v
                    this._action_value = Math.max(0, Math.min(this._action_value, Creature.MAX_ACTION_VALUE))
                //Set as done if counter is zero (only if it was greater before)
                    if ((old > 0)&&(v != 0)&&(this._action_value === 0)) { this.done = true }
                //Indicator upload
                    this._action_indic.value(this._action_value/Creature.MAX_ACTION_VALUE)
             }

        /**
         * Tell if an entity could reproduce with current entity.
         * @param {Entity} partner - Potential partner
         * @return {Boolean} True if sexually compatible
         */
             compatible(partner) {
                 return this.fertile && partner.fertile && (Creature.GENDER_COMPATIBILITY[this.gender].indexOf(partner.gender) >= 0)
             }

        /**
         * Tell if an entity could be eaten by current entity.
         * @param {Entity} food - Potential food
         * @return {Boolean} True if edible by current entity
         * @virtual
         */
             edible(food) {
                 return false
             }
}

/**
 * Default genes.
 * @type {Object}
 * @readonly
 * @memberof Creature
 */
    Creature.DEFAULT_GENES = {
        hunger_rate:0.02, //Hunger loss at each iteration
        hunger_hp_loss:-0.06, //Health points lost at each iteration if hunger is zero
        longetivity:Infinity, //Longetivity (decrease risk of sudden death if age is lower than this value)
        growth_rate:0.04, //Size increase at each iteration if hunger greater than zero
        egg_growth_rate:0.07, //Cycle increase at each iteration if it's an egg
        max_size:1.8, //Maximum size value (limited also by Creature.MAX_SCALE)
        fertility_rate:0.1, //Fertility point increase at each iteration
        adaptability:{ //List of adapted biome
            ABYSSAL_SEA:0.8,
            TROPICAL_SEA:0.9,
            TEMPERED_SEA:1,
        },
        inputs:{ //Inputs parameter
            radius:100, //Sight radius
            angle:0.3*Entity.PI2 //Sight angle
        },
        stats:{
            hp_max:100, //Max health points
            hp_regen:0.4, //Health points regen at each iteration
            speed:0.2 //Speed (for movements)
        }
    }

/**
 * Minimum speed value (this will also be the speed when a creature isn't adapted to its current biome).
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.MIN_SPEED = 0.01

/**
 * Minimum scale value (also size when a creature is born).
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.MIN_SCALE = 0.7

/**
 * Maximum scale value (a creature won't grow past this scale even if its genes allows it).
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.MAX_SCALE = 1.4

 /**
  * Sprite for each gender.
  * @type {Object}
  * @readonly
  * @memberof Creature
  */
    Creature.GENDER_SPRITE = {
        A:"M01_0.png",
        M:"M01_1.png",
        F:"M01_2.png",
    }

/**
 * Compatibility for each gender.
 * @type {Object}
 * @readonly
 * @memberof Creature
 */
    Creature.GENDER_COMPATIBILITY = {
        A:["M", "F"],
        F:["M", "A"],
        M:["F", "A"],
    }

/**
 * Max hunger value.
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.MAX_HUNGER_VALUE = 100

/**
 * Max action length value (used by [Creature.busy]{@link Creature#busy}).
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.MAX_ACTION_VALUE = 100

 /**
  * Number of cycles to reach each stage.
  * @type {Number}
  * @readonly
  * @memberof Creature
  */
    Creature.MATURITY_CYCLES = 100

/**
 * Number of cycles to reach sexual maturity.
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.FERTILITY_CYCLES = 100

/**
 * Sprite for target indicator.
 * @type {String}
 * @readonly
 * @memberof Creature
 */
    Creature.TARGET_SPRITE = "M04_0.png"

/**
 * Minimum distance from creature for pokeblock creation.
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.POKEBLOCK_FALL_MIN_RADIUS = 16
/**
 * Maximum distance from creature for pokeblock creation.
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.POKEBLOCK_FALL_MAX_RADIUS = 32

/**
 * Base unit from creature's size for amount of pokeblock creation.
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.POKEBLOCK_UNIT = 0.12
