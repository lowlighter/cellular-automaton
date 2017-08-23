class Creature extends Entity {
    /**
     * <pre>
     * Create a new Berry Tree.
     * Should be called only by [Entity.Manager.create]{@link EntityManager#create}
     * </pre>
     * @param {Entity.Manager} manager - Entity manager
     * @param {Object} options - Options
     * @param {Number} options.x - Initial position of entity
     * @param {Number} options.y - Initial position of entity
     * @param {Number} [options.genes] - Genes
     * @category flora
     */
        constructor(manager, options) {
            //Heritage
                super(manager, Entity.SPRITES.MISSING, options)
            //Sprite padding
                this.padding = {x:0, y:12}

            /**
             * List of tree genes.
             * <ul>
             * <li>adaptability : Growth rate in specified biome. Can't grow if not compatible.</li>
             * <li>harvest : Number min and max of berries produced per harvest.</li>
             * <li>longetivity : Average lifetime.</li>
             * <li>fertility : Fertility rate of berries.</li>
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
                this._hp_indic = new Entity.Indicator(this.container, {radius:15})
            //Hunger value and indicator
                this._hunger_value = Creature.MAX_HUNGER
                this._hunger_indic = new Entity.Indicator(this.container, {radius:18, color:0x800000})


            /**
             * If set, tree will die at the end of next iteration.
             * @type {Boolean}
             */
                this.sudden_death = false


                this.gender = this.manager.life.random() > 0.5 ? "m" : "f"
                this.scale = Creature.MIN_SCALE
                this.r = 0

                this.inputs = new Creature.Input(this, this.genes.inputs)

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
                this.inputs = null
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
                this._hunger_value = Math.max(0, Math.min(v, Creature.MAX_HUNGER))
                this._hunger_indic.value(this._hunger_value/Creature.MAX_HUNGER)
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
                this.sprite.scale.set(v)
                this.sprite.position.y = this.padding.y * v
                if (this.inputs) { this.inputs.render() }
            }
            get scale() {
                return this.sprite.scale.x
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
                this.prepared = {
                    cycle:this.cycle+this.genes.growth_rate,
                    fertility:this.fertility+ (this.adult ? this.genes.fertility_rate : 0),
                    hp:this.hp + (this.hunger > 0 ? this.genes.hp_regen : this.genes.hunger_hp_loss),
                    hunger:this.hunger-this.genes.hunger_rate,
                    sudden_death:this.manager.life.reaper(this.age, this.genes.longetivity)
                }
            }

        /**
         * Update method (Synchronize next state properties).
         * @override
         */
            update() {
                //Apply changes
                    super.update()

                //
                    if (this.adult) {

                    }


                //Update animation speed
                    //this.sprite.animationSpeed = Entity.ANIMATION_SPEED * this.adaptability
                //

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
                //this.direction = Math.sign(-Math.cos(this.r))
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

             get mx() { return this.sight.radius }
             get my() { return this.sight.radius }

             get sight() { return {radius:this.genes.inputs.radius, angle:this.genes.inputs.angle} }

}


Creature.MIN_SCALE = 0.4
Creature.MAX_SCALE = 1.8

 Creature.DEFAULT_GENES = {
     hp_max:100,
     hp_regen:0.4,
     hunger_rate:0.1,
     hunger_hp_loss:0,//-0.1,
     longetivity:Infinity,
     growth_rate:0.1,
     max_size:1.8,
     fertility_rate:0.2,
     inputs:{
         radius:100,
         angle:0.3*Entity.PI2
     }
 }


 Creature.MAX_HUNGER = 100

 /**
  * Number of cycles to reach each stage.
  * @type {Object}
  * @readonly
  * @memberof Creature
  */
  Creature.MATURITY_CYCLES = 100

  Creature.FERTILITY_CYCLES = 100
