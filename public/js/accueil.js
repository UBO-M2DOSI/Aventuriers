(function(){
  'use strict'; 

	function nouveauJoueur(){
	var nom = $("#inputNom").val();

	$.ajax({
		type: "POST",
		url: "/nouveauNom/" +nom
	}).done(function(msg) {
		if(msg=="failed")
		console.debug("Erreur existe deja");
		else
	
			console.debug( "success : un nouveau joueur a été crée avec le nom : "+ nom );
			localStorage['nomJoueur'] = nom;
		
	});
		console.log("OK Click");		
	};

	$('#nom a').click(nouveauJoueur);
})();


