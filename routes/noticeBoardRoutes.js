const express = require("express");
const router = express.Router();
const NoticeBoardController=require('../controllers/noticeboardController');
const auth = require("../middlewares/auth-middleware");
const NoticeBoardReply= require("../controllers/noticeboardreplyController");

// view notices
router.get('/',auth.isLoggedIn,NoticeBoardController.viewNotice);
router.post('/', auth.isLoggedIn,NoticeBoardController.postNotice);//post notices
router.get('/update/:id',auth.isLoggedIn,NoticeBoardController.getToEdit) ;//edit notices
router.post('/update/:id',auth.isLoggedIn,NoticeBoardController.UpdateNotice); //handling the form
router.get('/delete/:id',auth.isLoggedIn,NoticeBoardController.getToDelete); //handling delete get
router.post('/delete/:id',auth.isLoggedIn,NoticeBoardController.deletePost); //handle delete
router.get('/:id/replies',auth.isLoggedIn,NoticeBoardReply.viewReplesToPost); //handle the display of replies
router.post('/:id/replies',auth.isLoggedIn,NoticeBoardReply.replyToPost); //handle the display of replies
router.get('/:id/reply/edit',auth.isLoggedIn,NoticeBoardReply.getToEditReply);// get reply to edit
router.post('/:id/reply/edit',auth.isLoggedIn,NoticeBoardReply.postEditedReply); //handle display after editing
router.get('/:id/reply/delete',auth.isLoggedIn,NoticeBoardReply.getToDeleteReply); //get reply to delete
router.post('/:id/reply/delete',auth.isLoggedIn,NoticeBoardReply.deleteReply) //deletes selected
module.exports=router;