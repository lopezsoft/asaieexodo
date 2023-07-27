<?php

namespace App\View\Components\Notes;

use App\Queries\CallExecute;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class AverageArea extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct(
        public $db,
        public $year,
        public $enrolledId,
        public $areaId,
        public $gradeId,
    )
    {

    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        $year       = $this->year;
        $db         = $this->db;
        $enrolledId = $this->enrolledId;
        $areaId     = $this->areaId;
        $gradeId    = $this->gradeId;
        $data       = CallExecute::execute($db.'sp_prom_area_final(?, ?, ?, ?)', [$year, $enrolledId, $areaId, $gradeId]);
        $data       = [
            'dataArea'  => $data[0],
        ];
        return      view('components.notes.average-area', $data);
    }
}
