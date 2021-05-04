import { Request, Response, NextFunction } from 'express';
import axios from "axios";
import errors from "../../lib/errors";


const getShip = async (id: number | string)  => {
  try {
    return await axios.get(`https://swapi.dev/api/starships/${id}/`);
  } catch (err) {
    throw new errors.NotFoundError(err.message);
  }
}

export const getShipById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id || 9;
    const response = await getShip(id);
    res.status(200).json({ data: response.data });
  } catch (err) {
    next(err);
  }
}
