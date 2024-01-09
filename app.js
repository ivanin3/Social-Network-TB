const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const morgan = require('morgan');
const methodOverride = require('method-override');
const { create } = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const hbs = create({
  extname: 'hbs',
  defaultLayout: 'main',
  partialsDir: 'views/partials',
  helpers: require('./utils/helpers'),
});
const flash = require('connect-flash');
require('dotenv').config();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


require('./config/passport');


app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');



const router = require('./routes');
app.use('/', router);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
