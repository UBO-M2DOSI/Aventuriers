'use strict';

var _ = require("underscore") // la librairie underscore.js
  ,	maps = require("../maps"); // la definition du plateau

/** Les types (couleurs) de wagons (sans les "locomotives"). */
var wagons = ["blanc", "bleu", "jaune", "noir", 
              "orange", "rose", "rouge", "vert"];
/** Tous les types de cartes. */
var cartes = wagons.concat("locomotive");

/** Les couleurs disponibles pour les joueurs (max 5 joueurs). */
var jetons = ["bleu", "rouge", "vert", "jaune", "noir"];

/** Points par distance pour une route (clefs : distances, valeurs : points). */
var pointsRoute = { "1": 1, "2": 2, "3": 4, "4": 7, "5": 10, "6": 15, "8": 21 };

/** Toutes les parties en cours. */
var parties = {};

/** La liste de tous les joueurs existants. */
var joueurs = [];

/**
 * Definition d'un joueur.
 */
function Joueur(name) {
	/** Le nom du joueur. */
	this.nom = name;
	/** Nombre de wagon restants. */
	this.wagon = 45;
	/** Liste des cartes "wagon" en main. */
	this.main = [];
	/** Couleur du joueur (bleu, rouge, vert, jaune ou noir. */
	this.couleur = null;
};
Joueur.prototype.init = function (couleur){
	this.main = [];
	this.wagon = 45;
	this.couleur = couleur;
};
Joueur.prototype.ajoutCarte = function (carte){
    this.main.push(carte);
    this.main = _.sortBy(this.main, function (val) { return val; });
};

/**
 * Classe principale du jeu (chaque instance correspond à une partie).
 */
function Jeu() {
	/** La pioche (cartes faces cachées). */
	this.pioche = [];
	/** Les 5 cartes visibles communes. */
    this.visibles = [];
    /** Les joueurs. */
	this.joueurs = {};
	/** Vrai si la partie est démarrée. */
	this.started = false;
	/** Les cartes jouées et récupérées (vide en début de partie). */
	this.pot = [];
	/** Le plateau (carte) utilisé. */
	this.map = null;
	/** La pioche des cartes destinations. */
	this.destinations = [];
	/** Les cartes destinations "jetées" par les joueurs. */
	this.destinationsPot = [];
};
/** Ajout d'un nouveau joueur dans le jeu (partie). */
Jeu.prototype.nouveauJoueur = function (joueur){
	if(this.started){
		console.log("Impossible d'ajouter des joueurs après le début du jeu");
		return;
	}
	if(this.joueurs.length >= 5){
		console.log("Nombre maximum de joueurs atteint");
		return;
	}
	if(joueur){
		this.joueurs[joueur.nom] = joueur;
		console.log("Nouveau joueur : " + joueur.nom);
	}
};

/** Lancement du jeu. */
Jeu.prototype.start = function (){
	console.log("Lancement du jeu");
	this.started = true;
	// definition du plateau
	this.map = maps.byName('Bretagne');

	var i, j, length = wagons.length;
	// initialisation des joueurs
	for(i = 0; i < this.joueurs.length; i++){
		this.joueurs[i].init(jetons[i]);		
	}

	// ajout de 12 cartes de chaque couleur
	for(i = 0; i < length; i++){
		for(j = 0; j < 12; j++){
			this.pioche.push(i);
		}
	}
	// ajout de 14 cartes "locomotive"
	for(i = 0; i < 14; i++){
		this.pioche.push(length);
	}
	// melange des cartes
	this.pioche = _.shuffle(this.pioche);
    // distribution des cartes aux joueurs
    for(i = 0; i < 4; i++){
        for(j in this.joueurs){
            this.joueurs[j].ajoutCarte(this.pioche.pop());
        }
    }
    // cartes visibles
    for(i = 0; i < 5; i++){
        this.visibles.push(this.pioche.pop());
    }
};


// pour tests
var jeu = new Jeu();
jeu.nouveauJoueur(new Joueur("Alain"));
jeu.nouveauJoueur(new Joueur("Kathy"));
jeu.nouveauJoueur(new Joueur("Justine"));
jeu.start();

parties.test = jeu;
// /pour tests

/** Enregistrement d'un nouveau joueur sur le serveur. */
exports.nouveauJoueur = function (req, res){
  var nom = req.params.name
    , i;
  for(i=0; i < joueurs.length; i++){
  	if(joueurs[i].nom == nom){
  	  res.send("failed");	
  	}
  }
  joueurs.push(new Joueur(nom));
  res.send(200);
};

/** Création d'une nouvelle partie et envoi aux clients connectées. */
exports.nouvellePartie = function (nom, socket){
  var partie = new Jeu();
  parties[nom] = partie;  
  socket.broadcast.emit('NouvellePartie', { "nom": nom });
};

/** Un joueur rejoint une partie. */
exports.rejoindre = function (req, res){
  var nom = req.params.joueur
    , partie = req.params.partie;
  res.send(501);
};

/** La liste des noms des parties en cours. */
exports.parties = function (req, res){
  var list = []
    , i;
  for(i in parties){
    list.push(i);
  }
  res.json(list);
};

/** Une nouvelle partie doit être envoyé à tous les 
export.broadcastPartie = function(socket){

}

/** Affiche la page du jeu. */
exports.jouer = function (req, res){	
  res.render('jeu', { title: 'Les aventuriers Bretagne' });
};

/** La liste des 5 cartes commune visibles. */
exports.visibles = function (req, res){
    res.json(parties[req.params.partie].visibles);
};

/** La définition du plateau. */
exports.map = function (req, res){
    res.json(parties[req.params.partie].map);
};

/** La liste des cartes (main) d'un joueur. */
exports.cartes = function (req, res){
    var nom, joueur;
    if(parties[req.params.partie]){
      nom = req.params.joueur;
      joueur = parties[req.params.partie].joueurs[nom];
  	  res.json(joueur.main);
    }
};

/** Le joueur tire une carte de la pioche (cartes face cachée). */
exports.pioche = function (req, res){
	var carte
	  , idx = req.params.index
	  ,	nom = req.params.joueur
    , nomPartie = req.params.partie
	  ,	joueur;
	if(parties[req.params.partie].pioche.length == 0){
		console.log("TODO : pioche vide");
	}
  // tire une carte
	carte = parties[nomPartie].pioche.pop();  
	// remplace la carte dans la liste des cartes visibles 
	// (sinon carte prise dans les cartes faces cachées)
	if(idx >= 0 && idx < parties[nomPartie].visibles.length){
		parties[nomPartie].visibles[idx] = carte;	
	}	
	// ajoute la carte dans la main du joueur
	joueur = parties[nomPartie].joueurs[nom];
	joueur.ajoutCarte(carte);
	// renvoie la nouvelle carte 
	res.json({ "carte": carte })
};

/** Le joueur dont le nom est fourni place une route (ligne de chemin de fer). */
exports.route = function (req, res){
	// placer la route fournie en parametres
	// recalcul des points
	// verifier fin du jeu
	console.log("TODO");
	res.send(501);
};

/** Le joueur dont le nom est fourni tire 3 cartes destination. */
exports.destinations = function (req, res){
	// renvoyer les 3 cartes "destination"
	console.log("TODO");
	res.send(501);
};

