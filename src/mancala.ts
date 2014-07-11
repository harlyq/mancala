module Mancala {
    var BUCKET_COLOR: string[] = ["#e0e0f0", "#f0f0e0"];

    enum PlayerID {
        One = 0, Two = 1
    };

    function getOpponent(id: PlayerID): PlayerID {
        if (id === PlayerID.One)
            return PlayerID.Two;
        else
            return PlayerID.One;
    }

    class Board {
        numPlayers: number = 2;
        buckets: number[] = [];

        constructor(public bucketsPerPlayer: number = 6, public stonesPerBucket = 4) {
            this.buckets.length = (bucketsPerPlayer + 1) * this.numPlayers;
            for (var i: number = this.buckets.length - 1; i >= 0; --i)
                this.buckets[i] = 0;

            this.reset();
        }

        reset() {
            var storeIndex = this.buckets.length * 0.5;
            for (var i: number = this.buckets.length - 1; i >= 0; --i) {
                if ((i % storeIndex) === 0)
                    this.buckets[i] = 0;
                else
                    this.buckets[i] = this.stonesPerBucket;
            }
        }

        getBucketValue(index: number): number {
            return this.buckets[index];
        }

        setBucketValue(index: number, value: number) {
            this.buckets[index] = value;
        }

        nextBucket(index: number): number {
            if (index >= this.buckets.length)
                return 0;
            else
                return index + 1;
        }

        oppositeBucket(index: number): number {
            var numBuckets: number = this.buckets.length;
            var opposite: number = index + numBuckets * 0.5;
            if (opposite >= numBuckets)
                opposite = opposite - numBuckets;

            return opposite;
        }

        isStore(index: number, id: PlayerID): boolean {
            if (id === PlayerID.One)
                return index === 0;
            else
                return index === this.buckets.length * 0.5;
        }

        getPlayerBuckets(id: PlayerID): number[] {
            var numPlayerBuckets = this.buckets.length * 0.5 - 1;
            var playerOffset: number = id * (numPlayerBuckets + 1);
            var playerBuckets: number[] = [];

            // the first bucket is the store
            for (var i: number = 0; i < numPlayerBuckets; ++i) {
                playerBuckets[i] = i + playerOffset + 1;
            }

            return playerBuckets;
        }

        getPlayerStore(id: PlayerID): number {
            return id * (this.buckets.length * 0.5 - 1);
        }

        getNumPlayerBuckets(): number {
            return this.buckets.length * 0.5 - 1;
        }
    }

    class Player {
        name: string = "";

        constructor(public id: PlayerID, private board: Board) {}

        getScore(): number {
            return board.getBucketValue(board.getPlayerStore(this.id));
        }
    }

    class GameRules {
        constructor(private board: Board) {}

        getAvailableBuckets(id: PlayerID): number[] {
            var playerBuckets = this.board.getPlayerBuckets(id);

            // loop backwards for removal
            for (var i: number = playerBuckets.length - 1; i >= 0; --i) {
                if (playerBuckets[i] == 0)
                    playerBuckets.splice(i, 1);
            }
            return playerBuckets;
        }

        // returns the last bucket
        moveStones(index: number, id: PlayerID): number {
            var opponent: PlayerID = getOpponent(id);
            var currentIndex: number = index;
            var numStones = this.board.getBucketValue(index);
            this.board.setBucketValue(index, 0);

            for (var i: number = 0; i < numStones; ++i) {
                currentIndex = this.board.nextBucket(currentIndex);
                if (this.board.isStore(index, opponent))
                    index = this.board.nextBucket(index); // skip the opponent's store

                this.board.setBucketValue(index, this.board.getBucketValue(index) + 1);
            }

            return currentIndex;
        }
    }

    function drawBucket(ctx, cx: number, cy: number, r: number, val: number) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText(val.toString(), cx, cy);
    }

    class BoardGraphic {
        constructor(private board: Board) {}

        draw(ctx) {
            var width = ctx.canvas.width;
            var height = ctx.canvas.height;
            var deltaX = width / (board.getNumPlayerBuckets() + 2 + 1);
            var deltaY = height / 6;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (var id: PlayerID = PlayerID.One; id <= PlayerID.Two; ++id) {
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
        }
    }

    var boardCanvas = null;
    var boardCtx = null;

    var board = new Board();
    var players: Player[] = [new Player(PlayerID.One, board), new Player(PlayerID.Two, board)];
    var gameRules = new GameRules(board);
    var boardGraphic = new BoardGraphic(board);

    function newGame() {
        board.reset();
    }

    function draw() {
        boardGraphic.draw(boardCtx)
    }

    window.addEventListener("load", function() {
        boardCanvas = document.getElementById("board");
        boardCtx = boardCanvas.getContext("2d");

        draw();
    });
}
