
$('.login').on('submit', function(e) {
  e.preventDefault();
  var $this = $(this),
      url_e   = $(this).attr("action"),
      elem	  = document,
      data    = {};
    data = {
        user  : elem.getElementById('user').value,
        pass  : Sha1.hash(elem.getElementById('pass').value),
        inst  : elem.getElementById('inst').value,
        type  : elem.getElementById('user_type').value,
        year  : elem.getElementById('year').value
    };
    $.ajax({
        type	: "POST",
        url	    : url_e,
        data	: data, // Adjuntar los campos del formulario enviado.
        success: function(data)
        {
            var
                res = JSON.parse(data),
                req = res;
            if (req.success == true) {
                if (req.request == 1) {
                    alertify.message('Ingresando al sistema');
                    window.location.reload();
                } else {
                    alertify.message('Datos de autenticación incorrectos!');
                }
            } else {
                alertify.error('Datos de autenticación incorrectos!');
            }

        },
        failure: function (data) {
            alertify.error('Error inesperado...!');
        }
    });
});
