var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
	 cookieParser = require("cookie-parser"),
   bcrypt = require("bcryptjs"),
     flash        = require("connect-flash"),
    User      = require("./models/user"),
    session = require("express-session"),
    methodOverride = require("method-override");

mongoose.connect("mongodb+srv://waqasarif:treadstone@cluster0.fefb5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", { useUnifiedTopology: true }
				 ,{ useNewUrlParser: true })
      .then(() => console.log(`Database connected`))
      .catch(err => console.log(`Database connection error: ${err.message}`));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
//require mome //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rosee wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));



require('./config/passport')(passport);


app.get("/", function(req, res){
	res.render("index")
});

app.get("/movies", function(req, res){
	res.render("movie")
});

app.get('/login', (req, res) => res.render('login'));

// Register Page
app.get('/register',  (req, res) => res.render('register'));

// Register
app.post('/register', (req, res) => {
  const { username, email, password} = req.body;
  let errors = [];

  if (!username || !email || !password) {
    errors.push({ msg: 'Please enter all fields' });
  }
  
  if (errors.length > 0) {
    res.render('register', {
      errors,
      username,
      email,
      password,
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          username,
          email,
          password,
        });
      } else {
        const newUser = new User({
          username,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {        
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/movies',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
})

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});


app.get("/:id", function(req, res){
	res.render("about")
});





  function isLoggedIn(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in to do that!');
      res.redirect('/login');
  }


   function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


app.listen(process.env.PORT || 3027,  function(req, res){
	console.log("server started on")
});