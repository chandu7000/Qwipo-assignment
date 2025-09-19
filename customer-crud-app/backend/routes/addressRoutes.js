const express = require('express');
const { validate, addressSchema } = require('../middlewares/validation');
const controller = require('../controllers/addressController');

const router = express.Router();

router.get('/', controller.listAddresses);
router.post('/', validate(addressSchema), controller.createAddress);
router.put('/:id', controller.updateAddress);
router.delete('/:id', controller.deleteAddress);

module.exports = router;


