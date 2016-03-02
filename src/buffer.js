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
* Implements a multi-directional look-ahead buffer
*/

this.ORE = this.ORE || {};

(function () {
    function Buffer(pageWidth, pageHeight)
    {
        this._pageWidth = pageWidth;
        this._pageHeight = pageHeight;

        this.initialise();

        console.log("Hello from Buffer constructor");
    }

    var p = Buffer.prototype;

    Buffer._bufferWidth = 6;
    Buffer._numPages = Buffer._bufferWidth * Buffer._bufferWidth;

    p.initialise = function()
    {
        this.makeGridGraph();

        console.log("Hello from Buffer::initialise");
    };

    // Create an undirected grid graph of pages
    p.makeGridGraph = function()
    {
        var queue = new Queue();
        this._buffer = [];

        for(var i = 0; i < Buffer._numPages; i++)
        {
            var page = { id: 'page-'+i, data: [], l: null, r: null, u: null, d: null };
            this._buffer.push(page);
            queue.enqueue(page);
        }

        this.makeAdjacencyList(queue);
    };

    p.makeAdjacencyList = function(allPagesQ)
    {
        var rowQ = new Queue();
        var adjacencyList = [];
        var width = Buffer._bufferWidth;

        // push the first row
        for(var i = 0; i < width; i++)
        {
            var p = allPagesQ.dequeue();
            rowQ.enqueue(p);
            // sneak the first row back on to the end of the all pages Q so
            // that the final row gets linked to the first row
            allPagesQ.enqueue(p);
        }

        // iterate rows
        for(i = 0; i < width; i++)
        {
            var nextRowQ = new Queue();

            // make the first page in the row appear at the beginning and end
            // this ensures that the final page in the row gets linked to the first
            rowQ.enqueue(rowQ.peek());

            // iterate columns
            for(var j = 0; j < width; j++)
            {
                var page = rowQ.dequeue();

                page.r = rowQ.peek();
                page.r.l = page;
                page.d = allPagesQ.dequeue();
                page.d.u = page;

                console.log(page);

                nextRowQ.enqueue(page.d);
            }

            rowQ = nextRowQ;
        }
    };

    ORE.Buffer = Buffer;

})();
