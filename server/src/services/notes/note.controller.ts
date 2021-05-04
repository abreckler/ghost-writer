import { Request, Response, NextFunction } from 'express';
import mockNotes from './mockNotes';
import { getNoteById } from "./note.service";

export const fetchAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json({ notes: mockNotes(100) });
  } catch (error) {
    next(error);
  }
};

export const fetchAFew = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json({ results: mockNotes(2) });
  } catch (error) {
    next(error);
  }
};

export const fetchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id: string = req.params.id as string;
    const note = await getNoteById(id);
    return res.status(200).json({ results: note, id });
  } catch (error) {
    next(error);
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("deleteById deleteById deleteById")
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};
export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("updateNote updateNote updateNote updateNote");
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};