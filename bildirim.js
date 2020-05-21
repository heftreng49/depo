var instagramIcon = '<i class="fa fa-instagram" style="color: #FFFC00" aria-hidden="true"></i>';

var instagramNote = ' Add National Geographic on instagram!';

$("body").overhang({

  type: "confirm",

  primary: "#9b59b6",

  accent: "#8e44ad",

  message: instagramIcon + instagramNote,

  custom: true,

  html: true,

  overlay: true,

  overlayColor: "#1abc9c",

  callback: function (value) {

    if (value) {

      window.location.href = "https://www.instagram.com/heftreng__/";

    } else {

      alert("Maybe next time then...");

    }

  }

});
