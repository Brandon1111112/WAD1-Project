const mongoose=require('mongoose');
const DiscussionBoardReply = require('./discussionboardreply-model');
// const { options } = require('../routes/discussionBoardRoutes');

// messages schema
const discussionBoardModel = new mongoose.Schema({
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
const DiscussionBoard = mongoose.model('discussionBoard',discussionBoardModel,'discussionboard');

// Add new notice
DiscussionBoard.addNewPost= function(newPost) {
    return DiscussionBoard.create(newPost);
    
};

// get all notice
DiscussionBoard.getAllNotice =  function() {
    return DiscussionBoard.find().populate('userID');
};

//get one notice
DiscussionBoard.findByPostID=function(postID){

    return DiscussionBoard.findOne({_id:postID}).populate('userID');
};
// edit notice
DiscussionBoard.UpdateNotice = function(postID,message) {
    // return DiscussionBoard.findByIdAndUpdate(postID,{message:message},{returnDocument:'after'}); // logging edits
    return DiscussionBoard.updateOne({_id:postID},{message:message,edited:true})
};

// delete notice
DiscussionBoard.deleteNotice = function(postID){
    return DiscussionBoard.deleteOne({_id:postID});
};
module.exports=DiscussionBoard;