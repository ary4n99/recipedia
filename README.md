# Recipedia

!["License"](https://img.shields.io/github/license/W8-Recipedia/Recipedia)
!["Vulnerabilities"](https://img.shields.io/snyk/vulnerabilities/github/W8-Recipedia/Recipedia)
!["Repository size"](https://img.shields.io/github/repo-size/W8-Recipedia/Recipedia)
!["Version"](https://img.shields.io/github/package-json/v/W8-Recipedia/Recipedia)
!["Deploy"](https://img.shields.io/netlify/f95d5909-051d-4a94-ad17-4f8c86c80fc1)

Recipedia is a web application that revolutionizes the way that people find recipes. It recommends the most suitable recipes to users based on their dietary preferences, allergies, and health data. It complements this feature with a search function, which allows users to filter recipes by cuisine and/or diet.

## Getting Started

These instructions will get Recipedia up and running on your local machine.

### Prerequisites

You need `node` and `npm` installed globally on your machine. You will also need to make a [Spoonacular](https://spoonacular.com/food-api/console#Dashboard) account to access the [Spoonacular API](https://spoonacular.com/food-api), and a MySQL database to store user details.

### Installing

Cloning the repository:

```cmd
git clone https://github.com/W8-Recipedia/Recipedia.git
```

---

Environment variables:

Add a `.env` file to your client and server directories, and replace `[...]` with the relevant values.

client/.env

```dosini
REACT_APP_SERVER_URL=http://localhost:3001
```

server/.env

```dosini
DATABASE_HOST=[DATABASE URL]
DATABASE_NAME=[DATABASE NAME]
DATABASE_PASSWORD=[DATABASE PASSWORD]
DATABASE_USER=[DATABASE USER]
ENCRYPTION_KEY=[RANDOM ALPHANUMERICAL STRING]
JWT_SECRET=[RANDOM ALPHANUMERICAL STRING]
LOCALHOST_CLIENT_URL=http://localhost:3000
PORT=3001
RECIPE_API_KEY=[SPOONACULAR API KEY]
RECIPE_NUMBER=24
RECIPEDIA_EMAIL=[USER VERIFICATION EMAIL ADDRESS]
RECIPEDIA_PASSWORD=[USER VERIFICATION EMAIL PASSWORD]
```

---

Database setup (replace `+XX:XX` with your time zone):

```sql
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+XX:XX";

CREATE TABLE `users` (
  `userid` int(11) NOT NULL,
  `firstname` text COLLATE utf8_unicode_ci NOT NULL,
  `lastname` text COLLATE utf8_unicode_ci NOT NULL,
  `googlelogin` tinyint(1) NOT NULL DEFAULT '0',
  `email` varchar(254) COLLATE utf8_unicode_ci NOT NULL,
  `password` text COLLATE utf8_unicode_ci,
  `diet` text COLLATE utf8_unicode_ci,
  `allergens` text DEFAULT NULL,
  `health` text DEFAULT NULL,
  `favourites` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `users`
  ADD PRIMARY KEY (`userid`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `users`
  MODIFY `userid` int(11) NOT NULL AUTO_INCREMENT;
```

---

Installation:

```cmd
npm run install-all
```

Starting Recipedia:

```cmd
npm start
```

## Built With

- [React](https://reactjs.org/)
- [Material-UI](https://material-ui.com/)
- [Spoonacular API](https://spoonacular.com/food-api)
- [Formik + Yup](https://formik.org/)
- [Axios](https://www.npmjs.com/package/axios)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [JWT](https://jwt.io/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [NPM](https://www.npmjs.com/)
- [Google Sign-in](https://developers.google.com/identity/sign-in/web)

## Authors

- **[Aryan Agrawal](https://github.com/ary4n99)**
- **[Shadi Abumattar](https://github.com/AbumattarSA)**
- [Ahmed Soliman](https://github.com/LEGENDSOLI)
- [Yuxuan Lei](https://github.com/yuxuanlei)
- [AJ Singh](https://github.com/asjsingh)
- [Stefan Tutugan](https://github.com/tutugan)
- [Max Lawley](https://github.com/lawleymax)

## Code of Conduct

W8 has a strict code of conduct, that we endeavour to follow at all times - see the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) file for more details about our ethical values and principles.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for more details.

## Acknowledgments

- [Devias Material-UI Kit](https://github.com/devias-io/material-kit-react/) - Initial website design
- [Prettier](https://prettier.io/) - Code formatting
