/**
 * <pre>
 * Eat an entity.
 * This checks if given entity is food, and that it's in range, and start action counter.
 * When done, target will be eaten.
 * </pre>
 * @param {Entity} - Target
 * @memberof Creature
 */
    Creature.prototype.eat = function () {
        let e = this.target
        if (this.done) {
            e.eaten(this)
        } else {
            if ((e.type === "pokeblock")&&(this.inputs.contains(e, true))) {
                if (this.action != "eat") this.busy = 70
                this.target = null
            }
        }
    }
