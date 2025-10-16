const protectRoute = (req, res, next) => {
    // For this example, we'll simulate a successful authentication.
    // We can add a dummy user object to the request.
    req.user = {
        id: 'user123',
        role: 'admin'
    };
    
    console.log('Simulated authentication successful. Route is protected.');
    
    // Pass control to the next function in the middleware chain (the controller)
    next();
};
module.exports={protectRoute};
