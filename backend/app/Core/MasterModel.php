<?php

namespace App\Core;

use Illuminate\Support\Facades\DB;
use App\Traits\MessagesTrait;

class MasterModel
{

	use MessagesTrait;

    function totalDecimals(string $amount, $add = 0) {
        $result = 0;
        if(strlen($amount) > 0) {
            $value = substr($amount, strpos($amount, ".") + 1);
            for ($i=0; $i < strlen($value); $i++) {
                $n  = substr($value,$i,1);
                if(intval($n) > 0){
                    $result += 1;
                }
            }
            if($result == 0) {
                $result = $add;
            }
        }else {
            $result	= 2;
        }
        return $result;
    }

    public function uploadFileData($data,$path){
        $fileSize    = file_put_contents($path, $data);
		if ($fileSize > 0) {
            $name   = basename($path);
            $format = pathinfo($path, PATHINFO_EXTENSION);
			$request = array(
                'success'       => TRUE,
                'name'          => $name,
                'format'        => $format,
				'size'			=> round((($fileSize/1024)/1024),3)
			);
        }else{
            $request = array(
                'success'       =>FALSE
			);
        }
        return json_encode($request);
    }

}
