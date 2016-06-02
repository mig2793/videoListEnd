window.onload = function()
{
	var element = document.getElementById("send-comment");
	element.addEventListener("keypress",enter);
    function enter(e)
    {
    	enviaForm = true;

    	if(e.keyCode == 13){
            var data = element.value.trim();
            data = '{"comentario":"'+data+'"}';
            data = JSON.parse(data);
            if($(element).val().length > 0)
            {
    	         
                $.ajax({
                    url : "/video",
                    type: "POST",
                    data : data,
                    success: function(response, textStatus, jqXHR)
                    {   
                        var content = "";
                        console.log(response);
                        var datos = JSON.parse(response);
                        content += '<h2>'+datos.nombre+'</h2>';
                        content += '<br>';
                        content += '<span>'+datos.comentario+'</span>';

                        $("#comentarios").prepend(content);
                    },
                    error: function (jqXHR, textStatus, errorThrown)
                    {
                        console.log("error!!");
                    }
                });
            }
            else{
                sweetAlert("Por favor completa el campo solicitado!");
            }
            element.value = "";
    	}

    }

};
