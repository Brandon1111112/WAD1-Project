const User=require('../models/user-model');
const validator = require("./utils/validation");
const auth = require('../middlewares/auth-middleware');
// get models (both)
const NoticeBoard=require('../models/noticeboard-model');

let generateOutputforNoticeboard= async function(){
let notices = await NoticeBoard.getAllNotice();
        // let user = await User.findById(userID);
        const admin=User.admin;
        const superAdmin=User.superAdmin;

        console.log(notices)
        let output=[];
        for (const notice of notices){
            try {
                // let userData=await User.findById(notice.userID);
            // let username=
            let content= {
                noticeID:notice._id,
                userID:notice.userID._id ? notice.userID._id:"Account Not Found",
                username:notice.userID.name? notice.userID.name:'Account Not Found',
                message:notice.message,
                timeCreated:notice.createdAt,
                edited:notice.edited
            };
            output.push(content);
            console.log(output);
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
            console.log(output);
            }
            // let userData=await User.findById(notice.userID);
            // // let username=
            // let content= {
            //     noticeID:notice._id,
            //     userID:userData._id? userData._id",
            //     username:userData.name? userData.name,
            //     message:notice.message,
            //     timeCreated:notice.createdAt
            // };
            // output.push(content);
            // console.log(output);
        };
        return output;
};



exports.viewNotice = async (req,res) => {
    try {
        let msg=''
        let user=req.session.user;

        let output=await generateOutputforNoticeboard();
        console.log(output);
        // let notices = await NoticeBoard.getAllNotice();
        // let user = await User.findById(userID);
        
        res.render('noticeboard',{output,user,result:null,msg:[]});
    } catch (error) {
        console.error(error);
        res.send(error, 'error in noticeboard, contact support with screenshot');
    };
    
};
exports.postNotice = async (req,res)=>{
    const message=req.body.message;
    const userID=req.session.user.userId;
    const newPost ={
        userID:userID,
        message:message
    };
    console.log(newPost)
    try {
        if (validator.isMissingText(message)||validator.isInvalidId(userID)){
        let msg=[];
        msg.push('message missing from notice'+ ' ' +(validator.isMissingText(message)));
        msg.push('User ID Missing from notice'+ ' ' +(validator.isInvalidId(userID)));
        let result ='fail' //if fail, no result is returned
        let user = req.session.user;
        console.error(msg)

        let output= await generateOutputforNoticeboard();
        return res.render('noticeboard',{output,user,result,msg});
        

    };
        let msg="";
        let result = await NoticeBoard.addNewPost(newPost);
        let notices = await NoticeBoard.getAllNotice();
        let user = req.session.user;
        // const admin=req.session.admin
        // const superAdmin=req.session.superAdmin;

        // console.log(notices.length)
        let output= await generateOutputforNoticeboard();
        res.render('noticeboard',{output,user,result: result||null,msg});
    } catch (error) {
        console.error(error)
        let msg=error
        let result ='fail' //if fail, no result is returned
        let user = req.session.user
        console.error(msg)

        let output= await generateOutputforNoticeboard();
        res.render('noticeboard',{output,user,result,msg});
    }
    
};
exports.getToEdit= async (req,res) => {
    let userID=req.session.user.userId;
    let msg=''
    try {
        const postID=req.params.id;
        const admin=req.session.user.admin;
        const superAdmin=req.session.user.superAdmin;
        console.log(postID);
        // console.log(postID.typeof);
        let result = await NoticeBoard.findByPostID(postID);
        if (!result){
            msg=[];
            msg.push('Post not found');
            console.log(msg);
            return res.status(404).render('noticeboard-update',{result:null,msg});
        }
        console.log(admin);
        console.log(superAdmin);
        if (admin||superAdmin||(String(req.session.user.userId)==String(result.userID._id))){ //Remember to do type conversion, population
        
        console.log(result)
        res.render('noticeboard-update',{result,msg});
        } else {
            let reason = req.session.user.admin ? null : 'not admin ';
            reason += req.session.user.superAdmin ? null : 'not Super Admin ';
            reason += String(userID)==String(postID)? null :'wrong user';
            console.log(reason, 'no edit rights');
            return res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        msg.push(error);
        res.render('noticeboard-update',{result:null,msg});
    };
};
exports.UpdateNotice= async (req,res) => {
    const messageID=req.params.id;
    const message = req.body.message;
    const userID = req.session.user.userId;
    let msg=''
    try {
        if (validator.isMissingText(message)||validator.isInvalidId(userID)){
            msg=[];
            msg.push('message missing from notice'+ ' ' +(validator.isMissingText(message)));
            msg.push('User ID Missing from notice'+ ' ' +(validator.isInvalidId(userID)));
            let result = await NoticeBoard.findByPostID(messageID);
            console.log(msg)
            return res.status(400).render('noticeboard-update',{result,msg});
        };
        
        let NoticeBoardPending = await NoticeBoard.findByPostID(messageID);
        console.log(NoticeBoardPending);
        if (message===NoticeBoardPending.message){
            msg=['message is still the same as before'];
            console.error(msg);
            let result = await NoticeBoard.findByPostID(messageID);
            return res.render('noticeboard-update',{result,msg})
        }
        let result = await NoticeBoard.UpdateNotice(messageID,message);
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
        msg.push(error);
        result = await NoticeBoard.findByPostID(messageID);
        res.render('noticeboard-update',{result,msg});
    };
    

};
exports.getToDelete= async (req,res) => {
    const userID=req.session.user.userId;
    const admin = req.session.user.admin;
    const superAdmin = req.session.user.superAdmin;
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
        if (admin||superAdmin||String(userID)==String(result.userID._id)){ //Remember to do type conversion
        await res.render('noticeboard-delete',{result,msg});
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



