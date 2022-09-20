const jwt = require("jsonwebtoken")

const userModel = require("../models/userModel")
const { isValidMail, isValid, isValidName, isValidRequestBody, isValidfild, isValidMobile, isValidPassword } = require("../validator/validation")


const createUser = async function (req, res) {
    try {
        let data = req.body

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, msg: " body cant't be empty Please enter some data." })

        const { title, name, phone, email, password, address } = data

        if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is required" })
        if (!isValid(name)) return res.status(400).send({ status: false, message: "name is  required" })
        if (!isValid(email)) return res.status(400).send({ status: false, message: "mail id is required" })
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone no. is required" })

        if (!(["Mr", "Mrs", "Miss"].includes(title))) return res.status(406).send({
            status: false, msg: "you can use only [Mr, Mrs, Miss] in title"
        })

        if (!isValidName.test(name)) return res.status(406).send({
            status: false, msg: "Enter a valid name",
            validname: "length of name has to be in between (3-20)  , use only String "
        })

        if (!isValidMail.test(email)) return res.status(406).send({
            status: false, msg: "email id is not valid",
            ValidMail: "email must be contain ==> @  Number  ."
        })

        if (!isValidMobile.test(phone)) return res.status(406).send({
            status: false, message: "mobile no. is not valid",
            ValidMobile: "it must be 10 digit Number & it should be a indian mobile no."
        })

        let uniquePhone = await userModel.findOne({ phone: phone })
        if (uniquePhone) return res.status(409).send({ status: false, message: "phone no. Already Exists." })//(409)it is use for the conflict

        let uniqueEmail = await userModel.findOne({ email: email })
        if (uniqueEmail) return res.status(409).send({ status: false, message: "email Id Already Exists." })//(409)it is use for the conflict



        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" })
        if (!isValidPassword(password)) return res.status(406).send({
            status: false, message: "enter valid password  ",
            ValidPassWord: "passWord in between(8-15)& must be contain ==> upperCase,lowerCase,specialCharecter & Number"
        })

        if (address) {
            if (!isValidfild(address.street)) return res.status(400).send({ status: false, message: "please enter street " })
            if (!isValidfild(address.city)) return res.status(400).send({ status: false, message: "please enter city" })
            if (!isValidfild(address.pincode)) return res.status(400).send({ status: false, message: "please enter pincode" })
            if (address.pincode) {
                //const validPin=(/^[1-9]{1}[0-9]{2}\\s{0, 1}[0-9]{3}$/)
                if (!(/^\d{6}$/).test(address.pincode)) return res.status(400).send({ status: false, message: "please enter valied pincode " })
            }

        }

        const userData = {
            title, name, phone, email, password, address
        }

        let savedData = await userModel.create(userData)
        res.status(201).send({ status: true, message: "Success", data: savedData })

    }
    catch (error) {
        res.status(500).send({ msg: error.message });
    }
};

//-------------Login-------------------------------------------------//
const loginUser = async function (req, res) {

    try {
        if (!isValidRequestBody(req.body)) return res.status(400).send({ status: false, message: "request body can't be empty enter some data." })
        let email = req.body.email
        if (!email) return res.status(400).send({ status: false, msg: "email required" })
        if (!isValidMail.test(email)) return res.status(400).send({ status: false, msg: "enter a valied email" })

        let password = req.body.password
        if (!isValid(password)) return res.status(400).send({ status: false, msg: "password is required" })

        let verifyUser = await userModel.findOne({ email: email, password: password })
        if (!verifyUser) {
            return res.status(400).send({ status: false, msg: "email or password is incorrect" })
        }

        let token = jwt.sign(
            {
                UserId: verifyUser._id.toString(),
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60*3
            },
            "project-bookmanagment-group53"
        );
        res.status(201).send({ status: true, msg: "You are successFully LogedIn", token: token })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
};

module.exports = { loginUser, createUser }

