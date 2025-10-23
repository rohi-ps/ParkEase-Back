 const Security = (req, res, next) => {
    if (req.headers.origin !== process.env.HOST_NAME && process.env.ENV === 'dev') {
        return res.status(403).send('Forbidden');
    }
  next();
};
module.exports = {Security};
