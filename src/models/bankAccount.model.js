import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ifscCode: {
        type: String,
        required: true,
    },
    branchName: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    }
});

// Unique combination of user, bank, branch, and account number
bankAccountSchema.index(
    { user: 1, bankName: 1, branchName: 1, accountNumber: 1 },
    { unique: true }
);

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

export default BankAccount;
