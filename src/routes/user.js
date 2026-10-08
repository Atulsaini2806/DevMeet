const express = require('express');
const userRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

//Get all the pending connection requests for a user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", USER_SAFE_DATA);

        const data = connectionRequests.filter(
    request => request.fromUserId
);

        res.json({
            message: "Data fetched successfully",
            data: data, 
        })

    } catch (err) {
            res.status(400).send("ERROR: " + err.message);
        }
    });


// userRouter.get("/user/connections", userAuth, async (req, res) => {
//     try{
//         const loggedInUser = req.user;

//         const connectionRequests = await ConnectionRequest.find({
//             $or: [
//                   { toUserId: loggedInUser._id, status: "accepted" },
//                   { fromUserId: loggedInUser._id, status: "accepted"}
//             ],
//         }).populate("fromUserId", USER_SAFE_DATA)
//         .populate("toUserId", USER_SAFE_DATA)

//         const data = connectionRequests.map((row) => {
//             if(row.toUserId._id.toString() === loggedInUser._id.toString()){
//                 return row.fromUserId;
//             }
//             return row.toUserId
//         });
        

//         res.json({data});
//     }catch(err){
//         res.status(400).send("ERROR: " + err.message);  
//     }
// });


userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {

        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" }
            ],
        })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);


        const data = connectionRequests.map((row) => {


            if (!row.fromUserId || !row.toUserId) {
                console.log("Missing user in connection request");
                return null;
            }

            if (row.toUserId._id.toString() === loggedInUser._id.toString()) {
                return row.fromUserId;
            }

            return row.toUserId;
        }).filter(Boolean);


        res.json({ data });

    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});


userRouter.get("/feed", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
         limit = limit>50 ? 50 : limit;

        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                  { toUserId: loggedInUser._id },
                  { fromUserId: loggedInUser._id}],
             }).select("fromUserId toUserId ")
               

           const hideUsersFromFeed = new Set();
              connectionRequests.forEach((req) => {
                hideUsersFromFeed.add(req.fromUserId.toString());
                hideUsersFromFeed.add(req.toUserId.toString());
              });
               
              const users = await User.find({
                $and:[
                { _id: { $nin: Array.from(hideUsersFromFeed) }},
                { _id: { $ne: loggedInUser._id }}
            ]
              }).select(USER_SAFE_DATA)
                .skip(skip)
                .limit(limit);


            res.send(users);

}catch(err){
    res.status(400).json({message:  err.message});  
}
});

module.exports = userRouter;




// userRouter.get("/user/connections", userAuth, async (req, res) => {
//     try {
//         console.log("1. Connections API called");
//         console.log("2. Logged in user:", req.user);

//         const loggedInUser = req.user;

//         const connectionRequests = await ConnectionRequest.find({
//             $or: [
//                 { toUserId: loggedInUser._id, status: "accepted" },
//                 { fromUserId: loggedInUser._id, status: "accepted" }
//             ],
//         })
//         .populate("fromUserId", USER_SAFE_DATA)
//         .populate("toUserId", USER_SAFE_DATA);

//         console.log("3. Connection requests:", connectionRequests);

//         const data = connectionRequests.map((row) => {

//             console.log("4. Current row:", row);

//             if (!row.fromUserId || !row.toUserId) {
//                 console.log("Missing user in connection request");
//                 return null;
//             }

//             if (row.toUserId._id.toString() === loggedInUser._id.toString()) {
//                 return row.fromUserId;
//             }

//             return row.toUserId;
//         }).filter(Boolean);

//         console.log("5. Final data:", data);

//         res.json({ data });

//     } catch (err) {
//         console.error("❌ CONNECTIONS API ERROR:", err);
//         res.status(400).send("ERROR: " + err.message);
//     }
// });
