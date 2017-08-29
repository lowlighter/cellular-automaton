//Alias
    let Container = PIXI.Container
    let Sprite = PIXI.Sprite
    let ParticleContainer = PIXI.ParticleContainer
    let Graphics = PIXI.Graphics
    let Quadtree = Lowlight.Quadtree
    let Random = Lowlight.Random
    let Astar = Lowlight.Astar.Configuration
    let Texture = PIXI.Texture
    let Circle = PIXI.Circle
    let Polygon = PIXI.Polygon
    let Ellipse = PIXI.Ellipse
    let Text = PIXI.Text

//Misc
    Math.PI_2 = Math.PI * 2

//Search textures from an Animated Texture
    function AnimatedTexture(frame) {
        let i = 0, textures = []
        while (`${frame}_${i}.png` in PIXI.utils.TextureCache) { textures.push(PIXI.Texture.fromFrame(`${frame}_${i++}.png`)) }
        return textures.length ? textures : [PIXI.Texture.EMPTY]
    }

//Create an Animated Sprite
    function AnimatedSprite(frame) {
        return new PIXI.extras.AnimatedSprite(AnimatedTexture(frame))
    }
