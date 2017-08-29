Creature.Output = class CreatureOutput {
        /**
         * <pre>
         * Create a new Creature Output.
         * This must be linked to a [Creature]{@link Creature}.
         * Act like its brain. Take creature's input and find which action should be undertaken.
         * All datas are provided by [Creature.Input]{@link CreatureInput}.
         * </pre>
         * @param {Creature} creature - Associated creature
         * @category fauna
         */
            constructor(creature) {
                //Reference to creature
                    this.creature = creature
            }

        /**
         * Destructor.
         */
            destructor() {
            }

        /**
         * Call destructor.
         */
            destroy() {
                this.destructor()
            }

        /**
         * This method will update Creature's target and action based on its input.
         * <div class="alert info">
         * If you're wanting to update crature's behavior, just edit this method content.
         * </div>
         * @param {Object} i - Input data
         * @return {String} Action to take
         */
            prepare(i) {

                if (i.interactible.length) {
                    i.interactible.sort((a, b) => a.distance > b.distance)
                    this.creature.prepared.target = i.visible[0].entity
                    return "eat"
                }
                if (i.visible.length) {
                    i.visible.sort((a, b) => a.distance > b.distance)
                    this.creature.prepared.target = i.visible[0].entity
                    return "move"
                }

                return "wander"
            }

    }
