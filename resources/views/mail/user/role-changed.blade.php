<x-mail::message>
Hello {{ $user->name }},

@if ($user->is_admin)
You are now an admin in the system. You can add and deactivate users.
@else
Your role was changed to a regular user. You are no longer able to add or deactivate users.
@endif

<x-mail::button :url="route('login')">
    Click here to login
</x-mail::button>

Thank you, <br>
{{ config('app.name') }}
</x-mail::message>
