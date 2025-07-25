import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from "cloudinary"

export const createPost = async (req, res) => {
	try {
		const { text, images, codeSnippet, language, postType, blocks } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		// If blocks are provided, handle mixed content post
		let processedBlocks = [];
		if (Array.isArray(blocks) && blocks.length > 0) {
			for (const block of blocks) {
				if (block.type === "image" && block.imageData) {
					const uploadedResponse = await cloudinary.uploader.upload(block.imageData);
					processedBlocks.push({
						type: "image",
						imageUrl: uploadedResponse.secure_url
					});
				} else if (block.type === "code") {
					processedBlocks.push({
						type: "code",
						codeSnippet: block.codeSnippet,
						language: block.language || "javascript"
					});
				}
			}
		}

		// Validate post content based on type (legacy)
		if (!blocks && postType === "text" && !text) {
			return res.status(400).json({ error: "Text post must have content" });
		}
		if (!blocks && postType === "code" && !codeSnippet) {
			return res.status(400).json({ error: "Code post must have code snippet" });
		}
		if (!blocks && postType === "image" && (!images || images.length === 0)) {
			return res.status(400).json({ error: "Image post must have at least one image" });
		}

		// Handle single image upload (backward compatibility)
		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		// Handle multiple images upload (legacy)
		let uploadedImages = [];
		if (images && images.length > 0) {
			for (const imageData of images) {
				const uploadedResponse = await cloudinary.uploader.upload(imageData);
				uploadedImages.push(uploadedResponse.secure_url);
			}
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
			images: uploadedImages,
			codeSnippet,
			language: language || "javascript",
			postType: postType || "text",
			blocks: processedBlocks.length > 0 ? processedBlocks : undefined
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deltePost=async (req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(!post) {return res.status(404).json({message: "Post not found"})}

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(404).json({error: "You are not authorized to delete this post"})
        }

        // Delete single image
        if(post.img){
            const imgId=post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        // Delete multiple images
        if(post.images && post.images.length > 0){
            for(const imageUrl of post.images){
                const imgId=imageUrl.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(imgId);
            }
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({message: "Post deleted successfully"})
    }
    catch(error){
        res.status(500).json({error:error.message})
        console.log("Error in deletePost controller:",error)
    }
}

export const commentOnPost= async(req,res)=>{
    try{
         const {text}=req.body;
         const postId=req.params.id;
         const userId=req.user._id;

         if(!text){
            return res.status(400).json({error:"Text field is required"});
         }
         const post= await Post.findById(postId);

         if(!post){
            return res.status(404).json({error:"Post not found"});
         }

         const comment={user:userId, text}
         post.comments.push(comment);
         await post.save();

         res.status(200).json(post);
    }
    catch(error){
        res.status(500).json({error:error.message})
        console.log("Error in commentOnPost controller:",error)
    }
}

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const getAllPosts=async(req,res)=>{
    try{
        const posts= await Post.find().sort({createdAt: -1}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        });

        if(posts.length === 0){
            return res.status(200).json([])
        }

        res.status(200).json(posts);
    }
    catch(error){
        console.log("Error in getAllPosts controller:",error)
        res.status(500).json({error:error.message})
    }
}

export const getLikedPosts=async(req,res)=>{
    const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export const getFollowingPosts =async(req,res)=>{
    try{
        const userId= req.user._id
        const user= await User.findById(userId);
        if(!user) {
            return res.status(404).json({message: "User not found"})
        }
        const following= user.following;
        
        const feedPosts=await Post.find({user:{$in: following}})
        .sort({createdAt: -1})
        .populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        })

        res.status(200).json(feedPosts) 
    }
    catch(error){
        console.log("Error in getFollowingPosts controller:",error)
        res.status(500).json({error:error.message})
    }
}

export const getUserPosts = async (req, res) =>{
     try{
        const{username}=req.params;

        const user=await User.findOne({username});
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        const posts=await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        })

        res.status(200).json(posts)
     }
     catch(error){
         console.log("Error in getUserPosts controller:",error)
         res.status(500).json({error:error.message})
     }
}