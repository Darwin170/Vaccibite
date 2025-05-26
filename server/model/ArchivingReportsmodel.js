
const mongoose = require('mongoose');

const reportSchema = require('./reportsmodel').schema;

const ArchivedReport = mongoose.model('ArchivedReport', reportSchema);

module.exports = ArchivedReport;
