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
                    //this._cycle_value = 0
                    //this._cycle_indic = new Entity.Indicator(this.container)

                this._hp_value = this.genes.hp_max
                this._hp_indic = new Entity.Indicator(this.container, {radius:10})


                this._hunger_value = Creature.MAX_HUNGER
                this._hunger_indic = new Entity.Indicator(this.container, {radius:16, color:0x800000})



            /**
             * If set, tree will die at the end of next iteration.
             * @type {Boolean}
             */
                this.sudden_death = false


                this.gender = this.manager.life.random() > 0.5 ? "m" : "f"

                //this.sight = new Creature.Sight()
        }

        /**
         * <pre>
         * Destructor.
         * Destroy container and sprite and remove reference from quadtree.
         * Also remove creature's sight.
         * </pre>
         */
            destructor() {
                super.destructor()
                this.sight = null
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
         * Cycle iterator (internal clock).
         * @type {Number}
         */
            set cycle(v) {
                this._cycle_value = v
                this._cycle_indic.value(v*this.adaptability/BerryTree.CYCLES[this.stage])
            }
            get cycle() {
                return this._cycle_value
            }


        /**
         * Compute next state properties.
         * @override
         */
            prepare() {
                this.prepared = {
                    cycle:this.cycle+1,
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


                //Update animation speed
                    //this.sprite.animationSpeed = Entity.ANIMATION_SPEED * this.adaptability
                //

                //Sudden death
                    if ((this.sudden_death)||(this.hp <= 0)) {
                        this.destroy()
                    }
            }


}


 Creature.DEFAULT_GENES = {
     hp_max:100,
     hp_regen:0.4,
     hunger_rate:0.1,
     hunger_hp_loss:-0.1,
     longetivity:Infinity
 }

 Creature.MAX_HUNGER = 100
