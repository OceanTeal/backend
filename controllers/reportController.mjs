import { fetchOverview , fetchCompanyDetails, fetchMemberDetails, addActivity} from "../dbQueries/reportQueries.mjs"

export const getOverView = async(req,res)=>{
    try{
        const {startDate, endDate} = req.query;
        const report = await fetchOverview(startDate,endDate)
        res.status(200).json(report)
    }catch(err){
        res.status(500).json({error:"Failed to fetch overview report", message:err.message})
    }
}

export const getCompanyOverview = async(req,res)=>{
    const companyId = req.params.companyId
    if(!companyId){
        res.status(401).json({message: "Enter CompanyId"})
    }    
    try{
        const {startDate, endDate} = req.query;
        const report = await fetchCompanyDetails(companyId, startDate, endDate)
        res.status(200).json(report)
    }catch(err){
        res.status(500).json({error:"Failed to fetch overview report", message:err.message})
    }
}

export const getMemberOverview = async(req,res)=>{
    const memberId = req.params.memberId
    if(!memberId){
        res.status(401).json({message: "Enter MemberId"})
    }
    try{
        const {startDate, endDate} = req.query;
        const report = await fetchMemberDetails(memberId, startDate, endDate)
        res.status(200).json(report)
    }catch(err){
        res.status(500).json({error:"Failed to fetch overview report", message:err.message})
    }
}


export const createActivity = async(req,res)=>{
    try{
        const { memberId, date, type, hours, tags } = req.body;
        if (!memberId || !date || !type || !hours) {
            return res.status(400).json({ 
                error: 'Missing required fields: memberId, date, type, hours' 
            });
        }        
        if (hours <= 0) {
            return res.status(400).json({ 
                error: 'Hours must be greater than 0' 
            });
        }
        const activityData = {
            memberId,
            date,
            type,
            hours,
            tags: tags || []
        };
        
        const result = await addActivity(memberId, activityData);
        
        if (result.updated) {
            res.status(200).json({
                message: 'Activity updated - hours added to existing activity',
                activity: result
            });
        } else {
            res.status(201).json({
                message: 'New activity created successfully',
                activity: result
            });
        }
    }catch(err){
        if (err.message === 'Member not found') {
            res.status(404).json({ error: 'Member not found' });
        } else {
            res.status(500).json({error:"Failed to create activity", message:err.message})
        }
    }
}