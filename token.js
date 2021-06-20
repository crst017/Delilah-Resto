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
    decode : ( headers ) => {

        const auth = headers.authorization;
        if ( !auth.startsWith("Bearer ") ) return;
        const token = auth.substring( 7, auth.length );
        const userInfo = jwt.verify( token, jwtKey );
        return userInfo 
    },
}

module.exports = token;