const csrfmiddleware=(req, res, next) => {
 if (req.headers.origin !== process.env.Hostname && process.env.ENV === 'dev') {
        return res.status(403).send('Forbidden');
    }
  next();
};
module.exports=csrfmiddleware;