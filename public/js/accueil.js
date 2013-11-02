(function(){
  'use strict'; 
    /// Pour l'utilisation de socket.io
    var socket;
    
	function nouveauJoueur(){
	    var nom = $("#inputNom").val();

	    $.ajax({
		    type: "POST",
		    url: "/nouveauNom/" +nom
	    }).done(function(msg) {
		    if(msg=="failed") {
		      console.debug("Erreur existe deja");
		    } else {
			  console.debug( "success : un nouveau joueur a été crée avec le nom : "+ nom );
			  localStorage['nomJoueur'] = nom;
            }		
	    });
	};

    function creerNomPartie(){
        var nomPartie = $("#inputNomPartie").val();
        console.log(nomPartie);

        $.ajax({
                type: "POST",
                url: "/nouvellePartie/" +nomPartie
        }).done(function(msg) {
            if(msg=="failed") {
              console.debug("Erreur existe deja");
            } else {
              console.debug( "success : une nouvelle partie est crée - nom : "+ nomPartie );
		      // Envoi du nom de la partie via Socket.io
              // socket.emit('NomPartie', nomPartie); => pas nécessaire, le serveur à déjà l'information
		      // Sotckage du nom avec local storage
		      localStorage['nomPartie'] = nomPartie;
            }                
        });
    };


    /**
     Une fonction qui regroupe les instructions Javascript pour 
     l'initialisation de la page.
     */
    function initialisation(){
       socket = io.connect('http://localhost:3000');

       $('#nom a').click(nouveauJoueur);

       $("#creerPartie").click(function(){
         $(".panel-body").append("<input type='text'  placeholder='Entrer le nom de la partie' id='inputNomPartie' class='form-control'>" 
            + "<a id='btn_nomPartie' class='btn btn-primary'>Ok</a>");
         $('#btn_nomPartie').click(creerNomPartie);
       });
    };

	initialisation();
})();


         

