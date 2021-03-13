require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const request = require("request");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const saltRounds = 10;
const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTIONKEY;
const iv = crypto.randomBytes(16);

const app = express();

const con = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.RECIPEDIA_EMAIL,
    pass: process.env.RECIPEDIA_PASSWORD,
  },
});

const encrypt = (text) => {
  if (text) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return JSON.stringify({
      iv: iv.toString("hex"),
      content: encrypted.toString("hex"),
    });
  } else {
    return null;
  }
};

const decrypt = (hash) => {
  if (hash) {
    hashJSON = JSON.parse(hash);
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(hash.iv, "hex")
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString();
  } else {
    return null;
  }
};

const sendVerificationEmail = (user) => {
  const token = jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  var mailOptions = {
    from: "w8.recipedia@gmail.com",
    to: req.body.email,
    subject: "Verify your Recipedia account",
    text: `Click here to verify your Recipedia account (this link is valid for 1 hour): ${
      process.env.LOCALHOST_CLIENT_URL
        ? [process.env.LOCALHOST_CLIENT_URL]
        : [process.env.NETLIFY_CLIENT_URL]
    }/verify/${token}`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return "error";
    } else {
      return "success";
    }
  });
};

app.use(
  cors({
    origin: process.env.LOCALHOST_CLIENT_URL
      ? [process.env.LOCALHOST_CLIENT_URL]
      : [process.env.NETLIFY_CLIENT_URL],
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  const allowedOrigins = process.env.LOCALHOST_CLIENT_URL
    ? [process.env.LOCALHOST_CLIENT_URL]
    : [process.env.NETLIFY_CLIENT_URL];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(express.json());

app.post("/recipes/random", (req, res) => {
  const apiKey = `apiKey=${process.env.RECIPE_API_KEY}`;
  const recipeTags = req.body.tags ? `&tags=${req.body.tags}` : ``;
  const recipeNumber = `&number=${process.env.RECIPE_NUMBER}`;
  request(
    `https://api.spoonacular.com/recipes/random?${apiKey}${recipeTags}${recipeNumber}`,
    (error, response, body) => {
      res.json(JSON.parse(body).recipes);
    }
  );
});

app.post("/recipes/informationbulk", (req, res) => {
  const apiKey = `apiKey=${process.env.RECIPE_API_KEY}`;
  const recipeIDs = `&ids=${req.body.favourites}`;

  request(
    `https://api.spoonacular.com/recipes/informationBulk?${apiKey}${recipeIDs}`,
    (error, response, body) => {
      res.json(JSON.parse(body));
    }
  );
});

app.post("/recipes/complexsearch", (req, res) => {
  const apiKey = `apiKey=${process.env.RECIPE_API_KEY}`;
  const instructions = `&instructionsRequired=${req.body.instructions}`;
  const recipeInformation = `&addRecipeInformation=${req.body.recipeinformation}`;
  const ingredients = `&fillIngredients=${req.body.fillingredients}`;
  const recipeNumber = `&number=${process.env.RECIPE_NUMBER}`;
  const diet = req.body.diet ? `&diet=${req.body.diet}` : ``;
  const intolerances = req.body.intolerances
    ? `&intolerances=${req.body.intolerances}`
    : ``;
  const type = req.body.type ? `&type=${req.body.type}` : ``;
  const cuisine = req.body.cuisine ? `&cuisine=${req.body.cuisine}` : ``;
  const offset = `&offset=${req.body.offset}`;
  const query = req.body.query ? `&query=${req.body.query}` : ``;

  request(
    `https://api.spoonacular.com/recipes/complexSearch?${apiKey}${instructions}${recipeInformation}${ingredients}${recipeNumber}${diet}${intolerances}${type}${cuisine}${offset}${query}`,
    (error, response, body) => {
      res.json(JSON.parse(body));
    }
  );
});

app.post("/login", (req, res) => {
  con.query(
    "SELECT * FROM users WHERE email = ?",
    req.body.email,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else if (result.length != 1) {
        res.json({ message: "noAccount" });
      } else if (result[0].googlelogin) {
        res.json({ message: "wrongAccountType" });
      } else if (result[0].verifiedemail != 1) {
        res.json({ message: "accountNotVerified" });
      } else {
        const userID = result[0].userid;
        const email = result[0].email;
        const firstName = decrypt(result[0].firstname);
        const lastName = decrypt(result[0].lastname);
        bcrypt.compare(
          req.body.password,
          decrypt(result[0].password),
          (err) => {
            if (err) {
              res.json({ message: "wrongPassword" });
            } else {
              const user = {
                userid: userID,
                email: email,
                firstname: firstName,
                lastname: lastName,
              };
              const token = jwt.sign({ user }, process.env.JWT_SECRET, {
                expiresIn: "30m",
              });
              res.json({
                token: token,
              });
            }
          }
        );
      }
    }
  );
});

app.post("/glogin", (req, res) => {
  con.query(
    "SELECT * FROM users WHERE email = ?",
    req.body.userprofile.email,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else if (result.length != 1) {
        res.json({ message: "noAccount" });
      } else if (!result[0].googlelogin) {
        res.json({ message: "wrongAccountType" });
      } else if (result[0].verifiedemail != 1) {
        res.json({ message: "accountNotVerified" });
      } else {
        const user = req.body.userprofile;
        const token = jwt.sign({ user }, process.env.JWT_SECRET, {
          expiresIn: "30m",
        });
        res.json({
          token: token,
        });
      }
    }
  );
});

app.post("/signup", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    con.query(
      "INSERT INTO users (firstname, lastname, email, password) VALUES (?,?,?,?)",
      [
        encrypt(req.body.firstname),
        encrypt(req.body.lastname),
        req.body.email,
        encrypt(hash),
      ],
      (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          const user = {
            email: req.body.email,
          };
          sendVerificationEmail(user).then((response) => {
            if (response === "error") {
              res.json({ message: "emailError" });
            } else {
              res.json({ message: "emailSuccess" });
            }
          });
        }
      }
    );
  });
});

