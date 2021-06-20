const md5 = require('md5');
const moment = require('moment');
const token = require('./token');
const init = require('./conection');
const { QueryTypes } = require('sequelize');

let sequelize; 
init().then( s => sequelize = s);

const product =  {
    getDishes : (req,res) => {
        sequelize.query("SELECT * FROM product", { type: sequelize.QueryTypes.SELECT })
        .then( data => res.status(200).json(data))
        .catch( err => res.status(400).send("Error: " + err));
    },
    getDish : ( req , res ) => {

        const id = req.params.id;
        sequelize.query("SELECT * FROM product WHERE id = :_id", { 
            replacements: { _id : id },  
            type: sequelize.QueryTypes.SELECT
        })
            .then( data => res.status(200).json(data))
            .catch( err => res.status(404).send("Error: " + err));
    },
    createDish : ( req , res ) => {

        const { dish_name , price } = req.body;
        let { available } = req.body;
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
    },
    updateDish : ( req , res ) => {

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
    },
    deleteDish :( req , res ) => {

        const id = req.params.id;
        sequelize.query(
            `DELETE FROM product 
            WHERE id = :_id`, { 
                replacements: { _id : id },
            })
            .then( data => res.status(200).send("Dish deleted successfully :( !"))
            .catch( err => res.status(404).send("Error: " + err));
    }
}

const user = {
    createUser : (req, res) => {
        const { username, fullname, email, telephone, address } = req.body;
        let { password, role } = req.body;
        if (!role) role = "user";
        password = md5(password);

        sequelize.query(
        `INSERT INTO user ( username, fullname, email, address, telephone, password, role ) 
        VALUES ( :_username, :_fullname, :_email, :_address, :_telephone, :_password, :_role )`,{
            replacements: {
                _username : username, 
                _fullname : fullname, 
                _email : email, 
                _address : address, 
                _telephone : telephone,
                _password : password, 
                _role : role
                },
              }
        )
        .then((data) => res.status(201).send("New user created!"))
        .catch((err) => {
            const error = err.original.errno = 1062 ? `El nombre de usuario "${username}", ya esta en uso.` : err;
            res.status(400).send("Error: " + error)          
        });
    },
    loginUser : ( req, res ) => {
        const { username } = req.body;
        let { password } = req.body;
        password = md5(password);
        sequelize.query(
            `SELECT * FROM user
            WHERE username = :_username`
            , {
                type: sequelize.QueryTypes.SELECT,
                replacements : {
                    _username : username,
                }
            }
        )
        .then( data => {
            const queryRes = data[0];
            
            if ( queryRes == undefined ) {
                 return res.status(401).send("El usuario no está registrado");
            }   
            
            if ( queryRes.password == password ) {
                const { id, username, role } = queryRes;
                const authToken = token.encode ( id, username, role );
                res.status(200).send( authToken);
            }
            else {
                res.status(401).send("Usuario o clave invalidos! :(");
            }
        })
        .catch( err => res.status(404).send("Error: " + err));
    },
    createOrder : async ( req, res ) => {

        const { items, delAddress } = req.body;
        const { id, username } = token.decode(req.headers);

        let total = 0, itemsPrices = [];

        for (const idItem of items) {
        
            const data = await sequelize.query( 
            `SELECT price 
                FROM product
                WHERE id = :_id`, {
                type: sequelize.QueryTypes.SELECT,
                replacements : {
                _id : idItem,
                }
            });
            total += data[0].price;
            itemsPrices.push(data[0].price);
        };
        
        const date = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

        await sequelize.query(
            `INSERT INTO delilah_cmnl.order ( user_id, date, total, delivery_address ) 
            VALUES ( :_user_id, :_date, :_total, :_delivery_address )`, {
                replacements: {
                    _user_id : id, 
                    _date : date, 
                    _total : total,
                    _delivery_address : delAddress, 
                }
            }
        );

        const idOrder = await sequelize.query(
            `SELECT id FROM delilah_cmnl.order ORDER BY id DESC LIMIT 1`,
            {type: sequelize.QueryTypes.SELECT}
        );
        
        for (const [ index, idItem ] of items.entries()) {
            
            await sequelize.query(
                `INSERT INTO delilah_cmnl.item ( order_id, product_id, price ) 
                VALUES ( :_order_id, :_product_id, :_price )`, {
                    replacements: {
                        _order_id : idOrder[0].id, 
                        _product_id : idItem, 
                        _price : itemsPrices[index]
                    }
                }
            );
        };
        res.status(201).send('Su pedido ha sido generado con éxito! :D');
    }
}
const crud = { product , user } 

module.exports = crud;

