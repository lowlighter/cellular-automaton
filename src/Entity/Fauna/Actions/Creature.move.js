/**
 * <pre>
 * Move current entity.
 * </pre>
 * <div class="alert info">
 * This method is executed during [Creature.update]{@link Creature#update} execution.
 * </div>
 * @memberof Creature
 */
    Creature.prototype.move = function () {

    }

/**
 * <pre>
 * Move current entity.
 * </pre>
 * <div class="alert info">
 * This method is executed during [Creature.prepare]{@link Creature#prepare} execution.
 * </div>
 * @param {String} - Data provided by [Creature.Output]{@link Creature#output}
 * @return {Boolean} True if action could be performed
 * @memberof Creature
 */
    Creature.prototype._move = function (data) {
        //Check if an action can be performed on current target
            return (this.target) && (!this.target_interactible)
    }
