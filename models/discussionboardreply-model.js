const mongoose=require('mongoose');

const discussionboardReplyModel = new mongoose.Schema ({
    
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        },
    parentPostID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiscussionBoard'
    },
    reply:{
        type: String,
        required: [true,'No empty comments'],
        trim:true

    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    edited:{
        type:Boolean,
        default: false
    }

})

// Model creation
const DiscussionBoardReply= mongoose.model('discussionboardreply',discussionboardReplyModel,'discussionboardreply')

// Add new reply
DiscussionBoardReply.addNewReply= function(newReply) {
    return DiscussionBoardReply.create(newReply);
    
};

// get all reply for one post
DiscussionBoardReply.getAllReply =  function(parentPostID) {
    return DiscussionBoardReply.find({parentPostID:parentPostID}).populate('userID').sort({createdAt:1});
};

//get one reply
DiscussionBoardReply.findByReplyID=function(replyID){
    

    return DiscussionBoardReply.findOne({_id:replyID}).populate('userID');
};
// edit notice
DiscussionBoardReply.UpdateReply = function(replyID,reply) {
    // return DiscussionBoardReply.findByIdAndUpdate(postID,{message:message},{returnDocument:'after'}); // logging edits
    return DiscussionBoardReply.updateOne({_id:replyID},{reply:reply,edited:true})
};

// delete notice
DiscussionBoardReply.deleteReply = function(replyID){
    return DiscussionBoardReply.deleteOne({_id:replyID});
};
module.exports=DiscussionBoardReply;