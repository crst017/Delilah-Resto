const mysql = require('mysql2/promise');
const Sequelize = require('sequelize');
const tables = require('./tables');

const data = { 
    host : "localhost", 
    port : "3306", 
    user : "root",
    password : "root"};

const db = "delilah_cmnl";

async function init() {

    const path = `mysql://root:root@localhost:3306/${db}`;

    const connection = await mysql.createConnection(data);
    console.log('Conected to MySQL server');
    await connection.query(`DROP DATABASE IF EXISTS ${db};`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${db};`);
    console.log(`Database created (${db})`);

    const sequelize = new Sequelize( path , { logging : false } );
    sequelize.authenticate()
        .then( console.log( `Conected to database (${db})`) )
        .catch( err => console.error('Error de conexion:', err) );

    await sequelize.query(tables.product.createTable);
    await sequelize.query(tables.user.createTable);
    await sequelize.query(tables.order.createTable);
    await sequelize.query(tables.item.createTable);
    console.log('Tables created');

    await sequelize.query(tables.user.setValues);
    await sequelize.query(tables.product.setValues);
    await sequelize.query(tables.order.setValues);
    await sequelize.query(tables.item.setValues);
    console.log('Records created');

    return sequelize
}

module.exports = init;





