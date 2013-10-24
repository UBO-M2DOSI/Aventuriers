(function (){
'use strict';

/** Les types (couleurs) de wagons (sans les "locomotives"). */
var wagons = [ "blanc", "bleu", "jaune", "noir", "orange", "rose",
               "rouge", "vert" ];
/** Tous les types de cartes. */
var cartes = wagons.concat("locomotive");

/** L'objet principal pour la gestion du jeu. */
function DOSIRide(){
	// le plateau de jeu (carte)
	this.map = null;
	// la couleur du joueur (jeton)
	this.couleur = null;

	// les cartes visibles
	var cards = [];
	// la main du joueur
	var hand= [];
	var _this = this;
	
	/** Ajout d'une carte dans la main du joueur. */
	this.ajouterCarte = function (card){
		$('#hand').append(
				'<span class="card' + card + '"><img src="/img/cartes/' + cartes[card]
						+ '.jpg" class="card" onclick="dr.selectionMain(this);" /><i>8</i></span>');
		hand.push(card);
	};

    /** Retrait d'une carte de la main du joueur. */
	this.retirerCarte = function (card){
		var same
		  , nb;
		// ...
	};
	
	/** Action de selection d'une carte dans la pioche. */
	this.cartePioche = function (elt) {
		var index = $('#cards img').index(elt)
		  , card = 	_this.cards[index]
		  , img = $(elt);
		// ...
	};
	
	/** Action de selection d'une carte dans la main. */
	this.selectionMain = function (elt) {
		var index = $('#hand img').index(elt);
	};

	/** Place la route (ligne de chemin de fer) 
	 * et retire les cartes de la main du joueur. */
	this.placerRoute = function (track){
		var size = track.location.length
		  , carte;
		//...
	}

	/**
	 * Renvoi vrai si la main actuelle du joueur permet de placer des wagons 
	 * sur la route passée en paramètre.
	 */
	this.accepteRoute = function (track){
		var accept = true;
		// ...
		return accept;
	};
}

/** Initialisation de l'affichage du plateau. */
DOSIRide.prototype.initCanvas = function (){
	var stage = new Kinetic.Stage({
        container: 'plateau',
        width: 1024,
        height: 709
      });
	var map
	  , wagon
	  , layer;
	map = new Image();   
	map.src = dr.map.fond; 
	map.onload = function (){
		var backgroundLayer = new Kinetic.Layer();
		var m = new Kinetic.Image({
          x: 0,
          y: 0,
          image: map,
          width: stage.width,
          height: stage.height
        });
        backgroundLayer.add(m);
        stage.add(backgroundLayer);
	};

	wagon = new Image();   
	wagon.src = '/img/wagons/wagon-'+ dr.couleur +'.png'; 
	layer = new Kinetic.Layer();

	function afficheRoute(imgWagon, track){		
		var w = [],
		ki = null,
		i = null, 
		p = null;
		for(i in track.location){
			p = track.location[i];     
			ki = new Kinetic.Image({
				"x": (p[0] * 10.24),
				"y": (p[1] * 7.09),
				image: imgWagon,
				rotationDeg : p[2],
				opacity: 0
			});
			w.push(ki);

			ki.on('mouseover', function () {
				if(dr.accepteRoute(track)){
					var idx, elt;
					for(idx in w){
					  elt = w[idx];
		        	  elt.setOpacity(1);
		        	}
		        	layer.draw();
				}
    	});
    	ki.on('click', function () {
    		if(dr.accepteRoute(track)){
    			track.occupee = true;
    			dr.placerRoute(track);
    			var idx, elt;
			for(idx in w){
			  elt = w[idx];
        	  elt.setOpacity(1);
        	}
        	layer.draw();	
    		}
    	});
    	ki.on('mouseout', function () {
      	var idx, elt;
      	if(!track.occupee){
				for(idx in w){
					elt = w[idx];
		      	elt.setOpacity(0);
				}
		    }
      	layer.draw();
    	}); 
			layer.add(ki);
		}
	}

  wagon.onload = function (){   
    var i, track; 	  	
	  for(i in dr.map.tracks){
		  track = dr.map.tracks[i];
 		  afficheRoute(wagon, track); 
		}
    stage.add(layer);
  }
};
	
	

jQuery(document).ready(function () {
	
	var dr = new DOSIRide() 	
	dr.name = "Kathy";
	dr.couleur = "bleu";
	dr.partie = "test";

	$('#joueur').addClass(dr.couleur);
	$('#joueur').html('<img class="avatar" src="http://robohash.org/' + dr.name + '" alt="avatar" />'
		+ '<div class="wagons">'
		+ '<img src="/img/wagons/wagon-blanc.png" alt="wagon" />'
		+ '<span>45</span>'
		+ '</div>'
		+ '<div class="points">'
		+ '<div>'+ dr.name +'</div>'
		+ '<div>Points</div>'
		+ '<div class="score">0</div></div>'
	);	
	$('#joueur').show();
	
    $.get("/jeu/" + dr.partie + "/map", function (data) {
		dr.map = data;
		dr.initCanvas();		
	});	

	$.get("/jeu/" + dr.partie + "/" + dr.name + "/cartes", function (data) {
		var i;
		for (i = 0; i < data.length; i++) {
			dr.ajouterCarte(data[i]);
		}
	});

	$.get("/jeu/" + dr.partie + "/visibles", function (data) {
		var i;
		dr.cards = data;
		for (i = 0; i < data.length; i++) {
			$('#cards').append(
					'<div><img src="/img/cartes/' + cartes[data[i]]
							+ '.jpg" class="card" onclick="dr.cartePioche(this);" /></div>');
		}
		$('#cards').append(
				'<div><img src="/img/cartes/dos.jpg" class="card" /></div>');
	});
	
	window.dr = dr;
});

})();
