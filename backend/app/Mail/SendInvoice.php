<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendInvoice extends Mailable
{
    use Queueable, SerializesModels;

    public $msg;
    public $subject = "Registro de empresas";
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($message)
    {
        $this->msg      = $message;
        $this->subject  = $message->subject;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        if(strlen($this->msg->file_name) > 0) {
            return $this->from($this->msg->email, $this->msg->voucher_name)
                        ->attach($this->msg->file_xml)
                        ->view('email.send_invoice');
        }else{
            return $this->from($this->msg->email, $this->msg->voucher_name)
                        ->view('email.send_invoice');

        }
    }
}
