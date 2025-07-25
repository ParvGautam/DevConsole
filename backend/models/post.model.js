import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['code', 'image'],
    required: true
  },
  codeSnippet: String,
  language: {
    type: String,
    default: 'javascript'
  },
  imageUrl: String
}, { _id: false });

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
  },
  img: {
    type: String
  },
  images: [{
    type: String
  }],
  codeSnippet: {
    type: String
  },
  language: {
    type: String,
    default: 'javascript'
  },
  postType: {
    type: String,
    enum: ['text', 'code', 'image'],
    default: 'text'
  },
  blocks: [blockSchema],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      text: {
        type: String,
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }
  ]
}, { timestamps: true })

const Post = mongoose.model("Post", postSchema);

export default Post;