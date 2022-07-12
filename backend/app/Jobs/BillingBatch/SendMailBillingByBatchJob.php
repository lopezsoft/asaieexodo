<?php

namespace App\Jobs\BillingBatch;

use App\Modules\ElectronicDocuments\Invoices;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendMailBillingByBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public $record
    )
    {}

    public function handle(): void
    {
        // Envía los correos
        (new Invoices())->sendMail($this->record->id);
    }
}
