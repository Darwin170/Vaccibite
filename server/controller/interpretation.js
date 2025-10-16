const Report = require('../model/reportsmodel');
const Location = require('../model/Barangays');
const mongoose = require('mongoose');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getMonthNumber = (month) => parseInt(month, 10);

const buildMatchCriteria = (query) => {
    const { startMonth, endMonth, incidentType, district, barangayId, status } = query;

    const criteria = {};

    if (status) { criteria.status = status; }
    if (incidentType) { criteria.incidentType = incidentType; }
    if (district) { criteria.district = district; }
    
    if (barangayId) {
        criteria.barangayId = mongoose.Types.ObjectId.isValid(barangayId)
                               ? new mongoose.Types.ObjectId(barangayId)
                               : barangayId;
    } 
    if (startMonth && endMonth && (startMonth !== '1' || endMonth !== '12')) {
        criteria.$expr = {
            $and: [
                { $gte: [{ $month: '$created_at' }, getMonthNumber(startMonth)] },
                { $lte: [{ $month: '$created_at' }, getMonthNumber(endMonth)] }
            ]
        };
    }

    return criteria;
};
