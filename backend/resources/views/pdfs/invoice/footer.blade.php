<footer id="footer">
    <hr style="margin-bottom: 4px;">
    <p id='mi-texto'>Factura No: {{$resolution->prefix}} - {{$request->number}} - Fecha y Hora de Generacion: {{$date}} - {{$time}}<br> CUFE: <strong>{{$cufecude}}</strong></p>
    @if(isset($request->foot_note))
        <p id='mi-texto-1'><strong>{{$request->foot_note}}</strong></p>
    @endif
</footer>
