const express = require('express');
const app = express();
const { response } = require('express');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const passportLocalMongoose = require('passport-local-mongoose');
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
require("dotenv").config();
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.connect, { UseNewUrlParser: true });
//mongoose.set("useCreateIndex", true);
const secretSchema = new mongoose.Schema({
    username: {
        unique: true,
        type: String,
        required: true,
    },
    Secret: Array,
    Password: String,
});

secretSchema.plugin(passportLocalMongoose);

const Secret = mongoose.model("Secret", secretSchema);

passport.use(Secret.createStrategy());

passport.serializeUser(Secret.serializeUser());
passport.deserializeUser(Secret.deserializeUser());

app.get("/signup", function (req, res) {
    res.render("signup");
});

app.get("/secret", function(req, res){
    if(req.isAuthenticated()){
        res.render("secret");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/signup");
});

app.post("/signup", function (req, res) {
    const secret = new Secret({
        username: req.body.username,
        password: req.body.password
    });

    Secret.register({username: req.body.username}, req.body.password, function(err, secret){
        if(err){
            console.log(err);
            res.redirect("/signup");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secret");
            });
        }
    });

});
app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    const secret = new Secret({
        username: req.body.username,
        password: req.body.password
    });
    req.login(secret, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secret");
            });
        }
    });
});

app.listen(3000, function () {
    console.log("Server started at port 3000");
});