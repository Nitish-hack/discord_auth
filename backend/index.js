import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as DiscordStrategy } from "passport-discord";

//configure env
dotenv.config();

//rest object
const app = express();

//middelwares
app.use(cors({
    origin: "http://localhost:3000", 
    credentials: true, 
  }));
app.use(express.json());



var scopes = ['identify', 'email'];

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/discord/redirect',
    scope: scopes
},
    function (req, accessToken, refreshToken, profile, done) {
        try {
            const { id, username, global_name, email, provider } = profile;
            const user = {
                authProviderUserId: id,
                email,
                name: global_name,
                username,
                authProvider: provider,
            };
            done(null, user);
        } catch (error) {
            console.log("Discord Error");
            return done(null, null, { message: "Unknown error" });
        }
    }));

    const generateToken = (user)=> {
        const {name, email, authProviders } = user;
        const payload = {  name, email, authProviders };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        return { token, refreshToken };
      };

function loginWithSocialMediaHandler(req, res, next) {
    return async function (err, user, info) {
       
        try {
            if (err || !user) {
                return res.redirect("http://localhost:3000" + "?error=" + info);
            }
            const { token, refreshToken } = generateToken( user );
            // Set cookies
            res.cookie('accessToken', token, { httpOnly: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true });
            res.redirect('http://localhost:3000');
        } catch (error) {
            return res.redirect(
               "http://localhost:3000" + "?error=" + error.message
            );
        }
    };
}

function removeCookiesHandler(req, res) {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).send("Cookies removed successfully.");
    } catch (error) {
        res.status(500).send("Error removing cookies: " + error.message);
    }
}


function loginDiscord(req, res, next) {
    passport.authenticate(
        "discord",
        { session: false },
        loginWithSocialMediaHandler(req, res, next)
    )(req, res, next);
}



app.get(
    "/discord",
    passport.authenticate("discord", { session: false })
);
app.get("/api/auth/discord/redirect", loginDiscord);
app.get('/api/remove-cookies', removeCookiesHandler);

app.get("/", (req, res) => {
    res.send("<h1>Welcome to gogo </h1>");
});


const PORT = process.env.PORT || 5000;

//run listen
app.listen(PORT, () => {
    console.log(
        `Server Running on port ${PORT}`
    );
});