const express = require("express");
const router = express.Router();
const DiscussionBoardController=require('../controllers/discussionboardController');
const auth = require("../middlewares/auth-middleware");
const DiscussionBoardReply= require("../controllers//discussionboardreplyController");

// view notices
router.get('/',auth.isLoggedIn,DiscussionBoardController.viewNotice);
router.post('/', auth.isLoggedIn,DiscussionBoardController.postNotice);//post notices
router.get('/update/:id',auth.isLoggedIn,DiscussionBoardController.getToEdit) ;//edit notices
router.post('/update/:id',auth.isLoggedIn,DiscussionBoardController.UpdateNotice); //handling the form
router.get('/delete/:id',auth.isLoggedIn,DiscussionBoardController.getToDelete); //handling delete get
router.post('/delete/:id',auth.isLoggedIn,DiscussionBoardController.deletePost); //handle delete
router.get('/:id/replies',auth.isLoggedIn,DiscussionBoardReply.viewReplesToPost); //handle the display of replies
router.post('/:id/replies',auth.isLoggedIn,DiscussionBoardReply.replyToPost); //handle the display of replies
router.get('/:id/reply/edit',auth.isLoggedIn,DiscussionBoardReply.getToEditReply);// get reply to edit
router.post('/:id/reply/edit',auth.isLoggedIn,DiscussionBoardReply.postEditedReply); //handle display after editing
router.get('/:id/reply/delete',auth.isLoggedIn,DiscussionBoardReply.getToDeleteReply); //get reply to delete
router.post('/:id/reply/delete',auth.isLoggedIn,DiscussionBoardReply.deleteReply) //deletes selected
module.exports=router;