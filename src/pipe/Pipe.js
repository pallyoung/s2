'use strict'

const IDLE = 'idle';
const BUSY = 'busy';


function next(pipe, source) {
    var handler = pipe._handler;
    function _abort() {

    }
    function _next(newSource) {
        source = newSource || source;
        if (pipe._next) {
            next(pipe._next, source)
        } else {
            pipe._root.status = IDLE;
        }
    }
    handler(source, _next, _abort);

}

function abort(pipe) {
    pipe._root.status = IDLE;
}

function Pipe(handler) {    
    var self = this;
    if (!(this instanceof (Pipe))) {
        self = new Pipe(handler);
    } else {
        self._previous = null;
        self._next = null;
        self._handler = handler;
        self._root = {
            status: IDLE,
            root: self
        };
        Object.defineProperty(self, 'status', {
            get: function () {
                return this._root.status;
            }
        });
        Object.defineProperty(self, 'root', {
            get: function () {
                return this._root.root;
            }
        });
    }
    return self;
}
Pipe.prototype = {
    constructor: Pipe,
    source: function (source) {
        if (this.status === IDLE) {
            next(this.root, source);
        } else {
            throw new Error();
        }

    },
    remove: function () {
        this._root = {
            status: IDLE,
            root: this
        }
        var next = this._next;
        var previous = this._previous;
        if (next && previous) {
            next._previous = previous;
            previous._next = next;
        } else if (!next && previous) {
            previous._next = null;
        } else if (!previous && next) {
            next._previous = null;
            next._root.root = next;
        }

    },
    before: function (pipe) {
        if (pipe._next) {
            throw new Error();
        }

        pipe._next = this;
        pipe._previous = this._previous;
        this._previous = pipe;
        pipe._root = this._root;
        if (!pipe._previous) {
            pipe._root.root = pipe;
        }

    },
    after: function (pipe) {
        if (pipe._previous) {
            throw new Error();
        }
        pipe._previous = this;
        pipe._next = this._next;
        this._next = pipe;
        pipe._root = this._root;
    }
}

module.exports = Pipe;
