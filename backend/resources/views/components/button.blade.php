<div class="d-grid gap-2">
    <button {{ $attributes->merge(['type' => 'submit', 'class' => 'btn btn-primary']) }}>
        {{ $slot }}
    </button>
</div>
