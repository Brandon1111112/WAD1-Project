const mongoose=require('mongoose');

const noticeboardReplyModel = new mongoose.Schema ({
    
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        },
    parentPostID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NoticeBoard'
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
const NoticeBoardReply= mongoose.model('noticeboardreply',noticeboardReplyModel,'noticeboardreply')

// Add new reply
NoticeBoardReply.addNewReply= function(newReply) {
    return NoticeBoardReply.create(newReply);
    
};

// get all reply for one post
NoticeBoardReply.getAllReply =  function(parentPostID) {
    return NoticeBoardReply.find({parentPostID:parentPostID}).populate('userID').sort({createdAt:1});
};

//get one reply
NoticeBoardReply.findByReplyID=function(replyID){
    

    return NoticeBoardReply.findOne({_id:replyID}).populate('userID');
};
// edit notice
NoticeBoardReply.UpdateReply = function(replyID,reply) {
    // return NoticeBoardReply.findByIdAndUpdate(postID,{message:message},{returnDocument:'after'}); // logging edits
    return NoticeBoardReply.updateOne({_id:replyID},{reply:reply,edited:true})
};

// delete notice
NoticeBoardReply.deleteReply = function(replyID){
    return NoticeBoardReply.deleteOne({_id:replyID});
};
module.exports=NoticeBoardReply;