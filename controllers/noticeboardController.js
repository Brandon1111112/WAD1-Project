const User=require('../models/user-model');
const validator = require("./utils/validation");
const auth = require('../middlewares/auth-middleware');
// get models (both)
const NoticeBoard=require('../models/noticeboard-model');

let generateOutputforNoticeboard= async function(userID){
let notices = await NoticeBoard.getAllNotice();
        let user = await User.findById(userID);
        const admin=User.admin;
        const superAdmin=User.superAdmin;

        // console.log(notices.length)
        let output=[];
        for (notice of notices){
            let userData=await User.findById(notice.userID);
            // let username=
            let content= {
                noticeID:notice._id,
                userID:userData._id,
                username:userData.name,
                message:notice.message
            };
            output.push(content);
            console.log(output);
        };
        return output;
};



exports.viewNotice = async (req,res) => {
    try {
        let msg=''
        let userID=req.session.user.userId;
        let output=await generateOutputforNoticeboard(userID);
        console.log(output);
        // let notices = await NoticeBoard.getAllNotice();
        let user = await User.findById(userID);
        
        res.render('noticeboard',{output,user,result:null,msg:''});
    } catch (error) {
        console.error(error);
        res.send(error, 'error in noticeboard, contact support with screenshot');
    };
    
};
exports.postNotice = async (req,res)=>{
    const {userID,message}=req.body;
    
    const newPost ={
        userID:userID,
        message:message
    };
    console.log(newPost)
    try {
        if (validator.isMissingText(message)||validator.isInvalidId(userID)){
        let msg='';
        msg+=('message missing from notice'+ ' ' +(validator.isMissingText(message))+`<br>`);
        msg+=('User ID Missing from notice'+ ' ' +(validator.isInvalidId(userID))+ `<br>`);
        let result ='fail' //if fail, no result is returned
        let user = await User.findById(userID);
        console.error(msg)

        let output= await generateOutputforNoticeboard(userID);
        return res.render('noticeboard',{output,user,result,msg});
        

    };
        let msg="";
        let result = await NoticeBoard.addNewPost(newPost);
        let notices = await NoticeBoard.getAllNotice();
        let user = await User.findById(userID);
        const admin=User.admin;
        const superAdmin=User.superAdmin;

        // console.log(notices.length)
        let output= await generateOutputforNoticeboard(userID);
        res.render('noticeboard',{output,user,result: result||null,msg});
    } catch (error) {
        console.error(error)
        let msg=error
        let result ='fail' //if fail, no result is returned
        let user = await User.findById(userID);
        console.error(msg)

        let output= await generateOutputforNoticeboard(userID);
        res.render('noticeboard',{output,user,result,msg});
    }
    
};
exports.getToEdit= async (req,res) => {
    let userID=req.session.user.userId;
    let msg=''
    try {
        const postID=req.params.id;
        console.log(postID);
        // console.log(postID.typeof);
        let result = await NoticeBoard.findByPostID(postID);
        if (!result){
            msg+='Post not found';
            return res.status(404).render('noticeboard-update',{result:null,msg});
        }
        if (req.session.admin||req.session.superAdmin||String(userID)==String(result.userID)){ //Remember to do type conversion
        
        console.log(result)
        res.render('noticeboard-update',{result,msg});
        } else {
            let reason = req.session.admin ? null : 'not admin';
            reason = req.session.superAdmin ? null : 'not Super admin';
            reason = String(userID)==String(postID)? reason :'wrong user';
            console.log(reason, 'no edit rights');
            return res.redirect('/home');
        }
    } catch (error) {
        console.error(error);
        msg+=error;
        res.render('noticeboard-update',{result:null,msg});
    };
};
exports.UpdateNotice= async (req,res) => {
    const messageID=req.body.messageID;
    const message = req.body.message;
    const userID = req.body.userID;
    let msg=''
    try {
        if (validator.isMissingText(message)||validator.isInvalidId(userID)){
            msg+=('message missing from notice'+ ' ' +(validator.isMissingText(message))+`<br>`);
            msg+=('User ID Missing from notice'+ ' ' +(validator.isInvalidId(userID))+ `<br>`);
            let result = await NoticeBoard.findByPostID(messageID);
            console.log(msg)
            return res.status(400).render('noticeboard-update',{result,msg});
        };
        
        let NoticeBoardPending = await NoticeBoard.findByPostID(messageID);
        console.log(NoticeBoardPending);
        if (message===NoticeBoardPending.message){
            msg='message is still the same as before';
            console.error(msg);
            let result = await NoticeBoard.findByPostID(messageID);
            return res.render('noticeboard-update',{result,msg})
        }
        let result = await NoticeBoard.UpdateNotice(messageID,userID,message);
        console.log(result);
        if (result.modifiedCount===1){
            result = await NoticeBoard.findByPostID(messageID);
            res.render('noticeboard-update',{result,msg:'edit successful'});
        
        } else {
        result = await NoticeBoard.findByPostID(messageID);
        console.error('unknown edit error')
        res.render('noticeboard-update',{result,msg:'unknown edit error'});
        }
    } catch (error) {
        console.error('error in editing post,',error);
        msg+=error;
        result = await NoticeBoard.findByPostID(messageID);
        res.render('noticeboard-update',{result,msg});
    };
    

};
exports.getToDelete= async (req,res) => {
    let userID=req.session.user.userId;
    let msg=''
    try {
        const postID=req.params.id;
        console.log(postID);
        // console.log(postID.typeof);
        let result = await NoticeBoard.findByPostID(postID);
        if (!result){
            msg+='Post not found';
            return res.status(404).render('noticeboard-delete',{result:null,msg});
        };
        if (req.session.admin||req.session.superAdmin||String(userID)==String(result.userID)){ //Remember to do type conversion
        await res.render('noticeboard-delete',{result,msg});
        } else {
            let reason = req.session.admin ? null : 'not admin';
            reason = req.session.superAdmin ? null : 'not Super admin';
            reason = String(userID)==String(postID)? reason :'wrong user';
            console.log(reason, 'no edit rights');
            return res.redirect('/home');
        }
    } catch (error) {
        console.error('error in deleting post,',error);
        msg+=error;
        try {
            result = (await NoticeBoard.findByPostID(messageID));
            res.render('noticeboard-delete',{result,msg});
        } catch (error) {
            result=null
            res.render('noticeboard-delete',{result,msg});
        };
    };
};
exports.deletePost = async (req,res) => {
    const messageID=req.body.messageID;
    const userID = req.body.userID;
    try {
        let result = await NoticeBoard.deleteNotice(messageID);
        console.log(result);
    if (result.deletedCount===1){
        res.render('noticeboard-deletesuccess');
    } else {
        console.error('unknown delete error')
        res.render('noticeboard-delete',{result,msg:'unknown delete error'})
    };

    } catch (error) {
        console.error(error)
        msg=error
        res.render('noticeboard-delete',{result,msg})
    };
    
    


};



