const User=require('../models/user-model');
const Logs = require('../models/logs-model');
const validator = require("./utils/validation");
const auth = require('../middlewares/auth-middleware');
// get models (both)
const NoticeBoard=require('../models/noticeboard-model');
const NoticeBoardReply=require('../models/noticeboardreply-model')
const generateRepliesToPost = async function (postID) {
    let output =[];
    const replies= await NoticeBoardReply.getAllReply(postID);
    console.log(replies);
    for (const reply of replies){
        try {
            // let userData=await User.findById(reply.userID);
            // console.log(userData)
            let content= {
                replyID:reply._id,
                userID:reply.userID._id,
                username:reply.userID.name,
                reply:reply.reply,
                timeCreated:reply.createdAt,
                edited:reply.edited
            };
            // console.log(content);
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
        // let content= {
                
        //         userID:'Account not found',
        //         username:userData.name,
        //         message:notice.message,
        //         timeCreated:notice.createdAt
        //     };
        // output.push(reply)
    };
    return output
}


exports.viewReplesToPost = async (req,res)=>{
const userID=req.session.user.userId;
const admin = req.session.user.admin;
const superAdmin = req.session.user.superAdmin;
const postID=req.params.id; //get post ID from url
// console.log(postID)
try {
    output= await generateRepliesToPost(postID)
    console.log(output)
    
    res.render('noticeboard-replies',{output,userID,postID,admin,superAdmin,msg:''});
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
                // let user = await User.findById(userID);
                console.error(msg)
                let output= await generateRepliesToPost(postID);
                
                return res.render('noticeboard-replies',{output,userID,postID,admin,superAdmin,msg});
            };
        const newReply = await NoticeBoardReply.addNewReply(reply);
        output= await generateRepliesToPost(postID)
        let msg='Reply Successful'
        await Logs.createALog(req.session.user.userId, 'Added a reply to a post', 'post', newReply._id, 'NoticeBoard');
    res.render('noticeboard-replies',{output,userID,postID,admin,superAdmin,msg:''});
        
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
       
        console.log(replyID);
        // console.log(postID.typeof);
        let result = await NoticeBoardReply.findByReplyID(replyID);

        if (!result){
            msg+='Reply not found';
            return res.status(404).render('noticeboard-replies-update',{result:null,msg});
        }
        if (admin||superAdmin||(String(userID)==String(result.userID._id))){ //Remember to do type conversion
        
        res.render('noticeboard-replies-update',{result,userID,msg});
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
        res.render('noticeboard-replies-update',{result:null,msg});
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
        let result = await NoticeBoardReply.findByReplyID(replyID);
        if (admin||superAdmin||(String(userID)==String(result.userID._id))){ //Remember to do type conversion
            if (validator.isMissingText(reply)||validator.isInvalidId(userID)){
            msg.push('message missing from notice'+ ' ' +(validator.isMissingText(reply))+`<br>`);
            msg.push('User ID Missing from notice'+ ' ' +(validator.isInvalidId(userID))+ `<br>`);
            let result = await NoticeBoardReply.findByReplyID(replyID);
           
            return res.status(400).render('noticeboard-replies-update',{result,msg});
        };
        let ReplyPending = await NoticeBoardReply.findByReplyID(replyID);
        console.log(ReplyPending);
        if (reply===ReplyPending.reply){
            msg='reply is still the same as before';
            console.error(msg);
            let result = await NoticeBoardReply.findByReplyID(replyID);
            return res.render('noticeboard-replies-update',{result,msg})
        }
        let result = await NoticeBoardReply.UpdateReply(replyID,reply);
        console.log(result);
        if (result.modifiedCount===1){
            await Logs.createALog(req.session.user.userId, 'Edited a reply to a post', 'post', result._id, 'NoticeBoard');
            result = await NoticeBoardReply.findByReplyID(replyID);
            res.render('noticeboard-replies-update',{result,msg:'edit successful'});
        
        } else {
        result = await NoticeBoard.findByPostID(messageID);
        console.error('unknown edit error')
        res.render('noticeboard-replies-update',{result,userID,msg:'unknown edit error'});
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
        result = await NoticeBoardReply.findByReplyID(replyID);
        res.render('noticeboard-update',{result,msg});
    };
};

exports.getToDeleteReply = async (req,res) =>{
    const userID=req.session.user.userId;
    const admin = req.session.user.admin;
    const superAdmin = req.session.user.superAdmin;
    let msg=''
    try {
        const replyID=req.params.id;
       
        
        // console.log(postID.typeof);
        let result = await NoticeBoardReply.findByReplyID(replyID);
        
        if (!result){
            msg+='Reply not found';
            return res.status(404).render('noticeboard-replies-delete',{result:null,userID,msg});
        }
                if (admin||superAdmin||(String(userID)==String(result.userID._id))){ //Remember to do type conversion

        
        console.log(result)
        res.render('noticeboard-replies-delete',{result,userID,msg});
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
        res.render('noticeboard-replies-delete',{result:null,userID,msg});
    };
};
exports.deleteReply = async (req,res) => {
    const replyID=req.body.replyID;
    const userID = req.session.user.userId;
    try {
        let result = await NoticeBoardReply.deleteReply(replyID);
        
    if (result.deletedCount===1){
        await Logs.createALog(req.session.user.userId, 'Deleted a reply to a post', 'post', replyID, 'NoticeBoard');
        res.render('noticeboard-replies-deletesuccess');
    } else {
        console.error('unknown delete error')
        res.render('noticeboard-repiles-delete',{result,userID,msg:'unknown delete error'})
    };

    } catch (error) {
        console.error(error)
        msg=error
        res.render('noticeboard-replies-delete',{result,msg})
    };
    
    


};



