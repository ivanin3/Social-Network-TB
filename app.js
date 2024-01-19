require('dotenv').config();
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

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'A simple Express API',
    },
  },
  apis: ['./routes/*.js'], // paths to files containing Swagger annotations
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

const swaggerUi = require('swagger-ui-express');


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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

require('./config/passport');

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

const router = require('./routes');
app.use('/', router);

app.listen(PORT, () => {
 console.log(`Servidor corriendo en puerto ${PORT}`);
});