app.post("/gsignup", (req, res) => {
  con.query(
    "INSERT INTO users (firstname, lastname, googlelogin, email) VALUES (?,?,?,?)",
    [
      encrypt(req.body.user.givenName),
      encrypt(req.body.user.familyName),
      1,
      req.body.user.email,
    ],
    (err) => {
      if (err) {
        res.json({ message: err });
      } else {
        const user = {
          email: req.body.email,
        };
        sendVerificationEmail(user).then((response) => {
          if (response === "error") {
            res.json({ message: "emailError" });
          } else {
            res.json({ message: "emailSuccess" });
          }
        });
      }
    }
  );
});

app.post("/resendverification", (req, res) => {
  con.query(
    "SELECT * FROM users WHERE email = ?",
    req.body.email,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else if (result.length != 1) {
        res.json({ message: "noAccount" });
      } else if (result[0].verifiedemail == 1) {
        res.json({ message: "accountAlreadyVerified" });
      } else {
        const user = {
          email: req.body.email,
        };
        sendVerificationEmail(user).then((response) => {
          if (response === "error") {
            res.json({ message: "emailError" });
          } else {
            res.json({ message: "emailSuccess" });
          }
        });
      }
    }
  );
});

app.get("/verifyemail", (req, res) => {
  if (!req.headers["x-access-token"]) {
    res.json({ message: "notLoggedIn" });
  } else {
    jwt.verify(
      req.headers["x-access-token"],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({ message: "invalidToken" });
        } else {
          con.query(
            "UPDATE users SET verifiedemail = ? WHERE email = ?",
            [1, decoded.user.email],
            (err, result) => {
              if (err) {
                res.json({ message: "databaseError" });
              } else {
                res.json({ message: "userVerified" });
              }
            }
          );
        }
      }
    );
  }
});

