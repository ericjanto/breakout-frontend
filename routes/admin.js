'use strict';

const express = require('express');
const router = express.Router();
const session = requireLocal('controller/session');
const admin = requireLocal('controller/page-controller/admin');
const co = require('co');

const renderAdmin = (template) => (req, res) =>
  res.render(`static/admin/${template}`,
    {
      error: req.flash('error'),
      success: req.flash('success'),
      layout: 'funnel',
      language: req.language
    });

router.get('/payment', session.isAdmin, renderAdmin('payments'));
router.get('/', session.isAdmin, (req, res, next) => co(function*() {
  return res.send(yield admin.getInvoices(req));
}).catch((ex) => {
  console.log(ex);
  next(ex);
}));

router.post('/payment/confirm', session.isAdmin, admin.addPayment);

module.exports = router;
