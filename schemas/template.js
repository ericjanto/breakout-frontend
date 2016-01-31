var mongoose = require('mongoose');

module.exports =  new mongoose.Schema({
  name: {type: String, required: true},
  title: String,
  vars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'variable'
  }]
});