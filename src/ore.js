/*
* ORE - Online Roguelike Engine
*
* Copyright (C) 2016  Mark Purser
* Released under the MIT license
* http://github.com/markpurser/ORE/LICENSE
*
* Tile rendering based on
* https://github.com/jice-nospam/yendor.ts
* Copyright (c) 2014 Jice
*/

/**
* @module ORE
*/

this.ORE = this.ORE || {};

(function () {
    ORE.init = function (oreOptions)
    {
        this._renderingCanvas = oreOptions.renderCanvas;
        this._debugCanvas = oreOptions.debugCanvas;

        this._keyboard = new Keyboard();

        var tileWidthPx = oreOptions.tileWidthPx;
        var tileHeightPx = oreOptions.tileHeightPx;

        var spriteGridWidth = oreOptions.viewWidth;
        var spriteGridHeight = oreOptions.viewHeight;

        var viewPos = { x:2060, y:2070 };
        this._buffer = new ORE.Buffer(viewPos, spriteGridWidth, spriteGridHeight);

        var loader = PIXI.loader;
        loader.add('tilesheet', oreOptions.tilesheetImage);
        loader.load( function( loader, resources )
        {
            var stats = {
                fpsText: new PIXI.Text('', {font: '24px Arial', fill: 0xff1010}),
                fpsTimer: 0,
                currentFrameCount: 0
            };

            var numTilesX = resources.tilesheet.texture.width / tileWidthPx;
            var numTilesY = resources.tilesheet.texture.height / tileHeightPx;

            var bufferSize = 6;
            var bufferWidth = spriteGridWidth * bufferSize;
            var bufferHeight = spriteGridHeight * bufferSize;

            // init tile textures
            var tileTextures = [];
            _.range(numTilesX).forEach(function(x)
            {
                _.range(numTilesY).forEach(function(y)
                {
                    var rect = new PIXI.Rectangle(x * tileWidthPx, y * tileHeightPx, tileWidthPx, tileHeightPx);
                    tileTextures[x + y * numTilesX] = new PIXI.Texture(resources.tilesheet.texture, rect);
                });
            });

            // create a new instance of a pixi container
            var parentContainer = new PIXI.Container();

            var worldSprites = [];    
            var worldSpriteContainer = ORE.SpriteGrid(
                spriteGridWidth, spriteGridHeight, tileWidthPx, tileHeightPx, tileTextures[0], worldSprites);

            var debugSprites = [];    
            var debugSpriteContainer = ORE.SpriteGrid(
                bufferSize, bufferSize, tileWidthPx, tileHeightPx, tileTextures[0], debugSprites);


            parentContainer.addChild(worldSpriteContainer);
            parentContainer.addChild(stats.fpsText);

            var playerX = viewPos.x * tileWidthPx;
            var playerY = viewPos.y * tileHeightPx;

            // create a renderer instance
            var pixiOptions = {
                clearBeforeRender: true,
                preserveDrawingBuffer: false,
                resolution: 1,
                view: ORE._renderingCanvas
            };

            ORE._renderer = PIXI.autoDetectRenderer(
                oreOptions.renderCanvasSize.width, oreOptions.renderCanvasSize.height, pixiOptions);
            ORE._renderer.backgroundColor = 0x66ff99;

            // create a renderer instance
            var pixiOptions2 = {
                clearBeforeRender: true,
                preserveDrawingBuffer: false,
                resolution: 2,
                view: ORE._debugCanvas
            };

            ORE._debugRenderer = PIXI.autoDetectRenderer(
                oreOptions.debugCanvasSize.width, oreOptions.debugCanvasSize.height, pixiOptions2);
            ORE._debugRenderer.backgroundColor = 0xaa4444;

            // add the renderer view element to the DOM
            //document.body.appendChild(ORE._renderer.view);


            requestAnimationFrame(animate);

            function animate()
            {
                if(oreOptions.displayStats)
                {
                    ORE.updateStats(stats);
                }

                if(ORE._keyboard.isKeyPressed(Keyboard.KEYS.UP))
                {
                    playerY--;
                }

                if(ORE._keyboard.isKeyPressed(Keyboard.KEYS.DOWN))
                {
                    playerY++;
                }

                if(ORE._keyboard.isKeyPressed(Keyboard.KEYS.LEFT))
                {
                    playerX--;
                }

                if(ORE._keyboard.isKeyPressed(Keyboard.KEYS.RIGHT))
                {
                    playerX++;
                }

                viewPos.x = playerX >> 4;
                viewPos.y = playerY >> 4;
                var scrollX = playerX & 15;
                var scrollY = playerY & 15;
                worldSpriteContainer.position.x = -scrollX;
                worldSpriteContainer.position.y = -scrollY;

                ORE._buffer.fastTileCode(viewPos, worldSprites, tileTextures);

                requestAnimationFrame(animate);

                // render
                ORE._renderer.render(parentContainer);
                ORE._debugRenderer.render(debugSpriteContainer);
            }
        });
    };

    ORE.updateStats = function (stats)
    {
        stats.currentFrameCount++;
        if( stats.fpsTimer === 0 )
        {
            stats.fpsTimer = new Date().getTime();
        }
        else if( new Date().getTime() - stats.fpsTimer > 1000 )
        {
            var rendererTypeStr = 'Canvas';
            if(ORE._renderer instanceof PIXI.WebGLRenderer)
            {
                rendererTypeStr = 'WebGL';
            }
            stats.fpsText.text = 'fps: ' + stats.currentFrameCount + '\npixi: ' + PIXI.VERSION + '\nRenderer: ' + rendererTypeStr;
            stats.fpsTimer = new Date().getTime();
            stats.currentFrameCount = 0;
        }
    };

})();
