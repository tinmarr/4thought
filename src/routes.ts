import express from "express";

export const router = express.Router();

router.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

router.get("/editor", (req, res) => {
    res.render("editor", { title: "Editor" });
});

router.get("/user", (req, res) => {
    res.render("authPage", { title: "Login", newUser: false });
});

router.post("/user", (req, res) => {
    let email: string = req.body.email;
    let password: string = req.body.password;
    let name: string | null = null;
    if (req.body.newUser == "on") {
        name = req.body.name;
    }
    res.send(`name: ${name} ------ email:${email} ------ password:${password}`);
});
