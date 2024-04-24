/*jslint browser this */
/*global _, player */

(function (global) {
  "use strict";

  var computer = _.assign({}, player, {
    fleet: [],
    game: null,
    grid: [],
    tries: [],
    play: function () {
      var self = this;
      var x = Math.floor(Math.random() * 10);
      var y = Math.floor(Math.random() * 10);
      var isShot = self.tries[x][y];
      var successx = localStorage.getItem("successx");
      var successy = localStorage.getItem("successy");
      var left = Math.max(0, successx - 1);
      var right = Math.min(9, successx + 1);
      var top = Math.max(0, successy - 1);
      var bottom = Math.min(9, successy + 1);
      var direction = Math.floor(Math.random() * 4);
      function isValid(x, y) {
        /*   console.log("ligne",x);
                console.log("colonne",y); */
        return self.tries[x][y] === 0;
      }
      setTimeout(function () {
        if (localStorage.getItem("level") === "facile") {
          while (isShot !== 0) {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            isShot = self.tries[x][y];
          }
        } else if (localStorage.getItem("level") === "difficile") {
          /*   console.log(direction); */
          if (successx !== null && successy !== null) {
            while (true) {
              switch (direction) {
                case 0:
                  x = left;
                  y = successy;
                  break;
                case 1:
                  x = right;
                  y = successy;
                  break;
                case 2:
                  x = successx;
                  y = top;
                  break;
                case 3:
                  x = successx;
                  y = bottom;
                  break;
                default:
                  x = Math.floor(Math.random() * 10);
                  y = Math.floor(Math.random() * 10);
              }
              if (isValid(x, y)) {
                localStorage.removeItem("successx");
                localStorage.removeItem("successy");
                break;
              }
              direction = (direction + 1) % 4;
            }
          }
          if ((isShot !== 0 && successx === null) || direction === 0) {
            while (!isValid(x, y)) {
              x = Math.floor(Math.random() * 10);
              y = Math.floor(Math.random() * 10);
            }
          }
        }
        /*Fin de  l'ia ("on arrive au tir") */
        self.game.fire(this, x, y, function (hasSucced) {
          self.tries[x][y] = hasSucced;
          /* console.log(self.tries); */
          if (hasSucced === true) {
            localStorage.setItem("successx", x);
            localStorage.setItem("successy", y);
          }
        });
      }, 2000);
    },
    isShipOk: function (callback) {
      this.fleet.forEach(function (ship) {
        var positionValid = false;
        var y;
        var x;
        var i;
        var positionOk;
        while (!positionValid) {
          x = Math.floor(Math.random() * this.grid.length);
          y = Math.floor(Math.random() * this.grid[0].length);
          if (
            x + ship.getLife() < this.grid.length ||
            y + ship.getLife() < this.grid.length
          ) {
            positionOk = true;
            for (i = 0; i < ship.getLife(); i += 1) {
              if (this.grid[y][x + i] !== 0) {
                positionOk = false;
                break;
              }
            }
            if (positionOk) {
              for (i = 0; i < ship.getLife(); i += 1) {
                this.grid[y][x + i] = ship.getId();
              }
              positionValid = true;
              console.log(this.grid);
            }
          }
        }
      }, this);
      setTimeout(function () {
        callback();
      }, 500);
    },
    setGame: function (game) {
      this.game = game;
    },
  });
  global.computer = computer;
})(this);