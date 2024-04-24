/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var player = {
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        activeShip: 0,
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (ship.dom.parentNode) {
                    ship.dom.parentNode.removeChild(ship.dom);
                }
            });
        },
        explosionAnimation: function (cell) {
            cell.classList.add("explosion-animation");
            setTimeout(function () {
                cell.classList.remove("explosion-animation");
            }, 1000);
        },
        failureAnimation: function (cell) {
            cell.classList.add("water-animation");
            setTimeout(function () {
                cell.classList.remove("water-animation");
            }, 1000);
        },
        fleet: [],
        game: null,
        grid: [],
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        play: function (col, line) {
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                var tt = this.tries[line][col];
                if (tt === false || tt === true) {
                    return;
                }
                this.tries[line][col] = hasSucced;
            }, this));
        },
        receiveAttack: function (col, line, p, callback) {
            var succed = false;
            var tmp = col;
            if (p === 1) {
                col = line;
                line = tmp;
            }
            if (this.grid[col][line] !== 0) {
                succed = true;
                this.grid[col][line] = 0;
            }
            callback.call(undefined, succed);
        },
        renderTries: function (grid) {

            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var test = "rgb(174, 174, 174)";
                    var test1 = "rgb(230, 0, 25)";
                    var r = rid + 1;
                    var c = col + 1;
                    var select1 = ".row:nth-child(" + r + ")";
                    var select2 = ".cell:nth-child(" + c + ")";
                    var node = grid.querySelector(select1 + " " + select2);
                    var bk = node.style.backgroundColor;
                    if (val === true && node.style.backgroundColor === "") {
                        player.explosionAnimation(node);
                        node.style.backgroundColor = "#e60019";
                    } else if (val === false && bk === "") {
                        player.failureAnimation(node);
                        node.style.backgroundColor = "#aeaeae";
                    } else if (test === node.style.backgroundColor) {
                        return;
                    } else if (test1 === node.style.backgroundColor) {
                        return;
                    } else {
                        return;
                    }
                });
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        setActiveShipPosition: function (x, y) {
            var ship = this.fleet[this.activeShip];
            var shipLength = ship.getLife();
            var i = 0;

            if (this.validatePosition(x, y, ship)) {
                if (ship.dom.style.rotate === "") {
                    while (i < shipLength) {
                        this.grid[y][x + i] = ship.getId();
                        i += 1;
                    }
                    return true;
                } else {
                    while (i < shipLength) {
                        this.grid[y + i][x] = ship.getId();
                        i += 1;
                    }
                    return true;
                }

            } else {
                return false;
            }

        },
        setGame: function (game) {
            this.game = game;
        },
        tries: [],
        validatePosition: function (x, y, ship) {
            var shipLength = ship.getLife();
            var i = 0;

            if (ship.dom.style.rotate === "") {
                if (x + shipLength > 10 || y >= 10) {
                    return false;
                }
                while (i < shipLength) {
                    if (this.grid[y][x + i] !== 0) {
                        return false;
                    }
                    i += 1;
                }

            } else {
                if (x >= 10 || y + shipLength > 10) {
                    return false;
                }
                while (i < shipLength) {
                    if (this.grid[y + i][x] !== 0) {
                        return false;
                    }
                    i += 1;
                }
            }
            return true;
        }
    };
    global.player = player;

}(this));