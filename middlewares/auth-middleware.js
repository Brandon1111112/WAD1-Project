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
    if (!req.session.user.admin) {
        console.log('Not an admin user, redirecting to /home')
        return res.redirect('/home')
    }
    next();
}

const isSuperAdmin = (req,res,next) => {
    if (!req.session.user) {
        console.log('User not logged in, redirecting to /login');
        return res.redirect('/login')
    }
    if (!req.session.user.superAdmin) {
        console.log('Not a super admin user, redirecting to /home')
        return res.redirect('/home')
    }
    next();
}   

module.exports = {
    isLoggedIn,
    isAdmin,
    isSuperAdmin
};