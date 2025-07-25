import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import{v2 as cloudinary} from "cloudinary";
import validator from 'validator';

export const getUserProfile = async (req,res)=>{
    const {username}= req.params;

    try{
        const user = await User.findOne({username}).select("-password")
        if(!user)
        {
            return res.status(404).json({error: "User not found"})
        }
        res.status(200).json(user);
    }
    catch(error)
    {
        console.log("Error in getUserProfile", error.message);
        res.status(500).json({error:error.message});
    }
}

export const followUnfollowUser =async (req,res)=>{
    try{
         const {id}=req.params;
         const userToModify=await User.findById(id)
         const currUser=await User.findById(req.user._id);

         if(id=== req.user._id.toString()){
            return res.status(400).json({error:"You can't follow/unfollow yourself"});
         }

         if(!userToModify || !currUser){
            return res.status(404).json({error: "User not found"})
         }

         const isFollowing=currUser.following.includes(id);

         if(isFollowing){
            //Unfollow the user
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}});

            
            res.status(200).json({message:"User Unfollowed successfully"});
         }
         else{
            //Follow the user
            await User.findByIdAndUpdate(id, {$push:{followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push:{following: id}});
            //Send notification to the user
            const newNotification=new Notification({
                type:"follow",
                from:req.user._id,
                to:userToModify._id
            })

            await newNotification.save();

            
            res.status(200).json({message:"User Followed successfully"});
         }
    }
    catch(error){
        console.log("Error in followUnfollowUser", error.message);
        res.status(500).json({error:error.message});
    }
}

export const getSuggestedUsers = async (req, res) =>{
    try{
        const userId= req.user._id
        const userFollowedByMe=await User.findById(userId).select("following")

        const users= await User.aggregate([
            {
                $match:{                      //$match-> it match the user whose id!=userId
                    _id:{$ne:userId}
                }
            },
            {
                $sample:{size:10}             //$sample-> it select the random user of size 10
            }
        ])

        const filterUsers= users.filter(user=>!userFollowedByMe.following.includes(user._id))
        const suggestedUsers=filterUsers.slice(0,10)

        suggestedUsers.forEach(user=>user.password=null)
        
        res.status(200).json(suggestedUsers)

    }catch(error){
        console.log("Error in getSuggestedUsers", error.message);
        res.status(500).json({error:error.message});
    }
}

export const followPage=async (req,res)=>{
    try{
        const userId= req.user._id
        const userFollowedByMe=await User.findById(userId).select("following")

        const users= await User.aggregate([
            {
                $match:{                      //$match-> it match the user whose id!=userId
                    _id:{$ne:userId}
                }
            },
        ])

        const filterUsers= users.filter(user=>!userFollowedByMe.following.includes(user._id))

        filterUsers.forEach(user=>user.password=null)
        
        res.status(200).json(filterUsers)

    }catch(error){
        console.log("Error in getSuggestedUsers", error.message);
        res.status(500).json({error:error.message});
    }
}

export const followFollowingPage = async (req, res) => {
    try {
        const { username, type } = req.params;  // Capture 'username' and 'type' from URL params
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the user by their username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let users;
        if (type === "following") {
            users = await User.findById(user)
                .select("following")
                .populate("following", "-password");
        } else if (type === "followers") {
            users = await User.findById(user)
                .select("followers")
                .populate("followers", "-password");
        } else {
            return res.status(400).json({ error: "Invalid type. Use 'following' or 'followers'" });
        }

        if (!users) {
            return res.status(404).json({ error: "No users found" });
        }

        res.status(200).json(users[type]);  // Return the appropriate list of users
    } catch (error) {
        console.log("Error in followFollowingPage:", error.message);
        res.status(500).json({ error: error.message });
    }
};


export const updateUser= async (req,res)=>{
    const{fullName, email,username,currPassword,newPassword,bio,link}=req.body;
    let{profileImg, coverImg}=req.body;

    const userId=req.user._id;

    try{
        let user= await User.findById(userId);
        if(!user) return res.status(404).json({message: "User not found"});

        if((!newPassword && currPassword) || (!currPassword && newPassword)){
            return res.status(400).json({message: "Current password and new password are required"});
        }

        if(currPassword && newPassword){
            const isMatch=await bcrypt.compare(currPassword, user.password);
            if(!isMatch) return res.status(401).json({message: "Incorrect current password"});
            if(!validator.isStrongPassword(newPassword)){
                return res.status(400).json({message: "Enter a strong new password"});
            }
            if(currPassword === newPassword){
                return res.status(400).json({message: "Current password and new password cannot be same"});
            }
            const salt = await bcrypt.genSalt(10);
            user.password= await bcrypt.hash(newPassword, salt);
        }
        
        
            if(email && !validator.isEmail(email)){
                return res.status(400).json({message: "Enter a valid email address"});
            }
        
        

        if(profileImg){
            if(user.profileImg){
                const publicId = user.profileImg.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedResponse=await cloudinary.uploader.upload(profileImg)
            profileImg=uploadedResponse.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                const publicId = user.coverImg.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }

            const uploadedResponse=await cloudinary.uploader.upload(coverImg);
            coverImg=uploadedResponse.secure_url;
        }

        user.fullName= fullName || user.fullName;
        user.email=email || user.email;
        user.username=username || user.username;
        user.bio= bio || user.bio;
        user.link=link || user.link;
        user.profileImg=profileImg || user.profileImg;
        user.coverImg=coverImg || user.coverImg;

        user= await user.save();

        //password should be null in response
        user.password=null;

        return res.status(200).json(user)
    }catch(error){
        console.log("Error in updateUser", error.message);
        res.status(500).json({error:error.message});
    }
}

export const searchUser= async(req, res)=> {
    const query = req.params.query;
    if (!query || query.trim() === "") {
        return res.status(400).json({ message: "Search query is required" });
    }
    try {
       
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } }, 
                { fullName: { $regex: query, $options: "i" } }  
            ],
        });

        res.json(users); // Return the matching users
    } catch (error) {
        res.status(500).json({ error: "Failed to search users" });
    }
}