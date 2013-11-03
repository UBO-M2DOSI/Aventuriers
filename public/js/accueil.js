(function(){
  'use strict'; 
    /// Pour l'utilisation de socket.io
    var socket;
    /// La liste des parties affichées.
    var parties = [];

    /** Masque le choix du nom et affiche le nom choisi. */
    function nomChoisi(nom){
      $('#nom input').hide();
      $('#nom a').hide();
      $('#nom label').text('Nom : ' + nom);
      $('#parties').removeClass('close');
    }
    
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
        nomChoisi(nom);
     }		
   });
  };

  /** Affiche la liste des parties en cours. */
  function afficherParties(){
    var liste = $('#parties ul')
      , content = 'Aucune partie'
      , i;
    // si aucune partie dans la liste
    if(parties.length == 0){
      liste.html(content);
    } else {
      content = '';
      for(i = 0; i < parties.length; i++){
        content += '<li>'+ parties[i] +'</li>';
      }      
      liste.html(content);
    }
  }

  function creerNomPartie(){
    var nomPartie = $("#inputNomPartie").val();
    console.log(nomPartie);

    // Envoi du nom de la partie via Socket.io
    socket.emit('NomPartie', nomPartie);
    parties.push(nomPartie);
    afficherParties();        
    $('.panel-body input').remove();
    $('#btn_nomPartie').remove();
  };  

    /**
     Une fonction qui regroupe les instructions Javascript pour 
     l'initialisation de la page.
     */
     function initialisation(){
       // si le joueur a déjà défini un nom
       if(localStorage.nomJoueur){
         nomChoisi(localStorage.nomJoueur);
       } else {
         $('#nom a').click(nouveauJoueur);
       }

       $("#creerPartie").click(function (){
         $(".panel-body").append("<input type='text'  placeholder='Entrer le nom de la partie' id='inputNomPartie' class='form-control'>" 
          + "<a id='btn_nomPartie' class='btn btn-primary'>Ok</a>");
         $('#btn_nomPartie').click(creerNomPartie);
       });

       // afficher les parties déjà existantes
       $.get('/parties').done(function (liste){
         parties = parties.concat(liste);          
         afficherParties();
       });

       socket = io.connect('http://localhost:3000');
       // si on reçoit un "événement" de nouvelle partie issu du serveur
       socket.on('NouvellePartie', function (data) {
         // si la partie n'est pas deja connue
         if(data.nom && $.inArray(data.nom, parties)){
           parties.push(data.nom);
           afficherParties();
         }
       });
     };

     initialisation();
   })();




