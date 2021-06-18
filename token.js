const jwt = require('jsonwebtoken');
const jwtKey = "password";

const token = {
    encode : ( id, username, role ) => {
    
        const token = jwt.sign ({
            "id": id,
            "username" : username,
            "role" : role
        } , jwtKey )

        return token
    },
    decode : (token) => {
        const userInfo = jwt.verify( token, jwtKey);
        return userInfo
    }
}

module.exports = token;