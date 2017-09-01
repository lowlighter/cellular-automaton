class Biome {
    /**
     * <pre>
     * Instantiate a new biome instance.
     * It contains biome parameters (elevation and climate) and some methods to help biome alteration and edition.
     * [Biome.type]{@link Biome#type} method allows to find which biome match given parameters.
     * </pre>
     * @param {String} name - Biome name
     * @param {String} frame - Default frame name for texture
     * @param {Number} e - Elevation parameter
     * @param {Number} c - Climate parameter
     * @category world
     */
        constructor(name, frame, e, c) {
            /**
             * Name of biome.
             * @readonly
             * @type {String}
             */
                this.name = name

            /**
             * Default frame used by biome.
             * @readonly
             * @type {String}
             */
                this.frame = frame

            /**
             * Elevation scale.
             * @readonly
             * @type {Number}
             */
                this.elevation = e

            /**
             * Climate scale.
             * @readonly
             * @type {Number}
             */
                this.climate = c

            //Referencing biome
                Biome.LIST.set(this.name, this)
                Biome.MAX_ELEVATION = Math.max(Biome.MAX_ELEVATION, this.elevation)
                if (Life.ENV === "dev") { Biome.MAX_ELEVATION = Life.DEV.BIOME_MAX_ELEVATION }
        }

    /**
     * Tell if biome is same type as this one.
     * @param {Biome} as - Other biome to compare
     * @return {Boolean} True if same biome type
     */
        same(as) {
            return this.name === as.name
        }

    /**
     * Tell if current biome is lower than the one given as argument.
     * @param {Biome} than - Other biome to compare
     * @return {Boolean} True if current biome is lower
     */
        lower(than) {
            return this.elevation < than.elevation
        }

    /**
     * Tell if current biome is colder than the one given as argument.
     * @param {Biome} than - Other biome to compare
     * @return {Boolean} True if current biome is colder
     */
        colder(than) {
            return this.climate < than.climate
        }

    /**
     * Tell which type of biome have matching parameters.
     * <div class="alert info">
     * While <span class="bold">elevation</span> parameter is an integer, <span class="bold">climate</span> parameter is a float value between 0 and 1.
     * </div>
     * <div class="alert warning">
     * As biome's singleton reference is returned, any modification on it will affect <span class="bold">all</span> usage of this biome !
     * Be careful with it and avoid storing data in biomes instances.
     * </div>
     * @param {Number} e - Elevation parameter
     * @param {Number} c - Climate parameter
     * @return {Biome} Biome with given parameter
     */
        static type(e, c) {
            if (e <= 0) {
                return Biome.LIST.get("ABYSSAL_SEA")
            }
            if (e == 1) {
                if (c > 0.70) return Biome.LIST.get("TROPICAL_SEA")
                if (c > 0.40) return Biome.LIST.get("TEMPERED_SEA")
            }
            if (e == 2) {
                if (c > 0.80) return Biome.LIST.get("TROPICAL_BEACH")
                if (c > 0.60) return Biome.LIST.get("TEMPERED_BEACH")
                if (c > 0.40) return Biome.LIST.get("POLAR_BEACH")
            }
            if (e == 3) {
                if (c > 0.80) return Biome.LIST.get("JUNGLE")
                if (c > 0.60) return Biome.LIST.get("PLAINS")
                if (c > 0.40) return Biome.LIST.get("FOREST")
            }
            if (e == 4) {
                if (c > 0.80) return Biome.LIST.get("ARID_MOUNTAINS")
                if (c > 0.60) return Biome.LIST.get("MOUNTAINS")
                if (c > 0.40) return Biome.LIST.get("CAVES")
            }
            if (e == 5) {
                if (c > 0.80) return Biome.LIST.get("VOLCANIC_PEAK")
                if (c > 0.60) return Biome.LIST.get("ROCKY_PEAK")
                if (c > 0.40) return Biome.LIST.get("GLACIAL_PEAK")
            }
            return null
        }

    /**
     * <pre>
     * Initialize biome list.
     * Must be called before using biome list.
     * </pre>
     * <div class="alert warning">
     * Check that textures have been loaded in cache before calling this method.
     * </div>
     */
        static init() {
            //Tell that biomes have already been initialized.
                if (Biome.INIT) { return } else { Biome.INIT = true }
            /**
             * List of biomes.
             * @type {Map}
             * @readonly
             */
                Biome.LIST = new Map()
            /**
             * <pre>
             * Max elevation.
             * All biomes higher thatn this value won't be used by [World.generate]{@link World#generate}
             * </pre>
             * @type {Number}
             * @readonly
             */
             //(Initialized later)
                Biome.MAX_ELEVATION = 0
            /**
             * <pre>
             * Sea level (elevation).
             * All biomes lower than this value are considered as <span class="bold">aquatic</span>.
             * </pre>
             * @type {Number}
             * @readonly
             */
                Biome.SEA_LEVEL = 1

            //Create biomes
                new Biome("ABYSSAL_SEA", "B00_0.png", 0, 1)
                new Biome("TEMPERED_SEA", "B01_0.png", 1, 2)
                new Biome("TROPICAL_SEA", "B02_0.png", 1, 3)
                new Biome("POLAR_BEACH", "B03_0.png", 2, 1)
                new Biome("TEMPERED_BEACH", "B04_0.png", 2, 2)
                new Biome("TROPICAL_BEACH", "B05_0.png", 2, 3)
                new Biome("PLAINS", "B06_0.png", 3, 1)
                new Biome("FOREST", "B07_0.png", 3, 2)
                new Biome("JUNGLE", "B08_0.png", 3, 3)
                new Biome("CAVES", "B09_0.png", 4, 1)
                new Biome("MOUNTAINS", "B10_0.png", 4, 2)
                new Biome("ARID_MOUNTAINS", "B11_0.png", 4, 3)
                new Biome("GLACIAL_PEAK", "B12_0.png", 5, 1)
                new Biome("ROCKY_PEAK", "B13_0.png", 5, 2)
                new Biome("VOLCANIC_PEAK", "B14_0.png", 5, 3)
        }
}
