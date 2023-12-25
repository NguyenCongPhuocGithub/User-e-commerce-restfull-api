const express = require('express');
const router = express.Router();

const { validateSchema } = require("../../utils");
const {verificationMailSchema} = require("./validation");

const {verificationMail} = require("./controller");

router
    .route("/verificationMail")
    .post(
        validateSchema(verificationMailSchema),
        verificationMail
    )
    
module.exports = router;