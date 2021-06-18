const product = {
    createTable : 
    `CREATE TABLE IF NOT EXISTS product (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        price INT(10) UNSIGNED NOT NULL,
        available VARCHAR(1) NOT NULL DEFAULT 'Y',
        PRIMARY KEY (id),
        UNIQUE (name)
    )`,
    deleteTable :
    `DROP TABLE IF EXISTS product;`,
    setValues :
    `INSERT INTO product (name,price)
        VALUES ("Pizza",5000),("Lasagna",7000),("Hot dog",8000)`, 
}

const user = {
    createTable : 
    `CREATE TABLE IF NOT EXISTS user (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(20) NOT NULL,
        fullname VARCHAR(80) NOT NULL,
        email VARCHAR(60) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        address VARCHAR(80) NOT NULL,
        password VARCHAR(50) NOT NULL,
        role VARCHAR(10) NULL DEFAULT 'user',
        PRIMARY KEY (id) USING BTREE,
        UNIQUE (username)
    )`,
    deleteTable :
    `DROP TABLE IF EXISTS user;`,
    setValues : 
    `INSERT INTO user (username,fullname,email,telephone,address,password,role)
	VALUES 
	("admin","seed admin","admin@example.com",2020200,"742 evergreen terrace","21232f297a57a5a743894a0e4a801fc3","admin"),
	("user","seed user","user@example.com",2020201,"743 evergreen terrace","ee11cbb19052e40b07aac0ca060c23ee","user")`,
}

const order = {

}

tables = { product , user , order }
module.exports = tables;
