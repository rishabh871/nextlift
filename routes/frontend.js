module.exports = function({server,app,dev}){
    server.get("/",(req,res) => app.render(req,res,"/Public/Home"));
    server.get("/payment",(req,res) => app.render(req,res,"/Private/Payment"));
    server.get("/user/my-account",(req,res) => app.render(req,res,"/Private/MyAccount"));
    server.get("/user/profile",(req,res) => app.render(req,res,"/Private/Profile"));
    server.get("/user/change-password",(req,res) => app.render(req,res,"/Private/ChangePassword"));
    server.get("/user/change-plan",(req,res) => app.render(req,res,"/Private/ChangePlan"));
    
    server.get("/login",(req,res) => app.render(req,res,"/Auth/Login"));
    server.get("/forgot",(req,res) => app.render(req,res,"/Auth/Forgot"));
    server.get("/reset/:token",(req,res) => app.render(req,res,"/Auth/ResetPassword"));
    server.get("/register",(req,res) => app.render(req,res,"/Auth/Register"));

    server.get("/many-request",(req,res) => app.render(req,res,"/Common/ManyRequest"));
    server.get("/forbidden",(req,res) => app.render(req,res,"/Common/Forbidden"));
    server.get("/expired",(req,res) => app.render(req,res,"/Common/ExpiredLink"));
    server.get("/not-found",(req,res) => app.render(req,res,"/Common/NotFound"));
    server.get("/:slug",(req,res) => app.render(req,res,"/Public/Page"));
    server.get("*",(req,res) => app.render(req,res,"/Common/NotFound"));
}