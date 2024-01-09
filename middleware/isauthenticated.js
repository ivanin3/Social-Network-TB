function isAuthenticated(req, res, next) {
    if (req.user) {
      return next();
    }
  
    res.redirect('/posts/login');
  }
  
  module.exports = isAuthenticated;