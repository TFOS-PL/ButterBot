const { Client, Intents } = require('discord.js');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const dotenv = require('dotenv');

dotenv.config();

// Twój Discord bot token i dane logowania
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const app = express();
app.use(express.static('public'));

passport.use(
  new Strategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ['identify'],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(
  session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

client.once('ready', () => {
  console.log('ButterBot is online!');
});

client.login(process.env.BOT_TOKEN);

// Logowanie do Discorda
app.get('/login', (req, res) => {
  res.redirect('/auth/discord');
});

app.get(
  '/auth/discord',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Endpoint, do którego kierujesz użytkownika po zalogowaniu
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.send('<a href="/login">Login with Discord</a>');
  }
  res.send(`
    <h1>Welcome, ${req.user.username}</h1>
    <p>Your Discord ID: ${req.user.id}</p>
    <p><a href="/logout">Logout</a></p>
  `);
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    res.redirect('/');
  });
});

// Rozpoczęcie aplikacji Express
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
