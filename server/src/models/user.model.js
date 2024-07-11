import mongoose from "mongoose";
import  bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true , "name is required"],
        trim:true,
        minLength:[4 , "Name must be atleast 4 characters"],
        maxLength:[15 , "Name should be not more than 15 characters"],
        lowercase:true
    },
    email:{
        type:String,
        required:[true , "email is required"],
        unique:true,
        trim:true,
        lowercase:true,

    },
    password:{
        type:String,
        required:[true , "password is required"],
        minLength:[8 , "Password must be atleast 8 characters"],
        maxLength:[50 , "Password should be not more than 50 characters"],
        select:false
    },
    avatar:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },
    role:{
        type:String,
        enum:["USER" , "ADMIN"],
        default:"USER"
    },
    forgotPasswordToken:String,
    forgotPasswordExpire:Date,


}, {timestamps:true})

userSchema.pre('save' , async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password =  await bcrypt.hash(this.password , 10)
})

userSchema.methods={
    generateJWTToken:  function () {
        let payload = {id:this._id , email:this.email , subscription: this.subscription , role:this.role  }
        return  jwt.sign(payload , process.env.JWT_SECRET, {expiresIn:process.env.JWT_EXPIRY})
    },
    comparePassword: async function (password) {
        return await bcrypt.compare(password ,this.password)
    }
}

export const User = mongoose.models.User ||  mongoose.model("User" , userSchema)
