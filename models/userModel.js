import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    profilePhoto: { type: String, default: 'Profile Pic' },
});

const User = mongoose.model('User', userSchema);

export default User;
