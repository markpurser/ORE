/*
* ORE - Online Roguelike Engine
* Copyright (C) 2016  Mark Purser
* 
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
* 
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/**
* @module ORE
*/

this.ORE = this.ORE || {};

(function () {
    ORE.init = function (oreOptions)
    {
        this._renderingCanvas = oreOptions.canvas;

        var tileWidthPx = oreOptions.tileWidthPx;
        var tileHeightPx = oreOptions.tileHeightPx;

        var mapViewWidth = oreOptions.mapViewWidth;
        var mapViewHeight = oreOptions.mapViewHeight;

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

            var playerX = 0;

            // position of 'view'
            var bufferX = 16;
            var bufferY = 16;

            // create a renderer instance
            var pixiOptions = {
                clearBeforeRender: true,
                preserveDrawingBuffer: false,
                resolution: 1,
                view: this._renderingCanvas
            };

            ORE._renderer = PIXI.autoDetectRenderer(0, 0, pixiOptions);
            ORE._renderer.backgroundColor = 0x66ff99;

            // add the renderer view element to the DOM
            document.body.appendChild(ORE._renderer.view);


            // init tile textures
            var tileTextures = [];
            _.each(_.range(numTilesX), function(x)
            {
                _.each(_.range(numTilesY), function(y)
                {
                    var rect = new PIXI.Rectangle(x * tileWidthPx, y * tileHeightPx, tileWidthPx, tileHeightPx);
                    tileTextures[x + y * numTilesX] = new PIXI.Texture(resources.tilesheet.texture, rect);
                });
            });

            // init tile buffer
            var buffer = [];
            _.each(_.range(bufferWidth), function(x)
            {
                _.each(_.range(bufferHeight), function(y)
                {
                    buffer[x + y * bufferWidth] = _.random(63);
                });
            });

            // init game sprites
            var sprites = [];    
            _.each(_.range(mapViewWidth), function(x)
            {
                _.each(_.range(mapViewHeight), function(y)
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

                _.each(_.range(mapViewHeight), function(y)
                {
                    var offset = bufferX + (y + bufferY) * bufferWidth;
                    _.each(_.range(mapViewWidth), function(x)
                    {
                        var tileCode = buffer[offset++];
                        sprites[x + y * mapViewWidth].texture = tileTextures[tileCode];
                    });
                });

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