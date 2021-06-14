const mysql = require('mysql2/promise');
const Sequelize = require('sequelize');
const tables = require('./tables');

const data = { 
    host : "localhost", 
    port : "3306", 
    user : "root",
    password : "207root749"};
const db = "delilah_cmnl";

async function init() {
    
    const path = `mysql://root:207root749@localhost:3306/${db}`;
    
    const connection = await mysql.createConnection(data);
    console.log('Conected to MySQL server');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${db};`);
    console.log(`Database created (${db})`);
    
    const sequelize = new Sequelize( path , { logging : false } );
    sequelize.authenticate()
        .then( console.log( `Conected to database (${db})`) )
        .catch( err => console.error('Error de conexion:', err) );

    await sequelize.query(tables.product);
    console.log('Table created');

    return sequelize
}

module.exports = init;




