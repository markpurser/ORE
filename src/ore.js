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
        this._renderingCanvas = oreOptions.canvas;

        this._keyboard = new Keyboard();

        var tileWidthPx = oreOptions.tileWidthPx;
        var tileHeightPx = oreOptions.tileHeightPx;

        var mapViewWidth = oreOptions.mapViewWidth;
        var mapViewHeight = oreOptions.mapViewHeight;

        var viewPos = { x:2060, y:2070 };
        this._buffer = new ORE.Buffer(viewPos, mapViewWidth, mapViewHeight);

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

            var bufferWidth = mapViewWidth * 6;
            var bufferHeight = mapViewHeight * 6;

            // create a new instance of a pixi container
            var gameViewContainer = new PIXI.Container();
            var parentContainer = new PIXI.Container();

            parentContainer.addChild(gameViewContainer);
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

            ORE._renderer = PIXI.autoDetectRenderer(0, 0, pixiOptions);
            ORE._renderer.backgroundColor = 0x66ff99;

            // add the renderer view element to the DOM
            document.body.appendChild(ORE._renderer.view);


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

            // init tile buffer
            var buffer = [];
            _.range(bufferWidth).forEach(function(x)
            {
                _.range(bufferHeight).forEach(function(y)
                {
                    buffer[x + y * bufferWidth] = _.random(63);
                });
            });

            // init game sprites
            var sprites = [];    
            _.range(mapViewWidth).forEach(function(x)
            {
                _.range(mapViewHeight).forEach(function(y)
                {
                    var sprite = new PIXI.Sprite(tileTextures[0]);
                    sprite.position.x = x * tileWidthPx;
                    sprite.position.y = y * tileHeightPx;
                    sprite.width = tileWidthPx;
                    sprite.height = tileHeightPx;
                    sprites[x + y * mapViewWidth] = sprite;
                    gameViewContainer.addChild(sprite);
                });
            });

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
                gameViewContainer.position.x = -scrollX;
                gameViewContainer.position.y = -scrollY;

                var tempViewPos = { x:viewPos.x, y:viewPos.y };

                for(var y = 0; y < mapViewHeight; y++)
                {
//                    var offset = bufferX + (y + bufferY) * bufferWidth;
                    for(var x = 0; x < mapViewWidth; x++)
                    {
                        var tileCode = ORE._buffer.getTileCode(tempViewPos);
                        sprites[x + y * mapViewWidth].texture = tileTextures[tileCode];

                        tempViewPos.x++;
                    }
                    tempViewPos.y++;
                    tempViewPos.x = viewPos.x;
                }

                requestAnimationFrame(animate);

                // render
                ORE._renderer.render(parentContainer);
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
