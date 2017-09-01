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

                    this.idle = 0
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
         * <pre>
         * Compute a path to reach target.
         * Altough it takes absolute coordinate as parameter (x and y), pathfinding uses cell coordinate (cx and cy) for simplicity and faster computing.
         * To prevent having a smooth path, it's possible to add noise (while staying the same cell).
         * </pre>
         * @param {Object} [to] - Destination (containing absolute x and y)
         * @param {Number} [noise=1] - Noise to add to each subtarget to
         * @return {Object[]} Array containing list of subtarget to reach to attain target
         */
            path(to, noise = 1) {
                //Compute path
                    let path = this.creature.world.path(this.creature, to, this.creature.layer)
                //Add noise to each subtarget
                    let size = this.creature.world.cell_size, d = noise * (size/2)
                    path = path.map(v => {
                        return {
                            cx:v.x, cy:v.y, subtarget:true,
                            x:(v.x + 0.5)*size + this.life.random(-d, +d),
                            y:(v.y + 0.5)*size + this.life.random(-d, +d)
                        }
                    })
                //Replace last cell by target
                    if (path.length) { path[path.length-1] = to }
                return path
            }

        /**
         * Life reference.
         * @type {Life}
         * @readonly
         */
            get life() { return this.creature.manager.life }

        /**
         * Tell if a certain amount of time has been passed.
         * @param {Number} idle - Number of successive idle iterations
         * @param {String|String[]} [actions] - Actions
         */
            after(idle, actions = []) {
                return (this.idle >= idle) || ((Array.isArray(actions) ? actions : [actions]).indexOf(this.creature.action) >= 0)
            }

        /**
         * This method will update Creature's target and action based on its input.
         * <div class="alert info">
         * If you're wanting to update creature's behavior, just edit this method content.
         * </div>
         * @param {Object} data - Input data
         * @return {String} Action to take
         */
            prepare(data) {
                //Priorities
                    if (this.creature._reproduce(data)) return "reproduce"
                    if (this.creature._eat(data)) return "eat"
                    if (this.creature._move(data)) return "move"
                    if (this.creature._wander(data)) return "wander"

                //Increment idle counter if no action has been taken
                    this.idle++
            }

    }
