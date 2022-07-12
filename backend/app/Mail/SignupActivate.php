<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SignupActivate extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $msg;
    public $subject = "Registro de usuario";

    public function __construct($message)
    {
        $this->msg  = $message;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('mail.register');
    }
}
