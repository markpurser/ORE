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
    function Buffer(playerPos, pageWidth, pageHeight)
    {
        this._pageWidth = pageWidth;
        this._pageHeight = pageHeight;

        this.initialise(playerPos);

        console.log("Hello from Buffer constructor");
    }

    var p = Buffer.prototype;

    Buffer._bufferWidth = 6;
    Buffer._numPages = Buffer._bufferWidth * Buffer._bufferWidth;

    p.initialise = function(playerPos)
    {
        this.makeGridGraph();

        this.fillGeoCodes(playerPos);

        console.log("Hello from Buffer::initialise");
    };

    // Fill pages with geo codes
    p.fillGeoCodes = function(playerPos)
    {
        var tempPos = {x: playerPos.x - this._pageWidth*2, y: playerPos.y - this._pageHeight*2};
        var startx = tempPos.x;

        var width = Buffer._bufferWidth;
        var page = this._buffer[0];

        for(var i = 0; i < width; i++)
        {
            for(var j = 0; j < width; j++)
            {
                page.geoCode = this.geoCode(tempPos);

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
        }
    };

    // Create an undirected grid graph consisting of page nodes
    p.makeGridGraph = function()
    {
        var pagesQ = new Queue();
        this._buffer = [];

        for(var i = 0; i < Buffer._numPages; i++)
        {
            var page = { id: 'page-'+i, data: [], stale: true, l: null, r: null, u: null, d: null };
            this._buffer.push(page);
            pagesQ.enqueue(page);
        }

        this.linkAdjacencyProperties(pagesQ);
    };

    // Link the left, right, up and down (l,r,u,d) adjacency list of each page
    p.linkAdjacencyProperties = function(pagesQ)
    {
        var rowQ = new Queue();
        var width = Buffer._bufferWidth;

        // push the first row
        for(var i = 0; i < width; i++)
        {
            var p = pagesQ.dequeue();
            rowQ.enqueue(p);
            // rotate the first row back on to the end of the pagesQ so
            // that the final row gets linked to the first row
            pagesQ.enqueue(p);
        }

        // iterate rows
        for(i = 0; i < width; i++)
        {
            var nextRowQ = new Queue();

            // add the first page in the row to the end
            // this ensures that the final page in the row gets linked to the first
            rowQ.enqueue(rowQ.peek());

            // iterate columns
            for(var j = 0; j < width; j++)
            {
                var page = rowQ.dequeue();
                var nextRowPage = pagesQ.dequeue();

                page.r = rowQ.peek();
                page.r.l = page;
                page.d = nextRowPage;
                page.d.u = page;

                console.log(page);

                nextRowQ.enqueue(nextRowPage);
            }

            rowQ = nextRowQ;
        }
    };

    ORE.Buffer = Buffer;

})();
