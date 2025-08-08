import mongoose from "mongoose"

const teamSchema  = new mongoose.Schema({
    teamId: {type:String, unique:true, required:true},
    tName: {type:String, unique:true, required:true},
    company: {type: mongoose.Schema.Types.ObjectId, ref: "companies", required:true}
})

const teamModel = mongoose.model("team", teamSchema)

export default teamModel