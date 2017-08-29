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
                this.padding = {x:0, y:12}

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
                this._cycle_indic = new Entity.Indicator(this.container, {radius:12, color:0x000080})
            //Cycle value and indicator
                this._fertility_value = 0
                this._fertility_indic = new Entity.Indicator(this.container, {radius:12, color:0x0000FF})
            //Hp value and indicator
                this._hp_value = this.genes.hp_max
                this._hp_indic = new Entity.Indicator(this.container, {radius:16})
            //Hunger value and indicator
                this._hunger_value = Creature.MAX_HUNGER_VALUE
                this._hunger_indic = new Entity.Indicator(this.container, {radius:20, color:0x800000})
            //Target indicator
                this._target_indic = this.container.addChild(new Sprite.fromFrame(Creature.TARGET_SPRITE))
                this._target_indic.anchor.set(0.5)
            //Action value and indicator
                this._action_value = 0
                this._action_indic = new Entity.Indicator(this.container, {radius:12, color:0xC8A820})
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
             * Current target.
             * @type {Entity|Object}
             */
                this.target = null

            /**
             * Creature's gender.
             * @type {String}
             */
                this.gender = this.manager.life.random() > 0.5 ? "M" : "F"
                this.container.addChild(new Sprite.fromFrame(Creature.GENDER_SPRITE[this.gender]))

            //Initialization
                this.scale = Creature.MIN_SCALE
                this.r = 0

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
                this._hp_value = Math.min(v, this.genes.hp_max)
                this._hp_indic.value(this._hp_value/this.genes.hp_max)
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
                        fertility:this.fertility+ (this.adult ? this.genes.fertility_rate : 0),
                        hp:this.hp + (this.hunger > 0 ? this.genes.hp_regen : this.genes.hunger_hp_loss),
                        hunger:this.hunger-this.genes.hunger_rate,
                        sudden_death:this.manager.life.reaper(this.age, this.genes.longetivity),
                        busy:-1
                    }
                //Update target infos
                    this.target_update()
                    if (this.target) {
                        let from = this.from(this.target)
                        this.prepared.r = this.r + from.angle
                        if (!this.busy) {
                            this.prepared.x = this.x + Math.cos(this.prepared.r)*this.speed
                            this.prepared.y = this.y + Math.sin(this.prepared.r)*this.speed
                        }
                    }
                //Update action
                    this.prepared.action = this.output.prepare(this.inputs.prepared())
            }

        /**
         * Update method (Synchronize next state properties).
         * @override
         */
            update() {
                //Apply changes
                    super.update()
                //Update animation speed
                    if (this.alive) {
                        this.sprite.animationSpeed = Entity.ANIMATION_SPEED * this.adaptability
                    }
                //Sudden death
                    if ((this.sudden_death)||(this.hp <= 0)) {
                        this.destroy()
                    }
            }


        /**
        * Rotation angle (rad).
        * @type {Number}
        */
            set r(v) {
                this._r = v % Math.PI_2
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
             get speed() { return this.genes.stats.speed }

         /**
          * Adaptability coefficient.
          * @type {Number}
          * @readonly
          */
             get adaptability() {
                 return (this.biome in this.genes.adaptability) ? this.genes.adaptability[this.biome] : 0
             }

        /**
         * Display creature's target.
         */
             target_update() {
                 if ((this.target)&&(!this.target.alive)) {
                     this.target = null
                 }

                 this._target_indic.visible = (this.target != null)
                 if (this.target) {
                     this._target_indic.position.set(this.target.x-this.x, this.target.y-this.y)
                 }
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
                 if (r.distance > 1) {
                     r.angle = Math.atan2(e.y - this.y, e.x - this.x) - Math.atan2(Math.sin(this.r), Math.cos(this.r))
                 }
                 return r
             }

        /**
         * <pre>
         * Current action.
         * Setting this value will call the associated method.
         * </pre>
         * @type {String}
         */
             set action(v) {
                 //Check if action exists
                     if (v in this) {
                         //Reset done status if action has changed
                            if (this._action != v) { this.done = false }
                        //Executing function
                            this[v]()
                            this._action = v
                            this._action_text.text = v
                     } else { this._action = null }
             }
             get action() {
                 return this._action
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
                    this._action_value = (v < 0) ? this._action_value + v : v
                    this._action_value = Math.max(0, Math.min(this._action_value, Creature.MAX_ACTION_VALUE))
                //Set as done if counter is zero
                    if (this._action_value === 0) { this.done = true }
                //Indicator upload
                    this._action_indic.value(this._action_value/Creature.MAX_ACTION_VALUE)
             }

        /**
         * Graph layer to use (See [World.LAYERS]{@link World#LAYERS}).
         * @type {Number}
         * @readonly
         */
             get layer() {
                 return 1
             }
}

/**
 * Default genes.
 * @type {Object}
 * @readonly
 * @memberof Creature
 */
    Creature.DEFAULT_GENES = {
        hp_max:100,
        hp_regen:0.4,
        hunger_rate:0.1,
        hunger_hp_loss:0,//-0.1,
        longetivity:Infinity,
        growth_rate:0.1,
        egg_growth_rate:1,
        max_size:1.8,
        fertility_rate:0.2,
        adaptability:{
            ABYSSAL_SEA:0.8,
            TROPICAL_SEA:0.9,
            TEMPERED_SEA:1,
        },
        inputs:{
            radius:100,
            angle:0.3*Entity.PI2
        },
        stats:{
            speed:0.2//0.05
        }
    }

/**
 * Minimum scale value (also size when a creature is born).
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.MIN_SCALE = 0.4

/**
 * Maximum scale value (a creature won't grow past this scale even if its genes allows it).
 * @type {Number}
 * @readonly
 * @memberof Creature
 */
    Creature.MAX_SCALE = 1.8

 /**
  * Sprite for each gender.
  * @type {Object}
  * @readonly
  * @memberof Creature
  */
    Creature.GENDER_SPRITE = {
        F:"M01_0.png",
        M:"M01_1.png",
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
