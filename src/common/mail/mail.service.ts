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
<<<<<<< HEAD
        from: `"MWaeed" <${process.env.EMAIL_USER}>`,
=======
        from: `"ComplaintsApp" <${process.env.EMAIL_USER}>`,
>>>>>>> 6abb47f4f25adbda3b8d4ba7d3be2622571b2209
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`,
      });
    }


<<<<<<< HEAD
  async sendRejectionEmail(email: string, reason: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"MWaeed" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your request has been rejected.',
      text: `Reason for rejection: ${reason}`,
    });
  }
=======
  // async sendRejectionEmail(email: string, reason: string): Promise<void> {
  //   await this.transporter.sendMail({
  //     from: `"ComplaintsApp" <${process.env.EMAIL_USER}>`,
  //     to: email,
  //     subject: 'Your request has been rejected.',
  //     text: `Reason for rejection: ${reason}`,
  //   });
  // }
>>>>>>> 6abb47f4f25adbda3b8d4ba7d3be2622571b2209

  }
