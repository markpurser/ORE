/*
* ORE - Online Roguelike Engine
*
* Copyright (C) 2016  Mark Purser
* Released under the MIT license
* http://github.com/markpurser/ORE/LICENSE
*/

/**
* @module Buffer
*
* Implements a multi-directional cyclic look-ahead buffer
*/

this.ORE = this.ORE || {};

(function () {
    function Buffer(viewPos, pageWidth, pageHeight, bufferSize)
    {
        this._pageWidth = pageWidth;
        this._pageHeight = pageHeight;
        this._bufferSize = bufferSize;
        this._numPages = bufferSize * bufferSize;

        this._firstPass = true;

        this.initialise(viewPos);

        console.log("Hello from Buffer constructor");
    }

    var p = Buffer.prototype;

    p.initialise = function(viewPos)
    {
        // makes the buffer into a grid graph of pages
        this.makeGridGraph();

        // identify all pages with a geo code
        this.fillGeoCodes(viewPos);

        // fill page data with random cells
        this.fillBufferTestData();

        console.log("Hello from Buffer::initialise");
    };

    p.updateDebugDisplay = function(pos, sprites, tileTextures)
    {
        var size = this._bufferSize;
        var page = this._buffer[0];

        for(var i = 0; i < size; i++)
        {
            for(var j = 0; j < size; j++)
            {
                var tex = tileTextures[0];

                if(page.stale)
                {
                    tex = tileTextures[1];
                }

                sprites[j + i * size].texture = tex;

                page = page.r;
            }
            page = page.d;
        }

        var geoCode = this.geoCode(pos);

        var f = this.findPage(geoCode);

        if(f.page)
        {
            sprites[f.x + f.y * size].texture = tileTextures[2];
        }
    };

    p.fastTileCode = function(pos, sprites, tileTextures)
    {
        var geoCode = this.geoCode(pos);

        if(this._firstPass)
        {
            this._geoCache = geoCode;
            this._firstPass = false;
        }

        var page = this.findPage(geoCode).page;
        var leftPage = page;

        if(page)
        {
            if(!_.isEqual(this._geoCache, geoCode))
            {
                var p = page.r.r.u.u;
                for(var k = 0; k < 5; k++)
                {
                    console.log("Stale");
                    var gc = p.l.geoCode;
                    console.log("Old gc=" + p.geoCode.x + " " + p.geoCode.y);
                    gc.x += this._pageWidth;
                    p.geoCode = gc;
                    console.log("New gc=" + p.geoCode.x + " " + p.geoCode.y);
                    p.stale = true;
                    p = p.d;
                }
                this._geoCache = geoCode;
            }

            var edge = { x: this._pageWidth, y: this._pageHeight };
            var offset = { x: pos.x - geoCode.x, y: pos.y - geoCode.y };

            var y = offset.y;

            for(var i = 0; i < edge.y; i++)
            {
                var x = offset.x;

                for(var j = 0; j < edge.x; j++)
                {
                    tileCode = page.data[x + y * this._pageWidth];
                    sprites[j + i * this._pageWidth].texture = tileTextures[tileCode];

                    x++;
                    if( x == edge.x )
                    {
                        x = 0;
                        page = page.r;
                    }
                }

                y++;
                if( y == edge.y )
                {
                    y = 0;
                    leftPage = leftPage.d;
                }

                page = leftPage;
            }
        }
    };

    p.findPage = function(geoCode)
    {
        var size = this._bufferSize;
        var page = this._buffer[0];

        for(var i = 0; i < size; i++)
        {
            for(var j = 0; j < size; j++)
            {
                if(_.isEqual(page.geoCode, geoCode))
                {
                    return {x: j, y: i, page: page};
                }
                page = page.r;
            }
            page = page.d;
        }

        return {x: -1, y: -1, page: null};
    };

    p.fillBufferTestData = function()
    {
        var size = this._bufferSize;
        var page = this._buffer[0];
        var cellValue = 0;

        for(var i = 0; i < size; i++)
        {
            for(var j = 0; j < size; j++)
            {
                this.fillPageTestData(page, cellValue);
                page = page.r;
                cellValue++;
            }
            page = page.d;
        }
    };

    p.fillPageTestData = function(page, cellValue)
    {
        for(var x = 0; x < this._pageWidth; x++)
        {
            for(var y = 0; y < this._pageHeight; y++)
            {
                page.data[x + y * this._pageWidth] = cellValue;
            }
        }
    };

    // Fill pages with geo codes
    p.fillGeoCodes = function(viewPos)
    {
        var tempPos = {x: viewPos.x - this._pageWidth*2, y: viewPos.y - this._pageHeight*2};
        var startx = tempPos.x;

        var size = this._bufferSize;
        var page = this._buffer[0];

        for(var i = 0; i < size; i++)
        {
            for(var j = 0; j < size; j++)
            {
                page.geoCode = this.geoCode(tempPos);

                console.log(page.geoCode);

                tempPos.x += this._pageWidth;
                page = page.r;
            }

            tempPos.x = startx;
            tempPos.y += this._pageHeight;
            page = page.d;
        }
    };

    p.geoCode = function(pos)
    {
        return {
            x: pos.x - ( pos.x % this._pageWidth ),
            y: pos.y - ( pos.y % this._pageHeight )
        };
    };

    // Create an undirected grid graph consisting of page nodes
    p.makeGridGraph = function()
    {
        var pagesQ = new Queue();
        this._buffer = [];

        for(var i = 0; i < this._numPages; i++)
        {
            var page = { id: 'page-'+i, data: [], stale: false, l: null, r: null, u: null, d: null };
            this._buffer.push(page);
            pagesQ.enqueue(page);
        }

        this.linkAdjacencyProperties(pagesQ);
    };

    // Link the left, right, up and down (l,r,u,d) adjacency list of each page
    p.linkAdjacencyProperties = function(pagesQ)
    {
        var rowQ = new Queue();
        var size = this._bufferSize;

        // push the first row
        for(var i = 0; i < size; i++)
        {
            var p = pagesQ.dequeue();
            rowQ.enqueue(p);
            // rotate the first row back on to the end of the pagesQ so
            // that the final row gets linked to the first row
            pagesQ.enqueue(p);
        }

        // iterate rows
        for(i = 0; i < size; i++)
        {
            var nextRowQ = new Queue();

            // add the first page in the row to the end
            // this ensures that the final page in the row gets linked to the first
            rowQ.enqueue(rowQ.peek());

            // iterate columns
            for(var j = 0; j < size; j++)
            {
                var page = rowQ.dequeue();
                var nextRowPage = pagesQ.dequeue();

                page.r = rowQ.peek();
                page.r.l = page;
                page.d = nextRowPage;
                page.d.u = page;

                nextRowQ.enqueue(nextRowPage);
            }

            rowQ = nextRowQ;
        }
    };

    ORE.Buffer = Buffer;

}());
