import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  CITIZEN = 'CITIZEN',
  OPERATOR = 'OPERATOR',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({
    required: true,
  })
  passwordHash!: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.CITIZEN,
  })
  role!: UserRole;

  @Prop({
    type: [String],
    default: [],
  })
  zones!: string[];

  @Prop({
    type: String,
    default: null,
  })
  refreshTokenHash?: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);