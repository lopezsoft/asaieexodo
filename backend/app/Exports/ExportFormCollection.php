<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Style;
use Maatwebsite\Excel\Concerns\WithDefaultStyles;

class ExportFormCollection implements FromCollection, WithDefaultStyles, WithHeadings
{
    public function __construct(
        public $data,
    ) {}
    /**
    * @return Collection
    */
    public function collection(): Collection
    {
        return collect($this->data->collection);
    }

    public function defaultStyles(Style $defaultStyle)
    {

        // Or return the styles array
        return [
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
            ],
        ];
    }

    public function headings(): array
    {
        return $this->data->headers;
    }
}
