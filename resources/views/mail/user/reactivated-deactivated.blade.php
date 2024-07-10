<x-mail::message>
Hello {{ $user->name }},

@if ($user->blocked_at)
Your account has been deactivated. You are no longer be able to login.
@else
Your account has been reactivated. You can now use the system.
<x-mail::button {{ route('login') }}>
    Click here to login
</x-mail::button>
@endif

Thank you, <br>
{{ config('app.name') }}
</x-mail::message>
