const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")
const mongoose = require('mongoose')
const moment=require('moment')

const { isValid, isValidRequestBody,isValidfild,isValidName, validDate,validRating } = require("../validator/validation")


const createReview = async function (req, res) {
try {
    const bookId=req.params.bookId
                          
    if (!mongoose.isValidObjectId(bookId)) return res.status(406).send({ status: false, message: `${bookId} This bookId is not ObjectId type` })

    const data = req.body
        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: " body cant't be empty Please enter some data." })

        const { reviewedBy,reviewedAt,rating,review,isDeleted} = data

        const validBook = await bookModel.findOne({isDeleted:false,_id:bookId})
        if (!validBook) return res.status(400).send({ status: false, message: `Book not found by this ${bookId} Id ` })

         data["bookId"]=bookId
        if(reviewedBy){
            if (!isValidName.test(reviewedBy)) return res.status(406).send({
                status: false, msg: "Enter a valid reviewer Name",
                validname: "length of name has to be in between (3-20), use only String"
            })
        }else{ data["reviewedBy"]='Guest' }
        if (!isValid(rating)) return res.status(400).send({ status: false, message: "rating is  required" })
        if (!isValidfild(review)) return res.status(400).send({ status: false, message: "review can't be a empty String " })
                                 

        if(reviewedAt){
            if (!validDate.test(reviewedAt)) return res.status(406).send({ status: false, message: 'Plese enter a  release Date YYYY-MM-DD format' })
        }else{  data["reviewedAt"]=moment().format('YYYY MM DD')}

        if(!validRating.test(rating) ) return res.status(400).send({ status: false, message: `${rating} This was not a valid rating,rating this book in between 1-5 ` })


        if (isDeleted == true) return res.status(400).send({ status: false, message: "you can't delete a review while creating" })

      const reviewData= await reviewModel.create(data)
      let updatebook=await bookModel.findByIdAndUpdate({_id:bookId},{$inc:{reviews:+1}},{new:true})
       updatebook._doc["reviewsData"]=reviewData
      res.status(201).send({status:true,message:"you review Was recorded",data:updatebook})

} catch (error) {
    res.status(500).send({status:false,message:error.message})
}
}


const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let data = req.body
        const { review, rating, reviewedBy } = data


        if (!mongoose.isValidObjectId(bookId)) return res.status(406).send({ status: false, message: `${bookId} This bookId is not ObjectId type` })

        if (!mongoose.isValidObjectId(reviewId)) return res.status(406).send({ status: false, message: `${reviewId} This reviewId is not ObjectId type` })

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: " body cant't be empty Please enter some data." })

        const book = await bookModel.findOne({ bookId: bookId, isDeleted: false })
        if (!book) return res.status(404).send({ status: false, message: "BookId is not found" })


        if (!isValidfild(review)) return res.status(400).send({ status: false, message: "review is  required" })

        if (reviewedBy) {
            if (!isValidName.test(reviewedBy)) return res.status(406).send({
                status: false, msg: "Enter a valid reviewer Name",
                validname: "length of name has to be in between (3-20)  , use only String "
            })
        }
        if (rating) {
            if (!validRating.test(rating)) return res.status(400).send({ status: false, message: `${rating} This was not a valid rating,rating this book in between 1-5 ` })
        }

        const update = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false, bookId: bookId }, { $set: data }, { new: true })
        if (!update) return res.status(404).send({ status: false, message: "review not found" })

        book._doc["updatedReview"] = update

        res.status(200).send({ status: true, message: "update sucessfully", data: book })


    } catch (err) {

        res.status(500).send({ status: false, message: err.message })
    }
}





const deleteReview= async function(req,res){
    try {
        let bookId=req.params.bookId
let reviewId=req.params.reviewId
                     
if (!mongoose.isValidObjectId(bookId)) return res.status(406).send({ status: false, message: `${bookId} This bookId is not ObjectId type` })
                     
if (!mongoose.isValidObjectId(reviewId)) return res.status(406).send({ status: false, message: `${reviewId} This reviewId is not ObjectId type` })

const validBook = await bookModel.findOne({isDeleted:false,_id:bookId})
        if (!validBook) return res.status(404).send({ status: false, message: `Book not found by this ${bookId} Id ` })


        let deleteReview=await reviewModel.findOneAndUpdate({_id:reviewId,isDeleted:false,bookId:bookId},{isDeleted:true},{new:true})
            if(!deleteReview) return res.status(404).send({status: false, message: `review is not found` })


        let updatebook=await bookModel.findByIdAndUpdate({_id:bookId},{$inc:{reviews:-1}},{new:true})


  res.status(200).send({status:true,message:"review successfully deleted"})





    } catch (error) {
        res.status(500).send({status:false,message:error.message})
    }

}


module.exports={createReview,updateReview,deleteReview}