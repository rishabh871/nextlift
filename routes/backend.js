module.exports = function({server,app,dev}){
    server.get("/admin/dashboard",(req,res) => app.render(req,res,"/Private/Dashboard"));
    server.get("/admin/profile",(req,res) => app.render(req,res,"/Private/Profile"));
    server.get("/admin/change-password",(req,res) => app.render(req,res,"/Private/ChangePassword"));
    server.get("/admin/users",(req,res) => app.render(req,res,"/Private/UserManagement"));
    server.get("/admin/memberships",(req,res) => app.render(req,res,"/Private/Memberships/List"));
    server.get("/admin/memberships/edit/:slug",(req,res) => app.render(req,res,"/Private/Memberships/Edit"));
    server.get("/admin/transactions",(req,res) => app.render(req,res,"/Private/Transactions/List"));
    server.get("/admin/pages",(req,res) => app.render(req,res,"/Private/Pages/List"));
    server.get("/admin/pages/add",(req,res) => app.render(req,res,"/Private/Pages/Add"));
    server.get("/admin/pages/edit/:slug",(req,res) => app.render(req,res,"/Private/Pages/Edit"));
    server.get("/admin/pages/editor/:slug",(req,res) => app.render(req,res,"/Private/Pages/Editor"));
    server.get("/admin/faqs",(req,res) => app.render(req,res,"/Private/Faqs"));
    server.get("/admin/stop-words",(req,res) => app.render(req,res,"/Private/StopWords"));
}