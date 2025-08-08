import { fetchOverview , fetchCompanyDetails, fetchMemberDetails, addActivity} from "../dbQueries/reportQueries.mjs"


const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

export const getOverView = async(req,res)=>{
    try{
        const {startDate, endDate} = req.query;
        if(startDate && !isValidDate(startDate)){
            return res.status(400).json({error: "Invalid startDate format. Use YYYY-MM-DD"});
        }
        if(endDate && !isValidDate(endDate)){
            return res.status(400).json({error: "Invalid endDate format. Use YYYY-MM-DD"});
        }
        const report = await fetchOverview(startDate,endDate)
        res.status(200).json(report)
    }catch(err){
        res.status(500).json({error:"Failed to fetch overview report", message:err.message})
    }
}

export const getCompanyOverview = async(req,res)=>{
    const companyId = req.params.companyId
    if(!companyId){
        return res.status(400).json({error: "CompanyId is required"})
    }    
    try{
        const{startDate, endDate} = req.query;       
        if(startDate && !isValidDate(startDate)){
            return res.status(400).json({error: "Invalid startDate format. Use YYYY-MM-DD"});
        }
        if(endDate && !isValidDate(endDate)){
            return res.status(400).json({error: "Invalid endDate format. Use YYYY-MM-DD"});
        }        
        const report = await fetchCompanyDetails(companyId, startDate, endDate)
        res.status(200).json(report)
    }catch(err){
        if(err.message === 'Company not found'){
            res.status(404).json({error: 'Company not found'});
        }else{
            res.status(500).json({error:"Failed to fetch company report", message:err.message})
        }
    }
}

export const getMemberOverview = async(req,res)=>{
    const memberId = req.params.memberId
    if(!memberId){
        return res.status(400).json({error: "MemberId is required"})
    }
    try{
        const {startDate, endDate} = req.query;              
        if(startDate && !isValidDate(startDate)){
            return res.status(400).json({error: "Invalid startDate format. Use YYYY-MM-DD"});
        }
        if(endDate && !isValidDate(endDate)){
            return res.status(400).json({error: "Invalid endDate format. Use YYYY-MM-DD"});
        }
        const report = await fetchMemberDetails(memberId, startDate, endDate)
        res.status(200).json(report)
    }catch(err){
        if(err.message === 'Member not found'){
            res.status(404).json({error: 'Member not found'});
        }else{
            res.status(500).json({error:"Failed to fetch member report", message:err.message})
        }
    }
}

export const createActivity = async (req, res) => {
    try{
        const {memberId, date, type, hours, tags} = req.body;
        if (!memberId || !date || !type || !hours){
            return res.status(400).json({error: 'Missing required fields: memberId, date, type, hours'});
        }
        if(hours <= 0){
            return res.status(400).json({error: 'Hours must be greater than 0'});
        }
        if(!isValidDate(date)){
            return res.status(400).json({error: 'Invalid date format. Use YYYY-MM-DD'});
        }
        const activityDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (activityDate > today) {
            return res.status(400).json({error: 'Activity date cannot be in the future'});
        }
        const activityData = {memberId, date, type, hours, tags: tags || []};
        const result = await addActivity(memberId, activityData);
        const {updated, ...cleanActivity} = result;
        if (updated){
            res.status(200).json({message: 'Activity updated - hours added to existing activity', activity: cleanActivity});
        }else{
            res.status(201).json({message: 'New activity created successfully', activity: cleanActivity});
        }
    } catch (err){
        if(err.message === 'Member not found') {
            res.status(404).json({error: 'Member not found'});
        }else{
            res.status(500).json({error: "Failed to create activity", message: err.message});
        }
    }
};
