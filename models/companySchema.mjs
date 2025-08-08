import mongoose from "mongoose"
const companySchema  = new mongoose.Schema({
    companyId: {type:String, unique:true, required:true},
    cName: {type:String, unique:true, required:true}
})

const companyModel = mongoose.model("company", companySchema)

export default companyModel

