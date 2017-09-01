/**
 * <pre>
 * Make current entity wander.
 * This consist of moving entity pseudo-randomly.
 * </pre>
 * <div class="alert info">
 * This method is executed during [Creature.update]{@link Creature#update} execution.
 * </div>
 * @memberof Creature
 */
    Creature.prototype.wander = function () {

    }

/**
 * <pre>
 * Make current entity wander.
 * This consist of moving entity pseudo-randomly.
 * </pre>
 * <div class="alert info">
 * This method is executed during [Creature.prepare]{@link Creature#prepare} execution.
 * </div>
 * @param {String} - Data provided by [Creature.Output]{@link Creature#output}
 * @return {Boolean} True if action could be performed
 * @memberof Creature
 */
    Creature.prototype._wander = function (data) {
        if (this.output.after(50, "wander")) {
            //Angle incrementation
                let sign = Math.sign(this.manager.life.random()-0.5)
                this.prepared.r = this.r + sign * this.manager.life.random(0, 0.01)
            //Change direction randomly
                if (this.manager.life.random() < 0.4) {
                    this.prepared.r += sign * this.manager.life.random(0.100, 0.125)
                }
            //Reroll while not adapted
                let dt = 0.1*Entity.PI2
                for (let t = 0; t < Entity.PI2; t+=dt) {
                    if (this.adaptability_next) { break }
                    this.prepared.r += sign * dt
                }
            return true
        }
        return false
    }
