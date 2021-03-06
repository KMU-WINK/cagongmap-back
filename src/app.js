import express from "express";
import { apiRouter } from "src/api/route";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', apiRouter);
