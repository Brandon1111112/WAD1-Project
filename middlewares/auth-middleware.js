const isLoggedIn = (req,res,next) => {
    if (!req.session.user){
        console.log('User not logged in, redirecting to /login');
        return res.redirect('/login')
    }
    next();
}

const isAdmin = (req,res,next) => {
    if (!req.session.user) {
        console.log('User not logged in, redirecting to /login');
        return res.redirect('/login')
    }
    if (!req.session.user.isAdmin) {
        console.log('Not an admin user, redirecting to /home')
        return res.redirect('/home')
    }
}   

module.exports = {
    isLoggedIn,
    isAdmin
};