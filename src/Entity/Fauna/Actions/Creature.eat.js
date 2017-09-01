/**
 * <pre>
 * Eat an entity.
 * </pre>
 * <div class="alert info">
 * This method is executed during [Creature.update]{@link Creature#update} execution.
 * </div>
 * @memberof Creature
 */
    Creature.prototype.eat = function () {

    }

/**
 * <pre>
 * Eat an entity.
 * </pre>
 * <div class="alert info">
 * This method is executed during [Creature.prepare]{@link Creature#prepare} execution.
 * </div>
 * @param {String} - Data provided by [Creature.Output]{@link Creature#output}
 * @return {Boolean} True if action could be performed
 * @memberof Creature
 */
    Creature.prototype._eat = function (data) {
        //Check if hungry
            if ((data.length)&&(this.hunger < 0.90*Creature.MAX_HUNGER_VALUE)) {
                //Find edible foods
                    let foods = data.distance().visible.filter(v => this.edible(v.entity))
                    if (foods.length) {
                        //Set a new target if isn't eating
                            if ((this.wasnt("eat"))||(!this.target)||(!this.edible(this.target))) {
                                this.targets = this.output.path(foods[0].entity)
                            }
                        //


                            if (this.target) {
                                //If food is in range, eat it
                                    if (this.inputs.contains(this.target, true)) {
                                        //Eating done
                                            if (this.done) {
                                                this.done = false
                                                if (this.target && this.edible(this.target)) { this.target.eaten(this) }
                                                return true
                                            }
                                        //Start eating
                                            if (!this.busy) { this.prepared.busy = 100 }
                                            return true
                                    }
                                //
                                    if ((this.from(this.target).distance > this.from(foods[0]).distance)) {
                                        this.targets = this.output.path(foods[0].entity)
                                    }
                            }
                        return true
                    }
            }
            return false
    }
