export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  //   Virtual Attribute
  age: number;
}

export interface INewUserRequestBody {
  _id: string;
  name: string;
  email: string;
  photo: string;
  gender: string;
  dob: Date;
}
