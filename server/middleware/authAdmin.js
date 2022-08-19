const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWTpassword = "e98fZf4eGeEbergre2zaFSSFS81FF8FZ7e";

//

async function authAdmin(req, res, next) {
  try {
    const { token } = req.cookies;
    console.log(token);
    if (!token) res.status(401).send({ errorMessage: "unauthorized" });
    else {
      const verified = jwt.verify(token, JWTpassword);
      try {
        let id = verified.userId;
        const user = await pool.query(`
          SELECT * from users where "id"='${id}';
          `);
        //console.log(user.rows[0]);
        const privilege = user.rows[0].privilege;
        if (privilege != "admin") res.status(401).send({ errorMessage: "you are not admin" });
        else res.status(200).send({ authorized: "yes" });
        next();
      } catch (error) {
        console.error(error.message);
      }
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(401).send({ errorMessage: "unauthorized" });
  }
}

module.exports = authAdmin;
