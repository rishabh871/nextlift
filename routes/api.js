const router = require("express").Router();
const fileUpload = require("express-fileupload");
const profileController = require("../controllers/ProfileController");
const userController = require("../controllers/UserController");
const pageController = require("../controllers/PageController");
const planController = require("../controllers/PlanController");
const faqsController = require("../controllers/FaqsController");
const stopWordController = require("../controllers/StopWordController");
const transactionController = require("../controllers/TransactionController");
const mediaController = require("../controllers/MediaController");

const {profileValidate,changePasswordValidate,cardValidate,billingAddressValidate,bySlugValidate,byIdValidate,statusValidate,userValidate,pageValidate,linkValidate,planValidate,faqValidate,stopWordValidate,freePlanValidate,premiumPlanValidate} = require("../validator/Api");

router.get("/profile",profileController.view);
router.post("/profile",fileUpload({limits:{fileSize:10*1024*1024}}),profileValidate,profileController.update);
router.post("/change-password",changePasswordValidate,profileController.changePassword);
router.get("/memberships",profileController.memberships);
router.get("/user-cards",profileController.userCards);
router.post("/change-card",cardValidate,profileController.changeCard);
router.post("/change-billing-address",billingAddressValidate,profileController.changeBillingAddress);
router.get("/subscription/cancel",profileController.cancelSubscription);

router.post("/user-free-plan",freePlanValidate,profileController.freePlan);
router.post("/user-premium-plan",premiumPlanValidate,profileController.premiumPlan);

router.get("/users/lists",userController.lists);
router.post("/users/add-or-update",fileUpload({limits:{fileSize:10*1024*1024}}),userValidate,userController.addUpdate);
router.post("/users/status",statusValidate,userController.status);
router.delete("/users/delete/:slug",bySlugValidate,userController.delete);

router.get("/pages/lists",pageController.lists);
router.post("/pages/add-or-update",pageValidate,pageController.addUpdate);
router.get("/pages/view/:slug",bySlugValidate,pageController.view);
router.post("/pages/status",statusValidate,pageController.status);
router.delete("/pages/delete/:slug",bySlugValidate,pageController.delete);

router.get("/memberships/lists",planController.lists);
router.post("/memberships/add-or-update",fileUpload({limits:{fileSize:10*1024*1024}}),planValidate,planController.addUpdate);
router.get("/memberships/view/:slug",bySlugValidate,planController.view);
router.post("/memberships/status",statusValidate,planController.status);
router.delete("/memberships/delete/:slug",bySlugValidate,planController.delete);

router.get("/faqs/lists",faqsController.lists);
router.post("/faqs/add-or-update",faqValidate,faqsController.addUpdate);
router.get("/faqs/view/:slug",bySlugValidate,faqsController.view);
router.post("/faqs/status",statusValidate,faqsController.status);
router.delete("/faqs/delete/:slug",bySlugValidate,faqsController.delete);

router.get("/stop-words/lists",stopWordController.lists);
router.post("/stop-words/add-or-update",stopWordValidate,stopWordController.addUpdate);
router.delete("/stop-words/delete/:id",byIdValidate,stopWordController.delete);

router.get("/transactions/lists",transactionController.lists);

router.post("/media/upload",fileUpload({limits: {fileSize: 5000*1024*1024}}),mediaController.upload);
router.delete("/media/delete/:mediaId",mediaController.delete);

module.exports = router;