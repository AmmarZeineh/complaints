  import { Injectable } from '@nestjs/common';
  import * as nodemailer from 'nodemailer';

  @Injectable()
  export class MailerService {
    private transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    async sendVerificationCode(email: string, code: string) {
      await this.transporter.sendMail({

        from: `"ComplaintsApp" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`,
      });
    }



  // async sendRejectionEmail(email: string, reason: string): Promise<void> {
  //   await this.transporter.sendMail({
  //     from: `"ComplaintsApp" <${process.env.EMAIL_USER}>`,
  //     to: email,
  //     subject: 'Your request has been rejected.',
  //     text: `Reason for rejection: ${reason}`,
  //   });
  // }

  }
