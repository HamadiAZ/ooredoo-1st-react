export const FRONT_END_LINK = "http://localhost:3000";

// better be in env variables but nah for now
export const JWTpassword = "e98fZf4eGeEbergre2zaFSSFS81FF8FZ7e";
export const corsOptions = {
  methods: ["GET", "POST", "PUT"],
  credentials: true, //IMPORTANT
  //enable cookies
  origin: FRONT_END_LINK,
};
