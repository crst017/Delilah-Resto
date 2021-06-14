tables = {
    product : 
    `CREATE TABLE IF NOT EXISTS product (
        id INT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL DEFAULT '',
        price INT(6) UNSIGNED NOT NULL DEFAULT 0,
        available VARCHAR(1) NOT NULL DEFAULT 'Y',
        PRIMARY KEY (id)
    )`,
    user : `CREATE TABLE prueba`,
    order: ``
};

module.exports = tables;
