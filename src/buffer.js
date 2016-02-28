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

    p.makeAdjacencyList = function(queue)
    {
        var localQueue = new Queue();
        var adjacencyList = [];

        // first row
        for(var i = 0; i < Buffer._bufferWidth; i++)
        {
            localQueue.enqueue(queue.dequeue());
        }

        for(i = 0; i < Buffer._bufferWidth-1; i++)
        {
            var nextQueue = new Queue();

            localQueue.enqueue(localQueue.peek());

            for(var j = 0; j < Buffer._bufferWidth; j++)
            {
                var thisPage = localQueue.dequeue();

                console.log(thisPage);

                thisPage.r = localQueue.peek();
                thisPage.r.l = thisPage;
                thisPage.d = queue.dequeue();
                thisPage.d.u = thisPage;

                nextQueue.enqueue(thisPage.d);
            }

            localQueue = nextQueue;
        }
    };

    ORE.Buffer = Buffer;

})();
