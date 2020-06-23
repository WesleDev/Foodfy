const nodemailer = require("nodemailer")

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: " ", /* seu user do mailer */
    pass: " ", /* seu pass do mailer */
  },
})
