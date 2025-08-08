import mongoose from "mongoose"
const memberSchema  = new mongoose.Schema({
    memberId: {type:String, unique:true, required:true},
    mName: {type:String, unique:true, required:true},
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }
})

const memberModel = mongoose.model("member", memberSchema)

export default memberModel
