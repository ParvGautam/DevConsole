import express from "express"
import { protectRoute } from "../middleware.js/protectRoute.js";
import {  followFollowingPage, followPage, followUnfollowUser, getSuggestedUsers, getUserProfile, searchUser, updateUser } from "../controllers/user.controller.js";

const router= express.Router();

router.get("/profile/:username",protectRoute, getUserProfile)
router.get("/suggested",protectRoute, getSuggestedUsers)
router.get("/followPage",protectRoute, followPage)
router.get("/followFollowing/:username/:type", protectRoute, followFollowingPage);
router.post("/follow/:id",protectRoute, followUnfollowUser)
router.post("/update", protectRoute, updateUser) 
router.get("/search/:query", protectRoute, searchUser);


export default router;