var bcrypt          = 	require('bcrypt-nodejs'),
    passport 	    = 	require('passport'),
    db   		    = 	require('./database'),
    titulo          =   "Vídeo Comentarios",
	date 			= 	new Date(),
	fechaActual 	= 	(date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
    db.conectaDatabase();
var user;


var index = function(req, res)
{
	if(!req.isAuthenticated())
    {
        res.redirect('/login');
    }
    else
    {
        user = req.user;
		var sql = "SELECT c.id, c.comentario,c.id_usuario, u.nombre FROM comentarios c INNER JOIN users u ON u.idusuario = c.id_usuario"; //CREAR SENTENCIA SQL EN ESTA VARIABLE...
		console.log(sql);
		db.queryMysql(sql, function(err, response)
		{
			var data = response
			if(response[0].numero !== 0)
			{
						res.render("index", {
							usuario	:	titulo + " - " + user[0].nombre,
							data : data
						});
			}
		});
    }
};

var login = function(req, res)
{
    res.render("login", {
		titulo 	:  	titulo
	});
};

var loginPost = function (req, res, next)
{
    var titulo = "";
    passport.authenticate('local', {
	successRedirect: '/index',
	failureRedirect: '/login'},
	function(err, user, info)
	{
		if(err)
		{
			return res.render('login', {titulo: titulo, error: err.message});
		}
		if(!user)
		{
			return res.render('login', {titulo: titulo, error: info.message, usuario : info.usuario});
		}
		return req.logIn(user, function(err)
		{
			if(err)
			{
				return res.render('login', {titulo: titulo, error: err.message});
			}
			else
			{
				return res.redirect('/');
			}
		});
	})(req, res, next);
};

var logout = function(req, res)
{
	if(req.isAuthenticated())
	{
		req.logout();
    }
	res.redirect('/login');
}

var registro =  function(req, res)
{
	res.render("registro", {
		titulo 	:  	"Registro Vídeo Comentarios",
		data 	:	[]
	});
};

var registroPost = function(req, res, next)
{
    //Buscar si el nombre de usuario o correo ya existen...
	var data = req.body;
    console.log("Información enviada desde la vista");
    console.log(data);

    //CREAR SENTENCIA QUE VALIDE SI UN USUARIO YA EXISTE.
    //LOS DATOS ÚNICOS DE USUARIO SON usuario  email
	var sql = "SELECT count(*) AS numero FROM users WHERE usuario='"+data.username+"' OR email='"+data.correo+"'"; //CREAR SENTENCIA SQL EN ESTA VARIABLE...
	console.log(sql);
	db.queryMysql(sql, function(err, response)
	{
		if(response[0].numero !== 0)
		{
			res.render('registro', {
									titulo: 'Registro To-Do',
									error: 'Nombre de usuario o correo ya existe',
									data : [data.nombre, data.correo, data.username]
								});
		}
		else
		{

            var password = bcrypt.hashSync(data.password);
            //CREAR SENTENCIA SQL  QUE ADICIONE UN NUEVO USUARIO EN LA TABLA users
            //PARA ENCRIPTAR LA CONTRASEÑA SE UTILIZARÁ EL MÓDULO bcrypt.
            sql = "INSERT INTO users(nombre, usuario, clave, email) VALUES ('"+data.nombre+"', '"+data.username+"', '"+password+"', '"+data.correo+"')";//VARIABLE QUE GUARDARÁ LA SENTENCIA SQL...
            console.log(sql);
			db.queryMysql(sql, function(err, response)
			{
				if (err || response.affectedRows === 0)
				{
					res.render('registro');
				}
				loginPost(req, res, next);
			});
		}
	});
};

var video = function(req, res){
	var comentario = req.body;
	console.log(comentario.comentario);
	var sql = "INSERT INTO comentarios(id_video,id_usuario,comentario) VALUES(1,"+user[0].idusuario+",'"+comentario.comentario+"')";
	console.log(sql);
	db.queryMysql(sql, function(err, response)
	{

		if (err || response.affectedRows === 0)
			{
				res.render('index');
			}
			console.log("guardado");
			return  res.send(JSON.stringify({ nombre:user[0].nombre ,comentario: comentario.comentario}));
	});
}

var notFound404 = function(req, res)
{
	res.status(404).send("Página no encontrada :( en el momento");
};

//Exportar las rutas...
module.exports.index = index;
module.exports.login = login;
module.exports.loginPost = loginPost;
module.exports.logout = logout;
module.exports.registro = registro;
module.exports.registroPost = registroPost;
module.exports.video = video;
module.exports.notFound404 = notFound404;
