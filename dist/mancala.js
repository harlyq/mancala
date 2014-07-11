var Mancala;
(function (Mancala) {
    var BUCKET_COLOR = ["#e0e0f0", "#f0f0e0"];

    var PlayerID;
    (function (PlayerID) {
        PlayerID[PlayerID["One"] = 0] = "One";
        PlayerID[PlayerID["Two"] = 1] = "Two";
    })(PlayerID || (PlayerID = {}));
    ;

    function getOpponent(id) {
        if (id === 0 /* One */)
            return 1 /* Two */;
        else
            return 0 /* One */;
    }

    var Board = (function () {
        function Board(bucketsPerPlayer, stonesPerBucket) {
            if (typeof bucketsPerPlayer === "undefined") { bucketsPerPlayer = 6; }
            if (typeof stonesPerBucket === "undefined") { stonesPerBucket = 4; }
            this.bucketsPerPlayer = bucketsPerPlayer;
            this.stonesPerBucket = stonesPerBucket;
            this.numPlayers = 2;
            this.buckets = [];
            this.buckets.length = (bucketsPerPlayer + 1) * this.numPlayers;
            for (var i = this.buckets.length - 1; i >= 0; --i)
                this.buckets[i] = 0;

            this.reset();
        }
        Board.prototype.reset = function () {
            var storeIndex = this.buckets.length * 0.5;
            for (var i = this.buckets.length - 1; i >= 0; --i) {
                if ((i % storeIndex) === 0)
                    this.buckets[i] = 0;
                else
                    this.buckets[i] = this.stonesPerBucket;
            }
        };

        Board.prototype.getBucketValue = function (index) {
            return this.buckets[index];
        };

        Board.prototype.setBucketValue = function (index, value) {
            this.buckets[index] = value;
        };

        Board.prototype.nextBucket = function (index) {
            if (index >= this.buckets.length)
                return 0;
            else
                return index + 1;
        };

        Board.prototype.oppositeBucket = function (index) {
            var numBuckets = this.buckets.length;
            var opposite = index + numBuckets * 0.5;
            if (opposite >= numBuckets)
                opposite = opposite - numBuckets;

            return opposite;
        };

        Board.prototype.isStore = function (index, id) {
            if (id === 0 /* One */)
                return index === 0;
            else
                return index === this.buckets.length * 0.5;
        };

        Board.prototype.getPlayerBuckets = function (id) {
            var numPlayerBuckets = this.buckets.length * 0.5 - 1;
            var playerOffset = id * (numPlayerBuckets + 1);
            var playerBuckets = [];

            for (var i = 0; i < numPlayerBuckets; ++i) {
                playerBuckets[i] = i + playerOffset + 1;
            }

            return playerBuckets;
        };

        Board.prototype.getPlayerStore = function (id) {
            return id * (this.buckets.length * 0.5 - 1);
        };

        Board.prototype.getNumPlayerBuckets = function () {
            return this.buckets.length * 0.5 - 1;
        };
        return Board;
    })();

    var Player = (function () {
        function Player(id, board) {
            this.id = id;
            this.board = board;
            this.name = "";
        }
        Player.prototype.getScore = function () {
            return board.getBucketValue(board.getPlayerStore(this.id));
        };
        return Player;
    })();

    var GameRules = (function () {
        function GameRules(board) {
            this.board = board;
        }
        GameRules.prototype.getAvailableBuckets = function (id) {
            var playerBuckets = this.board.getPlayerBuckets(id);

            for (var i = playerBuckets.length - 1; i >= 0; --i) {
                if (playerBuckets[i] == 0)
                    playerBuckets.splice(i, 1);
            }
            return playerBuckets;
        };

        // returns the last bucket
        GameRules.prototype.moveStones = function (index, id) {
            var opponent = getOpponent(id);
            var currentIndex = index;
            var numStones = this.board.getBucketValue(index);
            this.board.setBucketValue(index, 0);

            for (var i = 0; i < numStones; ++i) {
                currentIndex = this.board.nextBucket(currentIndex);
                if (this.board.isStore(index, opponent))
                    index = this.board.nextBucket(index); // skip the opponent's store

                this.board.setBucketValue(index, this.board.getBucketValue(index) + 1);
            }

            return currentIndex;
        };
        return GameRules;
    })();

    function drawBucket(ctx, cx, cy, r, val) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText(val.toString(), cx, cy);
    }

    var BoardGraphic = (function () {
        function BoardGraphic(board) {
            this.board = board;
        }
        BoardGraphic.prototype.draw = function (ctx) {
            var width = ctx.canvas.width;
            var height = ctx.canvas.height;
            var deltaX = width / (board.getNumPlayerBuckets() + 2 + 1);
            var deltaY = height / 6;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (var id = 0 /* One */; id <= 1 /* Two */; ++id) {
                ctx.strokeStyle = BUCKET_COLOR[id];
                ctx.fillStyle = BUCKET_COLOR[id];

                var storeValue = board.getBucketValue(board.getPlayerStore(id));
                drawBucket(ctx, deltaX * (1 + id * (board.getNumPlayerBuckets() + 1)), height / 2, deltaX, storeValue); // store

                var playerBuckets = board.getPlayerBuckets(id);
                for (var i = 0; i < playerBuckets.length; ++i) {
                    var bucketValue = board.getBucketValue(playerBuckets[i]);
                    drawBucket(ctx, deltaX * 2 + i * deltaX, (2 * id + 1) * height / 4, deltaX / 3, bucketValue);
                }
            }
        };
        return BoardGraphic;
    })();

    var boardCanvas = null;
    var boardCtx = null;

    var board = new Board();
    var players = [new Player(0 /* One */, board), new Player(1 /* Two */, board)];
    var gameRules = new GameRules(board);
    var boardGraphic = new BoardGraphic(board);

    function newGame() {
        board.reset();
    }

    function draw() {
        boardGraphic.draw(boardCtx);
    }

    window.addEventListener("load", function () {
        boardCanvas = document.getElementById("board");
        boardCtx = boardCanvas.getContext("2d");

        draw();
    });
})(Mancala || (Mancala = {}));
