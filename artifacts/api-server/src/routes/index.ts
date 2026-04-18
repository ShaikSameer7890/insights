import { Router, type IRouter } from "express";
import healthRouter from "./health";
import creatorsRouter from "./creators";
import campaignsRouter from "./campaigns";
import applicationsRouter from "./applications";
import analyticsRouter from "./analytics";
import messagesRouter from "./messages";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(creatorsRouter);
router.use(campaignsRouter);
router.use(applicationsRouter);
router.use(analyticsRouter);
router.use(messagesRouter);
router.use(paymentsRouter);

export default router;
