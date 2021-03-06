// server side js
module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "jquery": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": 1,
      "require-yield": 0
    },
    "globals": {
      "ROOT": true,
      "IS_TEST": true,
      "HBS": true
    },
    "parserOptions": {
      "ecmaVersion": 6,
      "ecmaFeatures": {
        "experimentalObjectRestSpread": true
      }
    },
}
