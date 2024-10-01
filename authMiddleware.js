// const jwt = require('jsonwebtoken');

// const JWT_SECRET_KEY = process.env.ACCESS_PRIVATE_KEY;

// const validateToken = (req, res) => {
//     const { token } = req.body;

//     jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
//         if (err) {
//             return res.status(403).json({
//                 authenticated: false,
//                 message: 'Token is not valid'
//             });
//         }

//         res.json({ authenticated: true, user });
//     });
// };


// const authenticateToken = (req, res, next) => {
//     const token = req.header('authorization');
//     if (!token) return res.status(401).send({
//         message: 'Access denied',
//         status: false
//     });

//     jwt.verify(token, process.env.ACCESS_PRIVATE_KEY, (err, user) => {
//         if (err) return res.status(403).send({
//             message: 'Invalid token',
//             status: false
//         });
//         req.userId = user._id;
//         next();
//     });
// };

// // const allowedIPs = ['172.31.1.218','172.31.1.135','localhost']; 
// const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];
 
// const ipAccessMiddleware = (req, res, next) => {
//     const clientReferer = req.headers.referer; 

//     const clientIP = getClientIP(clientReferer);

//     console.log(req.headers.referer) 
    
//     if (ALLOWED_IPS.includes(clientIP)) {
//         next();
//     } else {
//         res.status(403).json({ message: 'Access forbidden. Your IP is not allowed.' });
//     }
// };

// const getClientIP = (referer) => {
//     try {
//         const ipRegex = /(?:https?:\/\/)?([^:/]+)(?::\d+)?/;
//         const match = referer.match(ipRegex);

//         if (match && match[1]) {
//             return match[1];
//         }
//         return null;
//     } catch (error) {
//         console.error('Error extracting IP address:', error);
//         return null;
//     }
// };
 

// module.exports = { validateToken, authenticateToken, ipAccessMiddleware };

const jwt = require('jsonwebtoken');
 
const JWT_SECRET_KEY = process.env.ACCESS_PRIVATE_KEY;
 
const validateToken = (req, res) => {
    const { token } = req.body;
 
    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({
                authenticated: false,
                message: 'Token is not valid'
            });
        }
 
        res.json({ authenticated: true, user });
    });
};
 
 
const authenticateToken = (req, res, next) => {
    const token = req.header('authorization');
    if (!token) return res.status(401).send({
        message: 'Access denied',
        status: false
    });
 
    jwt.verify(token, process.env.ACCESS_PRIVATE_KEY, (err, user) => {
        if (err) return res.status(403).send({
            message: 'Invalid token',
            status: false
        });
        req.userId = user._id;
        next();
    });
};
 
// Allow all IPs by bypassing IP check
const ipAccessMiddleware = (req, res, next) => {
    next();
};
 
const getClientIP = (referer) => {
    try {
        const ipRegex = /(?:https?:\/\/)?([^:/]+)(?::\d+)?/;
        const match = referer.match(ipRegex);
 
        if (match && match[1]) {
            return match[1];
        }
        return null;
    } catch (error) {
        console.error('Error extracting IP address:', error);
        return null;
    }
};
 
module.exports = { validateToken, authenticateToken, ipAccessMiddleware };