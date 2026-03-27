const mongoose=require('mongoose');

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

    return NoticeBoard.findById(postID);
};
// edit notice
NoticeBoard.UpdateNotice = function(postID,userID,message) {
    NoticeBoard.findByIdAndUpdate({postID:postID},{userID:userID},{message:message});
    // return NoticeBoard.updateOne({postID:postID},{userID:userID},{message:message})
};
// delete notice
NoticeBoard.deleteNotice = function(messageID){
    return NoticeBoard.findByIdAndDelete(messageID)
};
module.exports=NoticeBoard;