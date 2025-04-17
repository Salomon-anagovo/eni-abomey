const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  // Configuration de la stratégie locale
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return done(null, false, { message: 'Email incorrect' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Mot de passe incorrect' });
      }

      user.lastLogin = Date.now();
      await user.save();

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Sérialisation
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Désérialisation
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
