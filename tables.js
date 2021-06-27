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
    `INSERT INTO delilah_cmnl.product (name,price)
        VALUES ("Pizza",5000),("Lasagna",7000),("Hot dog",8000),("Soda",3000),("Burger",8000),("Cheese Burger",10000),("Water",3000)`, 
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
    createTable : 
    `CREATE TABLE IF NOT EXISTS delilah_cmnl.order (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        date DATETIME NOT NULL,
        total INT UNSIGNED NOT NULL,
        delivery_address VARCHAR(80) NOT NULL,
        status VARCHAR(15) NULL DEFAULT 'new',
        PRIMARY KEY (id),
        FOREIGN KEY (user_id)
        REFERENCES user (id)
    )`,
    setValues :
    `INSERT INTO delilah_cmnl.order ( user_id, date, total, delivery_address ) 
        VALUES 
        ( 2, "2021-06-26 05:08:46", 21000, "Terrace 745 delivery" ),
        ( 1, "2021-06-26 05:11:26", 30000, "Terrace 748 delivery" )`
}

const item = {
    createTable :
    `CREATE TABLE IF NOT EXISTS item (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id INT UNSIGNED NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        price INT UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (order_id) REFERENCES delilah_cmnl.order (id),
        FOREIGN KEY (product_id) REFERENCES product (id)
    )`,
    setValues :
    `INSERT INTO delilah_cmnl.item ( order_id, product_id, price ) 
        VALUES 
        ( 1, 1, 5000 ), ( 1, 3, 8000 ), ( 1, 5, 8000 ),
        ( 2, 1, 5000 ), ( 2, 2, 7000 ), ( 2, 5, 8000 ), ( 2, 2, 7000 ), ( 2, 4, 3000 )`
}
tables = { product, user, order, item }
module.exports = tables;
