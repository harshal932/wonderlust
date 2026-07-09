const User = require("../models/user.js");

module.exports.renderSignupForm= (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res, next) => {
    try{
    let {username, email, password} = req.body;
    const newUser = new User({email,username});
    const registredUser = await User.register(newUser,password);
    console.log(registredUser);
    req.login(registredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","welcome to wonderlust");
        res.redirect("/listings");
    })
  
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{
    req.flash("success","Welcome back to wonderlust ! ");
    res.redirect(res.locals.redirectUrl || "/listings");
}

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are log out!");
        res.redirect("/login");

    })
} 