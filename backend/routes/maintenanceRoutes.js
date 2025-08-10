const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');

const router = express.Router();

router.post('/api/v1/maintenance/promote-preparto', maintenanceController.promotePreParto);

module.exports = router;
