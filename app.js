//1. importar express y demas librerias
const express = require("express");
// const unless = require('express-unless');
const expressJwt = require('express-jwt');
const crud = require("./crud");
const verify = require('./middlewares');

//2. crear la instancia de express
const app = express();
const jwtKey = "password";
//3. agregar middlewares globales
app.use(express.json()); // parsear el body a un objeto
app.use(expressJwt({ 
	secret :jwtKey, 
	algorithms: ['HS256'] 
	})
	.unless({ path: ['/user/login','/user/register'] }) ); 
app.use( verify.token ); //Handle the expressJwt error

//3.1 definir constantes
const PORT = process.env.APP_PORT ? process.env.APP_PORT : 3000;
// 4. escribir rutas o endpoints
app.get ( '/dishes', crud.product.getDishes );
app.post( '/dishes', verify.admin, crud.product.createDish );
app.get( '/dishes/:id', crud.product.getDish );
app.put( '/dishes/:id', verify.admin, crud.product.updateDish );
app.delete( '/dishes/:id', verify.admin, crud.product.deleteDish );

app.get( '/user', crud.user.getLoggedUser );
app.get( '/user/:id', verify.admin, crud.user.getUser );
app.post( '/user/register', crud.user.createUser );
app.post( '/user/login', crud.user.loginUser );
app.get( '/users', verify.admin, crud.user.getAllUsers );

app.get( '/order', crud.order.getLoggedUserOrders );
app.post( '/order', crud.order.createOrder );
app.put( '/order/:id', verify.admin, crud.order.updateOrderStatus )
app.get( '/orders', verify.admin, crud.order.getOrders );



// //5. levantar el servidor
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});