app.get("/getuserdata", (req, res) => {
  if (!req.headers["x-access-token"]) {
    res.json({ message: "notLoggedIn" });
  } else {
    jwt.verify(
      req.headers["x-access-token"],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({ message: "invalidToken" });
        } else {
          con.query(
            "SELECT * FROM users WHERE email = ?",
            decoded.user.email,
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else if (result.length != 1) {
                res.json({ message: "noAccount" });
              } else {
                user = decoded.user;
                const token = jwt.sign({ user }, process.env.JWT_SECRET, {
                  expiresIn: "30m",
                });
                const jsonResponse = {};
                if (result[0].diet) {
                  jsonResponse.diet = decrypt(result[0].diet);
                } else if (result[0].allergens) {
                  jsonResponse.allergens = JSON.parse(
                    decrypt(result[0].allergens)
                  );
                } else if (result[0].health) {
                  jsonResponse.health = JSON.parse(decrypt(result[0].health));
                } else if (result[0].favourites) {
                  jsonResponse.favourites = JSON.parse(
                    decrypt(result[0].favourites)
                  );
                }
                jsonResponse.message = "loggedIn";
                jsonResponse.token = token;
                jsonResponse.user = decoded.user;
                res.json(jsonResponse);
              }
            }
          );
        }
      }
    );
  }
});

app.post("/addtofavourites", (req, res) => {
  if (!req.headers["x-access-token"]) {
    res.json({ message: "notLoggedIn" });
  } else {
    jwt.verify(
      req.headers["x-access-token"],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({ message: "invalidToken" });
        } else {
          con.query(
            "SELECT * FROM users WHERE email = ?",
            decoded.user.email,
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else if (result.length != 1) {
                res.json({ message: "noAccount" });
              } else if (!result[0].favourites) {
                con.query(
                  "UPDATE users SET favourites = ? WHERE email = ?",
                  [
                    encrypt(JSON.stringify([req.body.favourite.toString()])),
                    decoded.user.email,
                  ],
                  (err) => {
                    if (err) {
                      res.json({ message: err });
                    } else {
                      res.json({ message: "favouritesUpdated" });
                    }
                  }
                );
              } else {
                favouriteList = JSON.parse(
                  decrypt(JSON.parse(result[0].favourites))
                );
                if (favouriteList.includes(req.body.favourite.toString())) {
                  res.json({ message: "favouriteExists" });
                } else {
                  favouriteList.push(req.body.favourite.toString());
                  con.query(
                    "UPDATE users SET favourites = ? WHERE email = ?",
                    [
                      encrypt(JSON.stringify(favouriteList)),
                      decoded.user.email,
                    ],
                    (err) => {
                      if (err) {
                        res.json({ message: err });
                      } else {
                        res.json({
                          message: "favouritesUpdated",
                        });
                      }
                    }
                  );
                }
              }
            }
          );
        }
      }
    );
  }
});

app.post("/removefromfavourites", (req, res) => {
  if (!req.headers["x-access-token"]) {
    res.json({ message: "notLoggedIn" });
  } else {
    jwt.verify(
      req.headers["x-access-token"],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({ message: "invalidToken" });
        } else {
          con.query(
            "SELECT * FROM users WHERE email = ?",
            decoded.user.email,
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else if (result.length != 1) {
                res.json({ message: "noAccount" });
              } else if (!result[0].favourites) {
                res.json({ message: "noFavourites" });
              } else {
                favouriteList = JSON.parse(decrypt(result[0].favourites));
                if (favouriteList.includes(req.body.favourite.toString())) {
                  const favouriteIndex = favouriteList.indexOf(
                    req.body.favourite.toString()
                  );
                  favouriteList.splice(favouriteIndex, 1);
                  con.query(
                    "UPDATE users SET favourites = ? WHERE email = ?",
                    [
                      encrypt(JSON.stringify(favouriteList)),
                      decoded.user.email,
                    ],
                    (err) => {
                      if (err) {
                        res.json({ message: err });
                      } else {
                        res.json({ message: "favouriteRemoves" });
                      }
                    }
                  );
                }
              }
            }
          );
        }
      }
    );
  }
});

app.post("/changeuserinfo", (req, res) => {
  if (!req.headers["x-access-token"]) {
    res.json({ message: "notLoggedIn" });
  } else {
    jwt.verify(
      req.headers["x-access-token"],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({ message: "invalidToken" });
        } else {
          con.query(
            "UPDATE users SET firstname = ?, lastname = ?, email = ? WHERE email = ?",
            [
              encrypt(req.body.firstname),
              encrypt(req.body.lastname),
              req.body.email,
              decoded.user.email,
            ],
            (err) => {
              if (err) {
                res.json({ message: err });
              } else {
                const user = decoded.user;
                const token = jwt.sign({ user }, process.env.JWT_SECRET, {
                  expiresIn: "30m",
                });
                res.json({ token: token, message: "updateSuccess" });
              }
            }
          );
        }
      }
    );
  }
});

