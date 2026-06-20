const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');

router.use(protect);
router.use(checkRole(['admin']));

router.get('/', getUsers);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
