<?php
namespace App\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

trait SessionTrait {
    static function sessionDelete(){
        session()->invalidate();
    }

    static function sessionCreate($data = [] ){
        foreach ($data as $key => $value){
            Session::put($key, $value);
        }
        Session::save();
        Session::start();
    }

    static function getDatabase(){
        $user   = Auth::user();
        return $user->database;
    }

    static function getSessionId($key = null) {
        $data = null;
        if($key){
            $data   = session()->get($key);
        }
        return $data;
    }
}