app.post("/changeuserpreferences", (req, res) => {
  if (!req.headers["x-access-token"]) {
    res.json({ message: "notLoggedIn" });
  } else {
    jwt.verify(
      req.headers["x-access-token"],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({ message: "invalidToken" });
        } else {
          const healthData = {
            height: req.body.height,
            weight: req.body.weight,
            activity: req.body.activity,
          };
          con.query(
            "UPDATE users SET diet = ?, allergens = ?, health = ? WHERE email = ?",
            [
              encrypt(req.body.diet),
              encrypt(JSON.stringify(req.body.allergens)),
              encrypt(JSON.stringify(healthData)),
              decoded.user.email,
            ],
            (err) => {
              if (err) {
                res.json({ message: err });
              } else {
                user = decoded.user;
                const token = jwt.sign({ user }, process.env.JWT_SECRET, {
                  expiresIn: "30m",
                });
                res.json({ token: token, message: "updateSuccess" });
              }
            }
          );
        }
      }
    );
  }
});

app.post("/changeuserpassword", (req, res) => {
  if (!req.headers["x-access-token"]) {
    res.json({ message: "notLoggedIn" });
  } else {
    jwt.verify(
      req.headers["x-access-token"],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({ message: "invalidToken" });
        } else {
          con.query(
            "SELECT * FROM users WHERE email = ?",
            decoded.user.email,
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else if (result.length != 1) {
                res.json({ message: "noAccount" });
              } else {
                bcrypt.compare(
                  req.body.oldpassword,
                  decrypt(result[0].password),
                  (err) => {
                    if (err) {
                      res.json({ message: err });
                    } else {
                      bcrypt.hash(
                        req.body.newpassword,
                        saltRounds,
                        (err, hash) => {
                          if (err) {
                            res.json({
                              message: err,
                            });
                          } else {
                            con.query(
                              "UPDATE users SET password = ? WHERE email = ?",
                              [hash, decoded.user.email],
                              (err) => {
                                if (err) {
                                  res.json({
                                    message: err,
                                  });
                                } else {
                                  const userID = result[0].userid;
                                  const email = result[0].email;
                                  const firstName = decrypt(
                                    result[0].firstname
                                  );
                                  const lastName = decrypt(result[0].lastname);
                                  const user = {
                                    userid: userID,
                                    email: email,
                                    firstname: firstName,
                                    lastname: lastName,
                                  };
                                  const token = jwt.sign(
                                    { user },
                                    process.env.JWT_SECRET,
                                    {
                                      expiresIn: "30m",
                                    }
                                  );
                                  res.json({
                                    token: token,
                                    message: "passwordChanged",
                                  });
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  }
});

app.post("/submitfeedback", (req, res) => {
  if (!req.headers["x-access-token"]) {
    res.json({ message: "notLoggedIn" });
  } else {
    jwt.verify(
      req.headers["x-access-token"],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({ message: "invalidToken" });
        } else {
          user = decoded.user;
          const token = jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: "30m",
          });
          const mailOptions = {
            from: "w8.recipedia@gmail.com",
            to: "w8.recipedia@gmail.com",
            subject: "Feedback",
            text: req.body.feedback,
          };
          transporter.sendMail(mailOptions, (err) => {
            if (err) {
              res.json({ message: err, token: newtoken });
            } else {
              res.json({ message: "feedbackSent", token: token });
            }
          });
        }
      }
    );
  }
});

app.get("/deleteaccount", (req, res) => {
  if (!req.headers["x-access-token"]) {
    res.json({ message: "notLoggedIn" });
  } else {
    jwt.verify(
      req.headers["x-access-token"],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          res.json({ message: "invalidToken" });
        } else {
          con.query(
            "DELETE FROM users WHERE email = ?",
            decoded.user.email,
            (err) => {
              if (err) {
                res.json({ message: err });
              } else {
                res.json({ message: "accountDeleted" });
              }
            }
          );
        }
      }
    );
  }
});

app.listen(process.env.PORT, () => {});
