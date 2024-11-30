import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWhiteboard extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  name: string;
  data: string;
  owner: Types.ObjectId;
  sharedWith: Types.ObjectId[];
}

const WhiteboardSchema = new Schema<IWhiteboard>(
  {
    name: { type: String, required: true },
    data: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Whiteboard = mongoose.model<IWhiteboard>('Whiteboard', WhiteboardSchema);
