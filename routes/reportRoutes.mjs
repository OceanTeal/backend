import express from 'express'
import {getOverView, getCompanyOverview, getMemberOverview, createActivity} from "../controllers/reportController.mjs"

const router = express.Router()

router.get("/report/overview", getOverView);
router.get("/report/company/:companyId",getCompanyOverview)
router.get("/report/member/:memberId",getMemberOverview)
router.post('/activity', createActivity);

export default router