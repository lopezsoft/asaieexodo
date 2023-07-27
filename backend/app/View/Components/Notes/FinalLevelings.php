<?php

namespace App\View\Components\Notes;

use App\Queries\CallExecute;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class FinalLevelings extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct(
        public $db,
        public $year,
        public $enrolledId,
    )
    {
        //
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        $year       = $this->year;
        $db         = $this->db;
        $enrolledId = $this->enrolledId;
        $data       = CallExecute::execute($db.'sp_select_respeciales_est(?, ?)', [$year, $enrolledId]);
        $data       = [
            'levelingData'  => $data,
        ];
        return view('components.notes.final-levelings', $data);
    }
}
