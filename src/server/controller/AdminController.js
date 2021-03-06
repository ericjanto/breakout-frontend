'use strict';
/**
 * Controller for the admin page.
 */

const co = require('co');
const _ = require('lodash');
const api = require('../services/api-proxy');
const Promise = require('bluebird');
const logger = require('../services/logger');
const config = require('../config/config');
const axios = require('axios');

let admin = {};

let callReasons = [
  'Technical Problem',
  '5h Update',
  'New Transport',
  'Finished BreakOut',
  'Sickness',
  'Emergency',
  'Other'
];

const defaultOptions = (req) => {
  return {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'master',
    isLoggedIn: req.user,
    language: req.language
  };
};

admin.showDashboardEmails = function*(req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-emails';
  let emailAddress = req.query.emailAddress;

  if(emailAddress) {
    options.data = {};
    const emails = yield admin.getAllEmailsTo(emailAddress);

    // Date in JS is in ms but api response is in s
    options.data.emails = emails.map(email => {
      email.create_date = email.create_date * 1000;
      return email;
    });
  }

  res.render('static/admin/dashboard', options);
};

admin.showDashboardUsers = function*(req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-users';
  res.render('static/admin/dashboard', options);
};

function getAccessTokenFromRequest(req) {
  return req.user.access_token;
}

admin.getSponsoringInvoicesByEventId = function(tokens, eventId) {
  return api.getModel(`/sponsoringinvoice/${eventId}/`, tokens);
};

admin.addPayment = function *(req, res) {
  logger.info(`Trying to add payment for invoice ${req.body.invoice}`);

  let body = {
    amount: req.body.amount,
    fidorId: req.body.fidorId,
    date: Math.round(new Date().getTime() / 1000)
  };

  try {
    yield api.postModel(`invoice/${req.body.invoice}/payment/`, req.user, body);
    res.sendStatus(200);
  } catch (err) {
    res.status(500);
    logger.error(`An error occured while trying to add a payment to invoice ${req.body.invoice}: `, err);
    if (err.message) {
      res.json({message: err.message});
    } else {
      res.json({message: 'An unknown error occured'});
    }

  }
};

admin.setTeamSleepStatus = function *(req, res) {
  try {
    let team = yield api.putModel(`event/${req.body.eventid}/team`, req.body.teamid, req.user, { asleep: req.body.asleep });
    res.redirect('/admin/event/teamoverview/');
  } catch (err) {
    res.status(500);
    logger.error(`An error occured while trying to update the last contact ${req.body.update}: `, err);
    if (err.message) {
      res.json({message: err.message});
    } else {
      res.json({message: 'An unknown error occured'});
    }
  }
};

admin.updateLastContact = function *(req, res) {

  try {
    let comment = yield api.postModel(`teamoverview/${req.body.teamid}/lastContactWithHeadquarters/`, req.user, { comment: req.body.update, reason: req.body.reason });
    res.redirect('/admin/event/teamoverview/');
  } catch (err) {
    res.status(500);
    logger.error(`An error occured while trying to update the last contact ${req.body.update}: `, err);
    if (err.message) {
      res.json({message: err.message});
    } else {
      res.json({message: 'An unknown error occured'});
    }

  }
};

admin.getAllEmailsTo = function(emailAddress) {
  return axios.get(`https://mail.break-out.org/get/to/${emailAddress}`, {
    headers: {
      'X-AUTH-TOKEN': config.mailer.x_auth_token
    }
  }).then(resp => resp.data);
};

admin.checkinTeam = function *(req, res) {

  const tokens = req.user;
  const update = {hasStarted: true};

  let checkin = yield api.putModel(`event/${req.body.event}/team`, req.body.team, tokens, update);

  if (!checkin) return res.sendStatus(500);

  return res.sendStatus(200);
};

admin.getAllInvoices = (req) => co(function*() {

  let rawInvoices = yield api.invoice.getAll(req.user);

  var teams = [];


  var invoices = rawInvoices.map(i => {
    if (i.payments.length) {
      i.payed = i.payments.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0);
      i.open = i.amount - i.payed;
      if (i.open < 0) i.open = 0;
    } else {
      i.payed = 0;
      i.open = i.amount;
    }
    return i;
  });


  invoices.forEach(i => {
    if (!teams[i.teamId]) teams[i.teamId] = 0;
    teams[i.teamId] += i.payed;
  });

  // TODO: This is unused, what is the reason?
  var depositTeams = teams.map((t, index) => {
    if (t > 100) {
      return {
        teamId: index,
        amount: t
      };
    }
  });

  return invoices;


}).catch((ex) => {
  throw ex;
});

admin.addAmountToInvoice = function *(req, res) {

  let addAmount = yield api.invoice.addAmount(req.user, req.body.invoiceId, req.body.amount);

  if (!addAmount) return res.sendStatus(500);

  return res.sendStatus(200);
};

admin.addInvoice = function *(req, res) {

  var body = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    company: req.body.company,
    teamId: parseFloat(req.body.teamId),
    amount: parseFloat(req.body.amount)
  };

  let addAmount = yield api.invoice.create(req.user, body);

  if (!addAmount) return res.sendStatus(500);

  return res.status(200).send(addAmount);

};

admin.challengeProof = function *(req, res) {
  let challenge = yield api.admin.challengeProof(req.user.access_token, req.body.challengeId, req.body.postingId);

  if (!challenge) return res.sendStatus(500);

  return res.status(200).send(challenge);
};

module.exports = admin;
