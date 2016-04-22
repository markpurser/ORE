/*
* ORE - Online Roguelike Engine
*
* Copyright (C) 2016  Mark Purser
* Released under the MIT license
* http://github.com/markpurser/ORE/LICENSE
*/

/**
* @module SpriteGrid
*
* Facade for creation of grid of PIXI Sprites in a PIXI container
*/

this.ORE = this.ORE || {};

(function () {
    function SpriteGrid(gridWidth, gridHeight, tileWidthPx, tileHeightPx, tileTexture, sprites)
    {
        spriteContainer = new PIXI.Container();

        // init grid
        _.range(gridWidth).forEach(function(x)
        {
            _.range(gridHeight).forEach(function(y)
            {
                var sprite = new PIXI.Sprite(tileTexture);
                sprite.position.x = x * tileWidthPx;
                sprite.position.y = y * tileHeightPx;
                sprite.width = tileWidthPx;
                sprite.height = tileHeightPx;
                sprites[x + y * gridWidth] = sprite;
                spriteContainer.addChild(sprite);
            });
        });

        return spriteContainer;
    }


    ORE.SpriteGrid = SpriteGrid;

}());
