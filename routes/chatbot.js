const router = require("express").Router();
const botController = require("../controllers/BotController");

router.post("/chatbot",botController.receiveMessages);
router.post("/chatbot/fb",botController.callbackMessage);
router.get("/chatbot/fb",botController.verifyToken);
module.exports = router;