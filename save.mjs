import companyModel from "../models/companySchema.mjs"
import teamModel from "../models/teamSchema.mjs"
import memberModel from "../models/memberSchema.mjs"
import activityModel from "../models/activitySchema.mjs"

const aggregateActivitiesByType = (activities) => {
    const activityMap = activities.reduce((acc, act) => {
        acc[act.type] = (acc[act.type] || 0) + act.hours
        return acc
    }, {})
    
    return Object.entries(activityMap)
        .map(([type, totalHours]) => ({type, totalHours}))
        .sort((a, b) => b.totalHours - a.totalHours)
}

const getUniqueTags = (activities) => {
    return [...new Set(
        activities.flatMap(act => act.tags || [])
    )]
}

export const fetchOverview = async (startDate, endDate) => {
    const [totalCompanies, totalTeams, totalMembers, totalActivities, activities] = await Promise.all([
        companyModel.countDocuments(),
        teamModel.countDocuments(),
        memberModel.countDocuments(),
        activityModel.countDocuments(),
        activityModel.find({}, 'type hours date')
    ])

    const filteredActivities = activities.filter(activity => {
        if (!startDate && !endDate) return true
        
        const activityDate = activity.date.toISOString().split('T')[0]
        
        if (startDate && endDate) {
            return activityDate >= startDate && activityDate <= endDate
        } else if (startDate) {
            return activityDate >= startDate
        } else if (endDate) {
            return activityDate <= endDate
        }
        return true
    })

    const totalHours = filteredActivities.reduce((sum, a) => sum + a.hours, 0)
    const topActivityTypes = aggregateActivitiesByType(filteredActivities)
    
    return {
        totalCompanies,
        totalTeams,
        totalMembers,
        totalActivities: filteredActivities.length,
        totalHours,
        topActivityTypes,
    }
}

export const fetchCompanyDetails = async (cId, startDate, endDate) => {
    const company = await companyModel.findOne({ companyId: cId })
    if (!company) {
        throw new Error('Company not found')
    }
    
    const teams = await teamModel.find({ company: company._id })
    
    const teamSummaries = await Promise.all(teams.map(async (team) => {
        const members = await memberModel.find({ team: team._id })
        const memberIds = members.map(m => m._id)
        
        const allActivities = await activityModel.find({ 
            member: { $in: memberIds } 
        })

        const filteredActivities = allActivities.filter(activity => {
            if (!startDate && !endDate) return true
            
            const activityDate = activity.date.toISOString().split('T')[0]
            
            if (startDate && endDate) {
                return activityDate >= startDate && activityDate <= endDate
            } else if (startDate) {
                return activityDate >= startDate
            } else if (endDate) {
                return activityDate <= endDate
            }
            return true
        })

        const totalHours = filteredActivities.reduce((sum, a) => sum + a.hours, 0)
        const activityBreakdown = aggregateActivitiesByType(filteredActivities)
        const uniqueTags = getUniqueTags(filteredActivities)

        return {
            teamId: team.teamId,
            teamName: team.tName,
            totalMembers: members.length,
            totalHours,
            activityBreakdown,
            uniqueTags,
        }
    }))

    const allMemberIds = []
    for (const team of teams) {
        const members = await memberModel.find({ team: team._id })
        allMemberIds.push(...members.map(m => m._id))
    }

    const allCompanyActivities = await activityModel.find({
        member: { $in: allMemberIds }
    })

    const filteredCompanyActivities = allCompanyActivities.filter(activity => {
        if (!startDate && !endDate) return true
        
        const activityDate = activity.date.toISOString().split('T')[0]
        
        if (startDate && endDate) {
            return activityDate >= startDate && activityDate <= endDate
        } else if (startDate) {
            return activityDate >= startDate
        } else if (endDate) {
            return activityDate <= endDate
        }
        return true
    })

    const activitySummaryByType = filteredCompanyActivities.reduce((acc, act) => {
        if (!acc[act.type]) {
            acc[act.type] = { totalHours: 0, members: new Set() }
        }
        acc[act.type].totalHours += act.hours
        acc[act.type].members.add(act.member.toString())
        return acc
    }, {})

    Object.keys(activitySummaryByType).forEach(type => {
        activitySummaryByType[type].members = activitySummaryByType[type].members.size
    })

    return {
        companyId: company.companyId,
        companyName: company.cName,
        teams: teamSummaries,
        activitySummaryByType,
    }
}

export const fetchMemberDetails = async (mId, startDate, endDate) => {
    const member = await memberModel.findOne({memberId: mId})
    if (!member) {
        throw new Error('Member not found')
    }
    const activities = await activityModel.find({member: member._id})
    
    const filteredActivities = activities.filter(activity => {
        if (!startDate && !endDate) return true
        
        const activityDate = activity.date.toISOString().split('T')[0]
        
        if (startDate && endDate) {
            return activityDate >= startDate && activityDate <= endDate
        } else if (startDate) {
            return activityDate >= startDate
        } else if (endDate) {
            return activityDate <= endDate
        }
        return true
    })
    
    const dailyBreakdown = filteredActivities.reduce((acc, act) => {
        const dateKey = act.date.toISOString().split("T")[0]
        
        if (!acc[dateKey]) {
            acc[dateKey] = {
                date: dateKey,
                activities: [],
                hours: 0
            }
        }        
        acc[dateKey].activities.push(act.type)
        acc[dateKey].hours += act.hours
        return acc
    }, {})

    const totalHours = filteredActivities.reduce((sum, a) => sum + a.hours, 0)
    return {
        memberId: member.mId,
        name: member.mName,
        totalHours,
        dailyBreakdown: Object.values(dailyBreakdown)
    }
}

export const addActivity = async (memberId, activityData) => {
    const member = await memberModel.findOne({ memberId: memberId })
    if (!member) {
        throw new Error('Member not found')
    }
    
    const normalizedTags = Array.isArray(activityData.tags) 
        ? activityData.tags 
        : (activityData.tags ? [activityData.tags] : [])
    
    const existingActivity = await activityModel.findOne({
        member: member._id,
        type: activityData.type
    })

    
    if (existingActivity) {
        const existingDate = existingActivity.date.toISOString().split('T')[0]
        console.log(existingDate)
        const newDate = new Date(activityData.date).toISOString().split('T')[0]
        console.log(newDate)
        
        if (existingDate === newDate) {
            existingActivity.hours += activityData.hours            
            if (normalizedTags.length > 0) {
                const existingTags = existingActivity.tags || []
                const newTags = normalizedTags.filter(tag => !existingTags.includes(tag))
                existingActivity.tags = [...existingTags, ...newTags]
            }            
            await existingActivity.save()
            
            return {
                memberId: memberId,
                date: existingActivity.date,
                type: existingActivity.type,
                hours: existingActivity.hours,
                tags: existingActivity.tags,
            }
        }
    }    
    
    const newActivity = new activityModel({
        member: member._id,
        date: new Date(activityData.date),
        type: activityData.type,
        hours: activityData.hours,
        tags: normalizedTags
    })

    await newActivity.save()    
    return {
        memberId: memberId,
        date: newActivity.date,
        type: newActivity.type,
        hours: newActivity.hours,
        tags: newActivity.tags,
    }
}
