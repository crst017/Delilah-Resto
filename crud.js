const md5 = require('md5');
const moment = require('moment');
const token = require('./token');
const init = require('./conection');

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
    getLoggedUser : async (req, res) => {

        const { id }  = token.decode(req.headers);
        const loggedUser = await sequelize.query("SELECT username, fullname, email, telephone, address FROM user WHERE id = :_id", { 
            type: sequelize.QueryTypes.SELECT ,
            replacements : {
                _id : id
            }
        });
        res.status(200).json(loggedUser[0])
    },
    getUser : async (req, res) => {

        const id = req.params.id;
        const userInfo = await sequelize.query("SELECT username, fullname, email, telephone, address FROM user WHERE id = :_id", { 
            type: sequelize.QueryTypes.SELECT ,
            replacements : {
                _id : id
            }
        });
        res.status(200).json(userInfo[0]);
    },
    getAllUsers : async (req, res) => {

        const users = await sequelize.query("SELECT username, fullname, email, telephone, address, role FROM user", { 
            type: sequelize.QueryTypes.SELECT
        });
        res.status(200).json(users);
    }
}

const order = {
    createOrder : async ( req, res ) => {

        const { items, delAddress } = req.body;
        const { id, username } = token.decode(req.headers);

        let total = 0, itemsPrices = [];
        // Total price calculation
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
        // Insert the new order register
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
        // Insert the corresponding items (item table) to last created order
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
        res.status(201).send('A new order has been successfully generated! :D');
    },
    getLoggedUserOrders : async ( req, res ) => {

        const { id } = token.decode(req.headers);

        let orders = await sequelize.query(
            `SELECT o.id AS "orderID", u.fullname AS "name", o.delivery_address AS "delAddress", u.telephone, o.total, o.status
                FROM delilah_cmnl.user AS u, delilah_cmnl.order AS o
                WHERE u.id = o.user_id
                AND u.id = :_userID
                ORDER BY o.id`, 
            {   type: sequelize.QueryTypes.SELECT,
                replacements : {
                    _userID : id
                }}
        );

        for (const order of orders) {
            
            const orderID = order.orderID;
            const items = await sequelize.query(
                `SELECT p.name, p.price
                    FROM delilah_cmnl.product AS p, delilah_cmnl.order AS o, delilah_cmnl.item AS i
                    WHERE o.id = i.order_id AND p.id = i.product_id 
                    AND o.id = :_orderID
                    ORDER BY p.price`, {   
                    type: sequelize.QueryTypes.SELECT,
                    replacements : {
                        _orderID : orderID
                    }
                });
            order.items = items;
        }
        res.status(200).json(orders);
    },
    getOrders : async ( req, res ) => {

        let orders = await sequelize.query(
            `SELECT o.id AS "orderID", u.fullname AS "name", o.delivery_address AS "delAddress", u.telephone, o.total, o.status
                FROM delilah_cmnl.user AS u, delilah_cmnl.order AS o
                WHERE u.id = o.user_id
                ORDER BY o.id`, 
            {  type: sequelize.QueryTypes.SELECT }
        );

        for (const order of orders) {
            
            const orderID = order.orderID;
            const items = await sequelize.query(
                `SELECT p.name, p.price
                    FROM delilah_cmnl.product AS p, delilah_cmnl.order AS o, delilah_cmnl.item AS i
                    WHERE o.id = i.order_id AND p.id = i.product_id 
                    AND o.id = :_orderID
                    ORDER BY p.price`, {   
                    type: sequelize.QueryTypes.SELECT,
                    replacements : {
                        _orderID : orderID
                    }
                });
            order.items = items;
        }
        res.status(200).json(orders);
    },
    updateOrderStatus : async ( req,res ) => {

        const id = req.params.id;
        const { status } = req.body;

        if ( status != "new" && status != "confirmed" && status != "preparing" && status != "sending" && status != "cancelled" && status != "delivered") {
            return res.status(400).send(`The status indicated for the order does not exist`);
        }

        sequelize.query(
            `UPDATE delilah_cmnl.order SET status = :_status 
            WHERE id = :_id`, { 
                replacements: {
                    _id : id, 
                    _status : status
                }
            })
            .then( data => res.status(200).send(`The order is now "${status}"`))
            .catch( err => res.status(400).send("Error: " + err));
    }
}
const crud = { product , user , order} 

module.exports = crud;

