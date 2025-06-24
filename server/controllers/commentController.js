import Comment from '../models/comment.js';

const addComment = async (req, res) => {
  try {
    const { station, commentText ,user} = req.body;
     

    const newComment = new Comment({
      user: user,
      station,
      commentText,
    });

    await newComment.save();

    res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
};

const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate('user station');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
};
const getCommentByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const comments = await Comment.find({ user: userId }).populate('station');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments for user', error });
  }
};

const getCommentByStationId = async (req, res) => {
  try {
    const stationId = req.params.stationId;
    const comments = await Comment.find({ station: stationId }).populate('user');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments for station', error });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const { commentText,userId } = req.body;
  

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.commentText = commentText;
    await comment.save();

    res.status(200).json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error });
    console.error('Error updating comment:', error);
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.body.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

   await comment.deleteOne(); 
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error });
    console.error('Error deleting comment:', error);
  }
};


export { addComment ,getAllComments ,getCommentByUserId, getCommentByStationId, updateComment, deleteComment };
