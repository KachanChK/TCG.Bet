import withdrawFundsRoute from "./routes/withdrawFundsRoute";
import evaluateEventRoute from "./routes/evaluateEventRoute";
import deleteEventRoute from "./routes/deleteEventRoute";
import getMyEventsRoute from "./routes/getMyEventsRoute";
import finishEventRoute from "./routes/finishEventRoute";
import getEventsRoute from "./routes/getEventsRoute";
import tokenAuthRoute from "./routes/tokenAuthRoute";
import getWalletRoute from "./routes/getWalletRoute";
import express, { Request, Response } from "express";
import addFundsRoute from "./routes/addFundsRoute";
import addEventRoute from "./routes/addEventRoute";
import betEventRoute from "./routes/betEventRoute";
import signUpRoute from "./routes/signUpRoute";
import loginRoute from "./routes/loginRoute";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "../public")));

app.use("/auth", tokenAuthRoute);

app.use("/mod", evaluateEventRoute);
app.use("/mod", finishEventRoute);

app.use("/account", signUpRoute);
app.use("/account", loginRoute);
app.use("/account", getWalletRoute);
app.use("/account", addFundsRoute);
app.use("/account", withdrawFundsRoute);


app.use("/event", addEventRoute);
app.use("/event", deleteEventRoute);
app.use("/event", getEventsRoute);
app.use("/event", getMyEventsRoute);
app.use("/event", betEventRoute);


app.get("/homepage", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/homepage.html"));
});

app.get("/wallet", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/wallet.html"));
});

app.get("/myEvents", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/myEvents.html"));
});

app.get("/signUp", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/signUp.html"));
});

app.get("/login", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
