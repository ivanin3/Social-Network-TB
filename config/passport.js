const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const prisma = require('../prisma/seed');
const bcrypt = require('bcrypt');


passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { userName: username }
      });
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.userId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { userId: id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});