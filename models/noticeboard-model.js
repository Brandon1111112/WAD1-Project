const mongoose=require('mongoose');
const NoticeBoardReply = require('./noticeboardreply-model');
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
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    edited:{
        type: Boolean,
        default: false
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
    return NoticeBoard.find().populate('userID');
};

//get one notice
NoticeBoard.findByPostID=function(postID){

    return NoticeBoard.findOne({_id:postID}).populate('userID');
};
// edit notice
NoticeBoard.UpdateNotice = function(postID,message) {
    // return NoticeBoard.findByIdAndUpdate(postID,{message:message},{returnDocument:'after'}); // logging edits
    return NoticeBoard.updateOne({_id:postID},{message:message,edited:true})
};

// delete notice
NoticeBoard.deleteNotice = function(postID){
    return NoticeBoard.deleteOne({_id:postID});
};
module.exports=NoticeBoard;