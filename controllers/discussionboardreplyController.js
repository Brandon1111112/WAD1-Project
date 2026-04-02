const User = require('../models/user-model');
const Logs = require('../models/logs-model');
const validator = require("./utils/validation");
const auth = require('../middlewares/auth-middleware');
// get models (both)
const DiscussionBoard=require('../models/discussionboard-model');
const DiscussionBoardReply=require('../models/discussionboardreply-model')
const generateRepliesToPost = async function (postID) {
    let output =[];
    const replies= await DiscussionBoardReply.getAllReply(postID);
    for (const reply of replies){
        try {
            let content= {
                replyID:reply._id,
                userID:reply.userID._id,
                username:reply.userID.name,
                reply:reply.reply,
                timeCreated:reply.createdAt,
                edited:reply.edited
            };
        output.push(content)
        } catch (error) {
            console.error(error);
          let content= {
                replyID:reply._id,
                userID:'Account not found',
                username:'Account not found',
                reply:reply.reply,
                timeCreated:reply.createdAt,
                edited:reply.edited
            };
        output.push(content)  
        }
        
    };
    return output
}


exports.viewReplesToPost = async (req,res)=>{
const userID=req.session.user.userId;
const admin = req.session.user.admin;
const superAdmin = req.session.user.superAdmin;
const postID=req.params.id; //get post ID from url
try {
    output= await generateRepliesToPost(postID)
    
    res.render('discussionboard-replies',{output,userID,postID,admin,superAdmin,msg:''});
} catch (error) {
    console.error('error in replies',error)
    return res.send(`error,contact support with screenshot ${error}`)
};
};
exports.replyToPost = async (req,res) => {
    const postID=req.params.id;
    const data=req.body.reply;
    const userID=req.session.user.userId;
    const admin=req.session.user.admin;
    const superAdmin=req.session.user.superAdmin;
    try {
        const reply={
            userID:userID,
            parentPostID:postID,
            reply:data
        }
        if (validator.isMissingText(data)||validator.isInvalidId(userID)){
                let msg=[];
                msg.push('message missing from notice'+ ' ' +(validator.isMissingText(reply.reply)));
                msg.push('User ID Missing from notice'+ ' ' +(validator.isInvalidId(userID)));
                let result ='fail' //if fail, no result is returned
                console.error(msg)
                let output= await generateRepliesToPost(postID);
                
                return res.render('discussionboard-replies',{output,userID,postID,admin,superAdmin,msg});
            };
        await DiscussionBoardReply.addNewReply(reply);
        output= await generateRepliesToPost(postID)
        let msg='Reply Successful'
        await Logs.createALog(req.session.user.userId, 'Added a reply to a post', 'reply', postID);
    res.render('discussionboard-replies',{output,userID,postID,admin,superAdmin,msg:''});
        
    } catch (error) {
        console.error('error in replies',error)
    return res.send(`error,contact support with screenshot ${error}`)
    }

};
exports.getToEditReply = async (req,res) =>{
let userID=req.session.user.userId;
const admin = req.session.user.admin;
const superAdmin = req.session.user.superAdmin
    let msg=''
    try {
        const replyID=req.params.id;
       
        let result = await DiscussionBoardReply.findByReplyID(replyID);

        if (!result){
            msg+='Reply not found';
            return res.status(404).render('discussionboard-replies-update',{result:null,msg});
        }
        if (admin||superAdmin||(String(userID)==String(result.userID._id))){ //Remember to do type conversion
        
        res.render('discussionboard-replies-update',{result,userID,msg});
        } else {
            let reason = req.session.admin ? null : 'not admin';
            reason += req.session.superAdmin ? null : 'not Super admin';
            reason += String(userID)==String(result.userID._id)? reason :'wrong user';
            console.log(reason, 'no edit rights');
            return res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        msg+=error;
        res.render('discussionboard-replies-update',{result:null,msg});
    };
};
exports.postEditedReply = async (req,res) => {
const replyID=req.body.replyID;
    const reply = req.body.reply;
    const userID = req.session.user.userId;
    const admin = req.session.user.admin;
    const superAdmin = req.session.user.superAdmin;
    let msg=[]
    try {
        let result = await DiscussionBoardReply.findByReplyID(replyID);
        if (admin||superAdmin||(String(userID)==String(result.userID._id))){ //Remember to do type conversion
            if (validator.isMissingText(reply)||validator.isInvalidId(userID)){
            msg.push('message missing from notice'+ ' ' +(validator.isMissingText(reply))+`<br>`);
            msg.push('User ID Missing from notice'+ ' ' +(validator.isInvalidId(userID))+ `<br>`);
            let result = await DiscussionBoardReply.findByReplyID(replyID);
           
            return res.status(400).render('discussionboard-replies-update',{result,msg});
        };
        let ReplyPending = await DiscussionBoardReply.findByReplyID(replyID);
        
        if (reply===ReplyPending.reply){
            msg='reply is still the same as before';
            console.error(msg);
            let result = await DiscussionBoardReply.findByReplyID(replyID);
            return res.render('discussionboard-replies-update',{result,msg})
        }
        let result = await DiscussionBoardReply.UpdateReply(replyID,reply);
        
        if (result.modifiedCount===1){
            await Logs.createALog(req.session.user.userId, 'Edited a reply to a post', 'reply', ReplyPending.parentPostID);
            result = await DiscussionBoardReply.findByReplyID(replyID);
            res.render('discussionboard-replies-update',{result,msg:'edit successful'});
        
        } else {
        result = await DiscussionBoard.findByPostID(messageID);
        console.error('unknown edit error')
        res.render('discussionboard-replies-update',{result,userID,msg:'unknown edit error'});
        }
        } else {
            let reason = req.session.user.admin ? null : 'not admin';
            reason += req.session.user.superAdmin ? null : 'not Super admin';
            reason += String(userID)==String(postID)? null :'wrong user';
            console.log(reason, 'no edit rights');
            return res.redirect('/');
        }
        
        
    } catch (error) {
        console.error('error in editing post,',error);
        msg+=error;
        result = await DiscussionBoardReply.findByReplyID(replyID);
        res.render('discussionboard-update',{result,msg});
    };
};

exports.getToDeleteReply = async (req,res) =>{
    const userID=req.session.user.userId;
    const admin = req.session.user.admin;
    const superAdmin = req.session.user.superAdmin;
    let msg=''
    try {
        const replyID=req.params.id;
       
        
        let result = await DiscussionBoardReply.findByReplyID(replyID);
        
        if (!result){
            msg+='Reply not found';
            return res.status(404).render('discussionboard-replies-delete',{result:null,userID,msg});
        }
                if (admin||superAdmin||(String(userID)==String(result.userID._id))){ //Remember to do type conversion

        
        res.render('discussionboard-replies-delete',{result,userID,msg});
        } else {
            let reason = req.session.user.admin ? null : 'not admin ';
            reason += req.session.user.superAdmin ? null : 'not Super admin ';
            reason += String(userID)==String(result.userID._id)? null :'wrong user ';
            console.log(reason, 'no delete rights');
            return res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        msg+=error;
        res.render('discussionboard-replies-delete',{result:null,userID,msg});
    };
};
exports.deleteReply = async (req,res) => {
    const replyID=req.body.replyID;
    const userID = req.session.user.userId;
    try {
        let result = await DiscussionBoardReply.deleteReply(replyID);
        
    if (result.deletedCount===1){
        await Logs.createALog(req.session.user.userId, 'Deleted a reply to a post', 'reply', replyID, true);
        res.render('discussionboard-replies-deletesuccess');
    } else {
        console.error('unknown delete error')
        res.render('discussionboard-repiles-delete',{result,userID,msg:'unknown delete error'})
    };

    } catch (error) {
        console.error(error)
        msg=error
        res.render('discussionboard-replies-delete',{result,msg})
    };
    
    


};



