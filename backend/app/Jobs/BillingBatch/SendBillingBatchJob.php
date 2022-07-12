<?php

namespace App\Jobs\BillingBatch;

use App\Modules\ElectronicDocuments\Invoices;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendBillingBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public $record
    )
    {}

    public function handle()
    {
        (new Invoices())->sendInvoice($this->record->id);
    }
}
