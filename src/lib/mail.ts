import { SMTP_PASSWORD, SMTP_SERVER, SMTP_USER } from "$env/static/private";
import * as nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { error, log } from "./util";

export async function sendMail(options: Mail.Options) {
	log(`sending email to ${options.to}`);
	if (!options.to) error("email is undefined");

	let transporter = nodemailer.createTransport({
		host: SMTP_SERVER,
		port: 587,
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASSWORD,
		},
	});
	let info = await transporter.sendMail(options);
	console.log("Message sent: %s", info.messageId);
}
