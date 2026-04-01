const fs = require('fs/promises')

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController.js');
const auth = require('../middlewares/auth-middleware.js');

router.get('/', auth.isAdmin, adminController.showAdminHome);
router.post('/confirm-delete', auth.isAdmin, adminController.getMarkedUsers); // First POST is to show confirmation
router.post('/delete-users', auth.isAdmin, adminController.deleteUsers); // Second POST to actually perform deletion
router.get('/create-user', auth.isAdmin, adminController.showCreateUserForm);
router.post('/create-user', auth.isAdmin, adminController.createUser);
router.post('/make-admin', auth.isAdmin, adminController.makeUserAdmin); // Both superadmin and normal admins can promote.
router.post('/demote-admin', auth.isSuperAdmin, adminController.demoteUserAdmin);
router.get('/logs/:userID', auth.isAdmin, adminController.showLogs);

module.exports = router;