const express = require("express");
const router = express.Router();
const NoticeBoardController=require('../controllers/noticeboardController');
const auth = require("../middlewares/auth-middleware");


// view notices
router.get('/',auth.isLoggedIn,NoticeBoardController.viewNotice)
router.post('/', auth.isLoggedIn,NoticeBoardController.postNotice)//post notices
router.get('/update/:id',auth.isLoggedIn,NoticeBoardController.getToEdit) //edit notices
router.post('/update/:id',auth.isLoggedIn,NoticeBoardController.UpdateNotice) //handling the form
router.get('/delete/:id',auth.isLoggedIn,NoticeBoardController.getToDelete) //handling delete get
router.post('/delete/:id',auth.isLoggedIn,NoticeBoardController.deletePost) //handle delete
module.exports=router;