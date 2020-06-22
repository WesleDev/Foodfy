const nodemailer = require("nodemailer")

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "5e0b9e5514370e",
    pass: "65c273cd7e6a04",
  },
})
