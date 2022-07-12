<?php

namespace App\Jobs\BillingBatch;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ValidateBillingByBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public $company
    )
    {}

    public function handle(): void
    {
        $sales                  = DB::table('sales_master')
            ->where('company_id', $this->company->id)
            ->where('billing_by_batch', 1)
            ->where('invoice_type_id', 7)
            ->where('status', '!=', 1)
            ->limit(200)
            ->get();
        foreach ($sales as  $record) {
            // Envía la factura a la DIAN
            SendBillingBatchJob::dispatch($record)->afterResponse();
        }
    }
}
