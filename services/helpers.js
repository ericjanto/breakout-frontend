'use strict';

let i18n = requireLocal('services/i18n');

/**
 * Concatenates first and second.
 * @param first
 * @param second
 */
exports.concat = (first, second) => first + second;

/**
 * Returns true if v1 == v2.
 * @param v1
 * @param v2
 * @param options
 * @returns {*}
 */
exports.ifCond = function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }

  return options.inverse(this);
};

/**
 * Tries to find the matching translation for the language the browser sent us.
 * @param text
 * @param options
 * @private
 */
exports.__ = (text, options) => {

  if (!options.data.root.language) {
    throw 'You did not pass the language to handlebars!';
  }

  const view = options.data.exphbs.view;
  let viewArr = [];

  if (view) {
    if (view.indexOf('\\') > -1) {
      viewArr = view.split('\\');
    } else {
      viewArr = view.split('/');
    }
  }

  if (text.indexOf('.') > -1) {
    viewArr = text.split('.');
    text = viewArr.pop();
  } else if (!view) {
    logger.error(`Could not parse view in ${options.data.exphbs}`);
  }

  return i18n.translate(viewArr[viewArr.length - 1].toUpperCase(), text.toUpperCase(), options.data.root.language);
};
