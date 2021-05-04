export interface Note {
  _id: string;
  createdOn: string;
  updatedOn: string;
  deleted?: {
    deletedOn: string;
    user: string;
  };
  content: string;
  locked: boolean;
  user: string;
}
