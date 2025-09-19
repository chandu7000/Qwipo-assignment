const express = require('express');
const { validate, customerSchema } = require('../middlewares/validation');
const controller = require('../controllers/customerController');

const router = express.Router();

router.get('/', controller.listCustomers);
router.get('/:id', controller.getCustomerById);
router.post('/', validate(customerSchema), controller.createCustomer);
router.put('/:id', controller.updateCustomer);
router.delete('/:id', controller.deleteCustomer);

module.exports = router;


