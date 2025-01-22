import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ isAuthenticated: false, message: 'Unauthorized access' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        const message =
            err.name === 'TokenExpiredError'
                ? 'Token has expired'
                : 'Invalid token';
        res.status(401).json({ isAuthenticated: false, message });
    }
};

export { authMiddleware };
