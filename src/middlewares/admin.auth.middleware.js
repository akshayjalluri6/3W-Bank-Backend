import jwt from "jsonwebtoken"

const adminAuthenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get the token after "Bearer"

    if (!token) return res.status(401).send("Access Denied");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if(!req.user.isAdmin){
            return res.status(403).send("Access Denied")
        }
        next();
    } catch (error) {
        res.status(401).send("Invalid Token");
    }
};

export default adminAuthenticateToken