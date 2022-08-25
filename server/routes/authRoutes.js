const router = require("express").Router();
const jwt = require("jsonwebtoken");
const pool = require("../db");
const bcrypt = require("bcrypt");

const JWTpassword = "e98fZf4eGeEbergre2zaFSSFS81FF8FZ7e";

router.post("/reg", async (req, res) => {
  try {
    let data = await req.body;
    //console.log(data);
    let newUser = {};
    bcrypt.hash(data.password, 10, async (err, hash) => {
      if (err) console.log(err);
      newUser = await pool.query(`
        INSERT INTO users(name,email,username,password,privilege)
         VALUES(
          '${data.name}',
          '${data.email}',
          '${data.username}',
          '${hash}',
          '${"user"}') RETURNING username;
        `);
      if (newUser.hasOwnProperty("rows")) {
        const token = jwt.sign({ userId: newUser.rows[0].username }, JWTpassword);

        // send it in cookie ,and not any cookie: HTTP-only cookie
        // so it cant be accessed via JS in the browser (offline / if hacker injected code to Frontend)
        // where normal cookies are like local storage : can be accessed by js
        //res.cookie("name",value,optionObject) : define a cookie

        const cookieOptions = {
          httpOnly: true, // http cookie for security
        };
        res.cookie("token", token, cookieOptions).send({ username: newUser.rows[0].username });
      } else res.send({ username: "" });
    });
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

/*
  //Session login 
  router.get("/login", async (req, res) => {
    //console.log(req.session.id);
    if (req.session.user) {
      res.send({ loggedIn: true, user: req.session.user });
    } else {
      res.send({ loggedIn: false });
    }
  }); */

router.get("/loginStatus", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.status(200).send({ isLoggedIn: false, privilege: "user" });
    } else {
      const verified = jwt.verify(token, JWTpassword);
      const isAdmin = false;

      // console.log(verified);
      let id = verified.userId;
      const user = await pool.query(`
            SELECT * from users where "id"='${id}';
            `);
      const privilege = user.rows[0].privilege;

      const name = user.rows[0].name;
      const username = user.rows[0].username;
      if (privilege === "admin")
        res
          .status(200)
          .send({ isLoggedIn: true, privilege: "admin", name: name, username: username, id });
      else
        res
          .status(200)
          .send({ isLoggedIn: true, privilege: "user", name: name, username: username, id });
    }
  } catch (error) {
    console.error(error);
    res.status(401).send({ errorMessage: "unauthorized" });
  }
});

router.post("/login", async (req, res) => {
  try {
    let data = await req.body;
    //console.log(data);
    const user = await pool.query(`
      SELECT * from users where "email"='${data.email}';
      `);
    if (user.rows.length) {
      const userId = user.rows[0].id;
      bcrypt.compare(data.password, user.rows[0].password, (err, resolve) => {
        if (resolve) {
          // create token
          const token = jwt.sign({ userId: userId }, JWTpassword);
          // send it in cookie ,and not any cookie: HTTP-only cookie
          // so it cant be accessed via JS in the browser (offline / if hacker injected code to Frontend)
          // where normal cookies are like local storage : can be accessed by js
          //res.cookie("name",value,optionObject) : define a cookie
          const cookieOptions = {
            httpOnly: true, // http cookie for security
          };

          //session
          //req.session.user = user;
          //console.log(req.session.user);
          res.cookie("token", token, cookieOptions).send({ username: user.rows[0].username });
        } else {
          res.send({ username: "" });
        }
      });
    } else {
      console.log("user doesnt  exist");
      res.send({ username: "" });
    }
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

router.get("/logout", (req, res) => {
  try {
    const cookieOptions = { httpOnly: true, expires: new Date(0) };
    res.cookie("token", "", cookieOptions).send({ username: "" });
    //"token", "", the "" cuz value is needed to avoid compiling error
    // so the token cookie will be token : ""
    //but we can delete it entirely when it already expired :
    // the browser will delete it automatically
    // so we do date(0) somewhere in 1970 : in the past
    // its expired , will be deleted then
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

router.get(`/getMail:email`, async (req, res) => {
  try {
    let email = req.params.email;
    //console.log(email);
    const user = await pool.query(`
      SELECT * from users where "email"='${email}';
      `);
    //console.log(user.rows[0]);
    user.rows?.length ? res.send({ email: user.rows[0].email }) : res.send({ email: "" });
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

module.exports = router;
