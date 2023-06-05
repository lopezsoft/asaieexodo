<?php
namespace App\Contracts\Auth;

Interface Authentication extends AuthenticationRegisterContract, AuthenticationLoginContract, AuthenticationLogoutContract{
}
