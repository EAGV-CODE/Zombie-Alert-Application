require('dotenv').config();

var express 		= require("express"),
	app 			= express(),
	bodyParser 		= require("body-parser"),
	mongoose 		= require("mongoose"),
	flash			= require("connect-flash"),
	passport		= require("passport"),
	LocalStrategy	= require("passport-local"),
	methodOverride	= require("method-override"),
	Activityzone	= require("./models/activityzone"),
	Comment			= require("./models/comment"),
	User			= require("./models/user"),
	seedDB			= require("./seeds")
	
// requiring routes=================================================
var commentRoutes 		= require("./routes/comments"),
	activityzoneRoutes	= require("./routes/activityzones"),
	indexRoutes			= require("./routes/index")

// Connecting DB====================================================
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;

const databaseUri = process.env.MONGODB_URI || 'mongodb://localhost/zombie_alert';

mongoose.connect(databaseUri, { useMongoClient: true })
      .then(() => console.log(`Database connected`))
      .catch(err => console.log(`Database connection error: ${err.message}`));

//===================================================================

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//seedDB();  //seed the DB

app.locals.moment = require("moment");

// PASSPORT CONFIGURATION=============================================
app.use(require("express-session")({
	secret: "Once again Zombies are alive!",
	resave: false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// TO PASS THE USER AND ALERT MESSAGE IN ALL TEMPLATES====================================
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//=======================================================================

app.use("/", indexRoutes);
app.use("/activityzones", activityzoneRoutes);
app.use("/activityzones/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
	console.log("the ZombieAlert Server has Started");
});