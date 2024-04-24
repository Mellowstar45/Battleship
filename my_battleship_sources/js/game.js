/*jslint browser this */
/*global _, player, computer, utils */

(function () {
  "use strict";

  var Sound = new Audio("./sound/cannon.mp3");
  var SuccedSound = new Audio("./sound/success.mp3");
  var FailureSound = new Audio("./sound/failure-drum-sound-effect-2-7184.mp3");

  var game = {
    PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
    PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
    PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
    PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
    PHASE_GAME_OVER: "PHASE_GAME_OVER",
    PHASE_WAITING: "waiting",

    currentPhase: "",
    phaseOrder: [],
    // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
    playerTurnPhaseIndex: 2,

    // l'interface utilisateur doit-elle être bloquée ?
    waiting: false,

    // garde une référence vers les noeuds correspondant du dom
    grid: null,
    miniGrid: null,

    // liste des joueurs
    players: [],

    // lancement du jeu
    init: function () {
      // initialisation
      localStorage.removeItem("gg");
      localStorage.removeItem("msg");
      localStorage.removeItem("level");
      localStorage.removeItem("successx");
      localStorage.removeItem("successy");
      this.grid = document.querySelector(".board .main-grid");
      this.miniGrid = document.querySelector(".mini-grid");

      // défini l'ordre des phase de jeu
      this.phaseOrder = [
        this.PHASE_INIT_PLAYER,
        this.PHASE_INIT_OPPONENT,
        this.PHASE_PLAY_PLAYER,
        this.PHASE_PLAY_OPPONENT,
      ];
      this.playerTurnPhaseIndex = 2;

      // initialise les joueurs
      this.setupPlayers();

      // ajoute les écouteur d'événement sur la grille
      this.addListeners();

      // c'est parti !
      this.goNextPhase();
    },
    setupPlayers: function () {
      // donne aux objets player et computer une réference vers l'objet game
      player.setGame(this);
      computer.setGame(this);

      // todo : implémenter le jeu en réseaux
      this.players = [player, computer];

      this.players[0].init();
      this.players[1].init();
    },
    goNextPhase: function (gg = false) {
      // récupération du numéro d'index de la phase courante
      var ci = this.phaseOrder.indexOf(this.currentPhase);
      var level = "";
      var turn = "";
      var rd = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
      var self = this;

      if (gg === true || localStorage.getItem("gg") === "true") {
        localStorage.setItem("gg", "true");
        utils.info(localStorage.getItem("msg"));
        this.grid.style = "pointer-events: none;";
        const restart = document.createElement("button");
        restart.textContent = "Recommencer";
        document.body.appendChild(restart);

        restart.addEventListener("click", () => {
          location.reload();
        });
      } else {
        if (ci !== this.phaseOrder.length - 1) {
          this.currentPhase = this.phaseOrder[ci + 1];
        } else {
          this.currentPhase = this.phaseOrder[2];
        }

        switch (this.currentPhase) {
          case this.PHASE_INIT_PLAYER:
            utils.info("Placez vos bateaux");
            break;
          case this.PHASE_INIT_OPPONENT:
            while (
              level !== "facile" ||
              level !== "difficile" ||
              level === ""
            ) {
              level = window.prompt(
                "Quel est le niveau de l'ia ? (facile, difficile)"
              );
              if (level === "facile" || level === "difficile") {
                localStorage.setItem("level", level);
                break;
              }
            }
            this.wait();
            utils.info("Choix pour démarrer la partie");
            this.players[1].isShipOk(function () {
              self.stopWaiting();
              while (
                turn !== "moi" ||
                turn !== "ia" ||
                turn !== "jsp" ||
                turn === ""
              ) {
                turn = window.prompt(
                  "Quel joueur commence la partie ? (moi, ia, jsp)"
                );
                if (turn === "moi" || turn === "ia" || turn === "jsp") {
                  break;
                }
              }
              if (turn === "moi") {
                self.goNextPhase();
              } else if (turn === "ia") {
                self.currentPhase = self.phaseOrder[2];
                self.goNextPhase();
              } else {
                if (rd === 1) {
                  window.alert("L'ia commence");
                  self.currentPhase = self.phaseOrder[2];
                  self.goNextPhase();
                } else {
                  window.alert("Tu commences");
                  self.goNextPhase();
                }
              }
            });
            break;
          case this.PHASE_PLAY_PLAYER:
            if (
              localStorage.getItem("msg") !== "Tu as gagné" ||
              localStorage.getItem("msg") !== "L'ia a gagné"
            ) {
              utils.info("A vous de jouer, choisissez une case !");
            } else {
              utils.info("L'ia a gagné!");
            }
            if (this.gameIsOver(this.players[0]) === true) {
              localStorage.setItem("msg", "L'ia a gagné");
              this.goNextPhase(true);
            }
            utils.info("A vous de jouer, choisissez une case !");
            break;
          case this.PHASE_PLAY_OPPONENT:
            if (
              localStorage.getItem("msg") !== "Tu as gagné" ||
              localStorage.getItem("msg") !== "L'ia a gagné"
            ) {
              utils.info("A votre adversaire de jouer...");
              this.players[1].play();
            }
            if (this.gameIsOver(this.players[1]) === true) {
              localStorage.setItem("msg", "Tu as gagné");
              this.goNextPhase(true);
            }
            break;
        }
      }
    },
    gameIsOver: function (players) {
      var player = players;
      var pgrid = player.grid;
      var allValues = [];
      var health = [];
      var fleets = player.fleet;
      var i;
      var count = 0;
      var currentClassName;
      var currentBoat;
      const Boatoccur = (array, val) =>
        array.reduce((a, v) => (v === val ? a + 1 : a), 0);
      pgrid.forEach(function (row) {
        row.forEach(function (val) {
          allValues.push(val);
        });
      });
      for (i = 0; i < fleets.length; i += 1) {
        fleets[i].life = Boatoccur(allValues, fleets[i].id);
        if (fleets[i].life === 0) {
          currentClassName = "." + fleets[i].name.toLowerCase();
          currentBoat = document.querySelector(currentClassName);
          if (
            fleets[i].id === 1 ||
            fleets[i].id === 2 ||
            fleets[i].id === 3 ||
            fleets[i].id === 4
          ) {
            currentBoat.classList.add("sunk");
          }
          health.push(true);
        }
      }
      for (i = 0; i < 4; i += 1) {
        if (health[i] === true) {
          count++;
        }
      }
      if (count === 4) {
        return true;
      } else {
        return false;
      }
    },
    getPhase: function () {
      if (this.waiting) {
        return this.PHASE_WAITING;
      }
      return this.currentPhase;
    },
    // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
    wait: function () {
      this.waiting = true;
    },
    // met fin au mode mode "attente"
    stopWaiting: function () {
      this.waiting = false;
    },
    addListeners: function () {
      // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
      this.grid.addEventListener(
        "mousemove",
        _.bind(this.handleMouseMove, this)
      );
      this.grid.addEventListener("click", _.bind(this.handleClick, this));
      this.grid.addEventListener("contextmenu", _.bind(this.RightClick, this));
    },

    handleMouseMove: function (e) {
      // on est dans la phase de placement des bateau
      var ship = this.players[0].fleet[this.players[0].activeShip];
      if (
        this.getPhase() === this.PHASE_INIT_PLAYER &&
        e.target.classList.contains("cell")
      ) {
        // si on a pas encore affiché (ajouté aux DOM) ce bateau
        if (!ship.dom.parentNode) {
          this.grid.appendChild(ship.dom);
          // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
          ship.dom.style.zIndex = -1;
        }

        // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
        ship.dom.style.top =
          utils.eq(e.target.parentNode) * utils.CELL_SIZE -
          (600 + this.players[0].activeShip * 60) +
          "px";
        ship.dom.style.left =
          utils.eq(e.target) * utils.CELL_SIZE -
          Math.floor(ship.getLife() / 6) * utils.CELL_SIZE +
          "px";
      }
    },

    RightClick: function (e) {
      var ship = this.players[0].fleet[this.players[0].activeShip];
      e.preventDefault();
      if (ship.dom.style.rotate === "") {
        ship.dom.style.transformOrigin = "30px 30px";
        ship.dom.style.rotate = "90deg";
        return true;
      } else {
        ship.dom.style.rotate = "";
        return false;
      }
    },
    handleClick: function (e) {
      // self garde une référence vers "this" en cas de changement de scope
      var self = this;

      // si on a cliqué sur une cellule (délégation d'événement)
      if (e.target.classList.contains("cell")) {
        // si on est dans la phase de placement des bateau
        if (this.getPhase() === this.PHASE_INIT_PLAYER) {
          // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
          if (
            this.players[0].setActiveShipPosition(
              utils.eq(e.target),
              utils.eq(e.target.parentNode)
            )
          ) {
            // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
            if (!this.players[0].activateNextShip()) {
              this.wait();
              utils.confirm(
                "Confirmez le placement ?",
                function () {
                  // si le placement est confirmé
                  self.stopWaiting();
                  self.renderMiniMap();
                  self.players[0].clearPreview();
                  self.goNextPhase();
                },
                function () {
                  self.stopWaiting();
                  // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                  self.players[0].resetShipPlacement();
                }
              );
            }
          }
          // si on est dans la phase de jeu (du joueur humain)
        } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
          this.players[0].play(
            utils.eq(e.target),
            utils.eq(e.target.parentNode)
          );
          this.renderMap();
          if (this.gameIsOver(this.players[0]) === true) {
            localStorage.setItem("msg", "L'ia a gagné");
            this.goNextPhase(true);
          }
        }
      }
    },
    // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
    // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
    fire: function (from, col, line, callback) {
      var self = this;
      var msg = "";
      var p;
      // determine qui est l'attaquant et qui est attaqué
      var target =
        this.players.indexOf(from) === 0 ? this.players[1] : this.players[0];
      this.wait();

      if (
        localStorage.getItem("msg") === "Tu as gagné" ||
        localStorage.getItem("msg") === "L'ia a gagné"
      ) {
        return;
      }
      Sound.play();

      if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
        msg += "Votre adversaire vous a... ";
      }

      // on demande à l'attaqué si il a un bateaux à la position visée
      // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
      if (this.currentPhase !== this.PHASE_PLAY_OPPONENT) {
        p = 1;
      } else {
        p = 2;
      }
      target.receiveAttack(col, line, p, function (hasSucced) {
        var miniGrid = document.querySelector(".mini-grid");
        if (
          game.players[0].tries[line][col] === false &&
          game.currentPhase !== game.PHASE_PLAY_OPPONENT
        ) {
          msg += "Deja ";
        } else if (
          game.players[0].tries[line][col] === true &&
          game.currentPhase !== game.PHASE_PLAY_OPPONENT
        ) {
          msg += "Deja Touché !";
        }
        if (
          hasSucced &&
          game.currentPhase !== game.PHASE_PLAY_OPPONENT &&
          game.players[0].tries[line][col] !== true
        ) {
          msg += "Touché !";
        } else if (
          !hasSucced &&
          game.currentPhase !== game.PHASE_PLAY_OPPONENT &&
          game.players[0].tries[line][col] !== true
        ) {
          msg += "Manqué...";
        } else if (
          hasSucced &&
          game.currentPhase === game.PHASE_PLAY_OPPONENT
        ) {
          miniGrid.querySelectorAll(".row")[col].querySelectorAll(".cell")[
            line
          ].style.backgroundColor = "yellow";
          msg += "Touché !";
        } else if (
          !hasSucced &&
          game.currentPhase === game.PHASE_PLAY_OPPONENT &&
          game.players[0].tries[line][col] !== false
        ) {
          msg += "Manqué...";
        }

        if (
          hasSucced &&
          (localStorage.getItem("msg") !== "Tu as gagné" ||
            localStorage.getItem("msg") !== "L'ia a gagné")
        ) {
          SuccedSound.play();
        } else if (
          localStorage.getItem("msg") !== "Tu as gagné" ||
          localStorage.getItem("msg") !== "L'ia a gagné"
        ) {
          FailureSound.play();
        }

        utils.info(msg);

        // on invoque la fonction callback (4e paramètre passé à la méthode fire)
        // pour transmettre à l'attaquant le résultat de l'attaque
        callback(hasSucced);

        // on fait une petite pause avant de continuer...
        // histoire de laisser le temps au joueur de lire les message affiché
        setTimeout(function () {
          self.stopWaiting();
          self.goNextPhase();
        }, 1000);
      });
    },
    renderMap: function () {
      if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
        this.players[1].renderTries(this.miniGrid);
      } else {
        this.players[0].renderTries(this.grid);
      }
    },
    renderMiniMap: function () {
      var i = 0;
      while (i < 10) {
        var j = 0;
        while (j < 10) {
          if (this.players[0].grid[i][j] === 1) {
            this.miniGrid.querySelectorAll(".row")[i].querySelectorAll(".cell")[
              j
            ].style = "background-color: rgba(230, 0, 25, 0.8); z-index: -1;";
          } else if (this.players[0].grid[i][j] === 2) {
            this.miniGrid.querySelectorAll(".row")[i].querySelectorAll(".cell")[
              j
            ].style = "background-color: rgba(87, 124, 194, 0.8); z-index: -1;";
          } else if (this.players[0].grid[i][j] === 3) {
            this.miniGrid.querySelectorAll(".row")[i].querySelectorAll(".cell")[
              j
            ].style = "background-color: rgba(86, 152, 140, 0.8); z-index: -1;";
          } else if (this.players[0].grid[i][j] === 4) {
            this.miniGrid.querySelectorAll(".row")[i].querySelectorAll(".cell")[
              j
            ].style = "background-color: rgba(32, 49, 64, 0.8); z-index: -1;";
          }
          j++;
        }
        i++;
      }
    }
  };

  // point d'entrée
  document.addEventListener("DOMContentLoaded", function () {
    game.init();
  });
})();
