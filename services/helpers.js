'use strict';

let i18n = requireLocal('services/i18n');

exports.concat = (first, second) => first + second;

exports.ifCond = function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }

  return options.inverse(this);
};

exports.__ = (text, options) => {

  if (!options.data.root.language) {
    throw 'You did not pass the language to handlebars!';
  }

  const view = options.data.exphbs.view;
  let viewArr = [];

  if (view.indexOf('\\') > -1) {
    viewArr = view.split('\\');
  } else {
    viewArr = view.split('/');
  }

  if(text.indexOf('.') > -1) {
    viewArr = text.split('.');
    text = viewArr.pop();
  }

  return i18n.translate(viewArr[viewArr.length - 1].toUpperCase(), text.toUpperCase(), options.data.root.language);
};
