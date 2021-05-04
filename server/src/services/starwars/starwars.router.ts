import express from "express";
import versionRouter from '../../lib/versionRouter';
import { getShipById } from "./starwars.controller";

export const starWarsRouter = express.Router();

const getStarShip = new Map().set('apple', getShipById).set('orange', getShipById);
starWarsRouter.get('/starship/:id', versionRouter(getStarShip));
