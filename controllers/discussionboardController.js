const User=require('../models/user-model');
const Logs = require('../models/logs-model');
const validator = require("./utils/validation");
const auth = require('../middlewares/auth-middleware');
// get models (both)
const DiscussionBoard=require('../models/discussionboard-model');

let generateOutputforDiscussionboard= async function(){ // function to get output
let notices = await DiscussionBoard.getAllNotice();
        const admin=User.admin;
        const superAdmin=User.superAdmin;

        let output=[];
        for (const notice of notices){
            try {
            let content= {
                noticeID:notice._id,
                userID:notice.userID._id ? notice.userID._id:"Account Not Found",
                username:notice.userID.name? notice.userID.name:'Account Not Found',
                message:notice.message,
                timeCreated:notice.createdAt,
                edited:notice.edited
            };
            output.push(content);
            
            } catch (error) {
                console.error(error);
                let content= {
                noticeID:notice._id,
                userID:"Account Not Found",
                username:'Account Not Found',
                message:notice.message,
                timeCreated:notice.createdAt,
                edited:notice.edited
            };
            output.push(content);
            }
            
        };
        return output;
};



exports.viewNotice = async (req,res) => {
    try {
        let msg=''
        let user=req.session.user;

        let output=await generateOutputforDiscussionboard();
        
        res.render('discussionboard',{output,user,result:null,msg:[]});
    } catch (error) {
        console.error(error);
        res.send(error, 'error in discussionboard, contact support with screenshot');
    };
    
};
exports.postNotice = async (req,res)=>{
    const message=req.body.message;
    const userID=req.session.user.userId;
    const newPost ={
        userID:userID,
        message:message
    };
    try {
        if (validator.isMissingText(message)||validator.isInvalidId(userID)){
        let msg=[];
        msg.push('message missing from notice'+ ' ' +(validator.isMissingText(message)));
        msg.push('User ID Missing from notice'+ ' ' +(validator.isInvalidId(userID)));
        let result ='fail' //if fail, no result is returned
        let user = req.session.user;
        console.error(msg)

        let output= await generateOutputforDiscussionboard();
        return res.render('discussionboard',{output,user,result,msg});
        

    };
        let msg="";
        let result = await DiscussionBoard.addNewPost(newPost);
        let notices = await DiscussionBoard.getAllNotice();
        let user = req.session.user;
        await Logs.createALog(req.session.user.userId, 'Added a new post', 'post', result._id);
        let output= await generateOutputforDiscussionboard();
        res.render('discussionboard',{output,user,result: result||null,msg});
    } catch (error) {
        console.error(error)
        let msg=error
        let result ='fail' //if fail, no result is returned
        let user = req.session.user
        console.error(msg)

        let output= await generateOutputforDiscussionboard();
        res.render('discussionboard',{output,user,result,msg});
    }
    
};
exports.getToEdit= async (req,res) => { //get specific post to edit
    let userID=req.session.user.userId;
    let msg=''
    try {
        const postID=req.params.id;
        const admin=req.session.user.admin;
        const superAdmin=req.session.user.superAdmin;

        let result = await DiscussionBoard.findByPostID(postID);
        if (!result){
            msg=[];
            msg.push('Post not found');
            console.log(msg);
            return res.status(404).render('discussionboard-update',{result:null,msg});
        }

        if (admin||superAdmin||(String(req.session.user.userId)==String(result.userID._id))){ //Remember to do type conversion
        
        res.render('discussionboard-update',{result,msg});
        } else {
            let reason = req.session.user.admin ? null : 'not admin ';
            reason += req.session.user.superAdmin ? null : 'not Super Admin ';
            reason += String(userID)==String(postID)? null :'wrong user';
            console.log(reason, 'no edit rights');
            return res.redirect('/'); // kick out people who force their way in
        }
    } catch (error) {
        console.error(error);
        msg=[];
        msg.push(error);
        res.render('discussionboard-update',{result:null,msg});
    };
};
exports.UpdateNotice= async (req,res) => {
    const messageID=req.params.id;
    const message = req.body.message;
    const userID = req.session.user.userId;
    let msg=''
    try {
        if (validator.isMissingText(message)||validator.isInvalidId(userID)){ //no blank notices allowed
            msg=[];
            msg.push('message missing from notice'+ ' ' +(validator.isMissingText(message)));
            msg.push('User ID Missing from notice'+ ' ' +(validator.isInvalidId(userID)));
            let result = await DiscussionBoard.findByPostID(messageID);
            
            return res.status(400).render('discussionboard-update',{result,msg});
        };
        
        let DiscussionBoardPending = await DiscussionBoard.findByPostID(messageID);
        
        if (message===DiscussionBoardPending.message){
            msg=['message is still the same as before'];
            console.error(msg);
            let result = await DiscussionBoard.findByPostID(messageID);
            return res.render('discussionboard-update',{result,msg})
        }
        let result = await DiscussionBoard.UpdateNotice(messageID,message);
        
        if (result.modifiedCount===1){
            result = await DiscussionBoard.findByPostID(messageID);
            await Logs.createALog(req.session.user.userId, 'Updated a post', 'post', result._id);
            res.render('discussionboard-update',{result,msg:'edit successful'});
        
        } else {
        result = await DiscussionBoard.findByPostID(messageID);
        console.error('unknown edit error')
        res.render('discussionboard-update',{result,msg:'unknown edit error'});
        }
    } catch (error) {
        console.error('error in editing post,',error);
        msg.push(error);
        result = await DiscussionBoard.findByPostID(messageID);
        res.render('discussionboard-update',{result,msg});
    };
    

};
exports.getToDelete= async (req,res) => {
    const userID=req.session.user.userId;
    const admin = req.session.user.admin;
    const superAdmin = req.session.user.superAdmin;
    let msg=''
    try {
        const postID=req.params.id;
        let result = await DiscussionBoard.findByPostID(postID);
        if (!result){
            msg+='Post not found';
            return res.status(404).render('discussionboard-delete',{result:null,msg});
        };
        if (admin||superAdmin||String(userID)==String(result.userID._id)){ //Remember to do type conversion
        await res.render('discussionboard-delete',{result,msg});
        } else {
            let reason = req.session.user.admin ? null : 'not admin';
            reason += req.session.user.superAdmin ? null : 'not Super admin';
            reason += String(userID)==String(result.userID._id)? null :'wrong user';
            console.log(reason, 'no edit rights');
            return res.redirect('/');
        }
    } catch (error) {
        console.error('error in deleting post,',error);
        msg+=error;
        try {
            result = (await DiscussionBoard.findByPostID(messageID));
            res.render('discussionboard-delete',{result,msg});
        } catch (error) {
            result=null
            res.render('discussionboard-delete',{result,msg});
        };
    };
};
exports.deletePost = async (req,res) => {
    const messageID=req.body.messageID;
    const userID = req.body.userID;
    try {
        let result = await DiscussionBoard.deleteNotice(messageID);
    if (result.deletedCount===1){
        await Logs.createALog(req.session.user.userId, 'Deleted a post', 'post', messageID, true);
        res.render('discussionboard-deletesuccess');
    } else {
        console.error('unknown delete error')
        res.render('discussionboard-delete',{result,msg:'unknown delete error'})
    };

    } catch (error) {
        console.error(error)
        msg=error
        res.render('discussionboard-delete',{result,msg})
    };
    
    


};



