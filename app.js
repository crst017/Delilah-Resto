//1. importar express y demas librerias
const express = require("express");
const init = require("./conection");
let sequelize;
init().then( s => sequelize = s);

//2. crear la instancia de express
const app = express();

//3. agregar middlewares globales
app.use(express.json()); // parsear el body a un objeto

//3.1 definir constantes
const PORT = process.env.APP_PORT ? process.env.APP_PORT : 3000;


// INSERT INTO product (name,price) VALUES ('arepa rellena', 4000);
// //4. escribir rutas o endpoints
//GET: localhost/estudiantes
app.get( "/dishes" , ( req , res ) => {

	sequelize.query("SELECT * FROM product", { type: sequelize.QueryTypes.SELECT })
		.then( data => res.status(200).json(data))
		.catch( err => res.status(400).send("Error: " + err));
});

app.get( "/dishes/:id" , ( req , res ) => {

	const id = req.params.id;
    sequelize.query("SELECT * FROM product WHERE id = :_id", { 
		replacements: { _id : id },  
		type: sequelize.QueryTypes.SELECT
	})
		.then( data => res.status(200).json(data))
		.catch( err => res.status(404).send("Error: " + err));
});

app.post('/dishes', ( req , res ) => {

    let { dish_name , price , available } = req.body;
	if (!available) available = "Y";
    
	sequelize.query("INSERT INTO product ( name , price , available ) VALUES ( :_dish , :_price , :_available )", { 
		replacements: { 
			_dish : dish_name,
			_price : price,
			_available : available 
		}
	})
		.then( data => res.status(201).send("New dish added!"))
		.catch( err => res.status(400).send("Error: " + err));
});

app.put('/dishes/:id', ( req , res ) => {

	const id = req.params.id;
    const { dish_name , price , available } = req.body;
	sequelize.query(
		`UPDATE product SET name = :_dish , price = :_price , available = :_available
		WHERE id = :_id`, { 
			replacements: {
				_id : id, 
				_dish : dish_name,
				_price : price,
				_available : available 
			}
		})
		.then( data => res.status(200).send("Dish has been modified!"))
		.catch( err => res.status(400).send("Error: " + err));
});

app.delete('/dishes/:id', ( req , res ) => {

	const id = req.params.id;
    sequelize.query(
		`DELETE FROM product 
		WHERE id = :_id`, { 
			replacements: { _id : id },
		})
		.then( data => res.status(200).send("Dish deleted successfully :( !"))
		.catch( err => res.status(404).send("Error: " + err));
});

//5. levantar el servidor
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});