/**
 * <pre>
 * Make current entity reproduce with another compatible entity.
 * </pre>
 * <div class="alert info">
 * This method is executed during [Creature.update]{@link Creature#update} execution.
 * </div>
 * @memberof Creature
 */
    Creature.prototype.reproduce = function () {

    }

/**
* <pre>
* Make current entity reproduce with another compatible entity.
* </pre>
 * <div class="alert info">
 * This method is executed during [Creature.prepare]{@link Creature#prepare} execution.
 * </div>
 * @param {String} - Data provided by [Creature.Output]{@link Creature#output}
 * @return {Boolean} True if action could be performed
 * @memberof Creature
 */
    Creature.prototype._reproduce = function (data) {
        //Check if creature is fertile
            if (data.length && this.fertile) {
                //Find possible partners
                    let partners = data.distance().visible.filter(v => this.compatible(v.entity))
                    if (partners.length) {
                        //Set a new target if isn't reproducing
                            if ((this.wasnt("reproduce"))||(!this.target)) {
                                this.targets = this.output.path(partners[0].entity)
                            }
                        //If partner is in range, reproduce
                            if (this.target && this.inputs.contains(this.target, true)) {
                                //Reproducing done
                                    if (this.done) {
                                        //New egg
                                            if (this.gender === "F") {
                                                this.manager.create(Creature.Egg, {x:this.x, y:this.y, species:this.constructor, genes:this.genes})
                                            }
                                        //Reset fertility
                                            this.prepared.fertile = false
                                            this.prepared.target = null
                                            this.done = false
                                            return true
                                    }
                                //Start reproducing
                                    if (!this.busy) { this.prepared.busy = 100 }
                            }
                        return true
                    }
            }
            return false
    }
