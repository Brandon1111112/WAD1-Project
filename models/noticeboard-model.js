const mongoose=require('mongoose');
// const { options } = require('../routes/noticeBoardRoutes');

// messages schema
const noticeBoardModel = new mongoose.Schema({
    userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true,'User needs an ID'],
    },
    message:{
        type: String,
        required:[true,'Please write something for post, please']
    }
});

// Model creation
const NoticeBoard = mongoose.model('noticeBoard',noticeBoardModel,'noticeboard');

// Add new notice
NoticeBoard.addNewPost= function(newPost) {
    return NoticeBoard.create(newPost);
    
};

// get all notice
NoticeBoard.getAllNotice =  function() {
    return NoticeBoard.find();
};

//get one notice
NoticeBoard.findByPostID=function(postID){

    return NoticeBoard.findOne({_id:postID});
};
// edit notice
NoticeBoard.UpdateNotice = function(postID,userID,message) {
    // return NoticeBoard.findByIdAndUpdate(postID,{message:message},{returnDocument:'after'}); // logging edits
    return NoticeBoard.updateOne({_id:postID},{userID:userID,message:message})
};
// delete notice
NoticeBoard.deleteNotice = function(postID){
    return NoticeBoard.deleteOne({_id:postID});
};
module.exports=NoticeBoard;