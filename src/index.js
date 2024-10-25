import express from "express"
import cors from "cors"
import {configDotenv} from "dotenv"
import mongoose from "mongoose"
import User from "./models/user.model.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import authenticateToken from "./middlewares/auth.middleware.js"
import BankAccount from "./models/bankAccount.model.js"
import adminAuthenticateToken from "./middlewares/admin.auth.middleware.js"

configDotenv()

const app = express()

app.use(express.json())
app.use(cors())

//User Routes
app.post("/register", async (req, res) => {
    const {username, email, password} = req.body

    try {
        const existingUser = await User.findOne({email})
        //Existing User
        if(existingUser){
            return res.status(400).send("User already exists with this email")
        }

        //New User
        const user = new User({
            username,
            email,
            password,
        })
        await user.save()

        const token = jwt.sign({
            isAdmin: user.isAdmin,
            id: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        });

        res.status(200).send({user, token})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.post("/login", async(req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.findOne({email})

        if(!user){
            return res.status(404).send("User not found")
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
            return res.status(400).send("Invalid credentials")
        }

       const token = jwt.sign({
            isAdmin: user.isAdmin,
            id: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        });
        res.status(200).send({user, token})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//get bank details
app.get("/bank-details", authenticateToken, async (req, res) => {
    const { id } = req.user; // Use req.user.id

    try {
        const bankDetails = await BankAccount.find({ user: id });
        res.status(200).send(bankDetails);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//add bank details
app.post("/add-bank-details", authenticateToken, async(req, res) => {
    const {user_id, ifscCode, branchName, bankName, accountNumber, accountHolderName} = req.body

    try {
        const bankDetails = new BankAccount({
            user: user_id,
            ifscCode,
            branchName,
            bankName,
            accountNumber,
            accountHolderName
        })

        await bankDetails.save()
        res.status(200).send("Bank Account added successfully")

    } catch (error) {
        res.status(400).send(error.message)
    }
})

//update bank details
app.put("/update-bank-details/:id", authenticateToken, async(req, res) => {
    const {id} = req.params
    const {user_id, ifscCode, branchName, bankName, accountNumber, accountHolderName} = req.body

    try {
        const bankDetails = await BankAccount.findByIdAndUpdate(id, {
            user: user_id,
            ifscCode,
            branchName,
            bankName,
            accountNumber,
            accountHolderName
        })
        await bankDetails.save()
        res.status(200).send("Bank Account updated successfully")
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//delete bank details
app.delete("/delete-bank-details/:id", authenticateToken, async(req, res) => {
    const {id} = req.params

    try {
        const result = await BankAccount.findByIdAndDelete(id)
        res.status(200).send("Bank Account deleted successfully")
    } catch (error) {
        res.status(400).send(error.message)
    }

})

//admin routes
app.get("/admin", adminAuthenticateToken , async(req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);    
    } catch (error) {
        res.status(400).send(error.message);
    }
})

//admin get bank details of users
app.get("/admin/:id", adminAuthenticateToken, async(req, res) => {
    const {id} = req.params

    try {
        const result = await BankAccount.find({user: id})
        res.status(200).send(result)
    } catch (error) {
        res.status(400).send(error.message)
    }
})


const port = process.env.PORT || 8081

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB")
        app.listen(port, () => {
        console.log(`Server is running http://localhost:${port}`)
    })
})
.catch((error) => {
    console.log("Error connecting to MongoDB", error)
})