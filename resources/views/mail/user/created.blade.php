<x-mail::message>
Hello {{ $user->name }},

Welcome to VQChat!

**Here is your login information:** <br>
Email: {{ $user->email }} <br>
Password: {{ $password }}

Please login to the system and change your password.

<x-mail::button url="{{ route('login') }}">
    Click here to login
</x-mail::button>

Thank you, <br>
{{ config('app.name') }}

</x-mail::message>
