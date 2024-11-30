import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

interface FavoriteWhiteboard {
  imageData: string;
  date: Date;
}

export interface IUser extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  username: string;
  password: string;
  friends: Types.ObjectId[];
  savedWhiteboards: Types.ObjectId[];
  comparePassword: (password: string) => Promise<boolean>;
  favorites?: FavoriteWhiteboard[];
}


const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    savedWhiteboards: [{ type: Schema.Types.ObjectId, ref: 'Whiteboard' }],
    favorites: [
      {
        imageData: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error as any);
  }
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
